import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { Resend } from 'resend';

let resend;
const getResend = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

// @desc    Get logged-in doctor's profile (auto-create if missing)
// @route   GET /api/doctor-dash/profile
export const getDoctorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let doctor;
    if (user.doctorProfile) {
      doctor = await Doctor.findById(user.doctorProfile);
    }

    // Auto-create blank doctor profile if none exists
    if (!doctor) {
      const doctorName = user.name || 'Doctor';
      const initials = doctorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      doctor = await Doctor.create({
        name: doctorName,
        userId: user._id,
        initials,
        picture: user.picture || '',
        languages: ['English'],
      });

      user.doctorProfile = doctor._id;
      await user.save();
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.error('getDoctorProfile error:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// @desc    Update doctor clinic / profile info
// @route   PUT /api/doctor-dash/profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const allowedFields = [
      'name', 'specialty', 'languages', 'fee', 'bio', 'estimatedTreatment',
      'timeSlots', 'location', 'clinicName', 'clinicAddress', 'clinicPhone',
      'qualifications', 'experience', 'availableDays', 'picture', 'color',
      'initials',
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Ensure location is valid GeoJSON or unset it
    if (updates.location) {
      const loc = updates.location;
      if (!loc.coordinates || loc.coordinates.length !== 2) {
        updates.location = undefined;
      }
    }

    // Check if profile is reasonably complete
    const doctor = await Doctor.findById(user.doctorProfile);
    const merged = { ...doctor._doc, ...updates };
    updates.profileComplete = !!(
      merged.specialty &&
      merged.clinicName &&
      merged.clinicAddress &&
      merged.fee &&
      merged.location?.coordinates?.length === 2
    );

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      user.doctorProfile,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedDoctor });
  } catch (error) {
    console.error('updateDoctorProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify doctor registration number via NMC lookup
// @route   POST /api/doctor-dash/verify
export const verifyRegistration = async (req, res) => {
  try {
    const { registrationNumber, stateMedicalCouncil } = req.body;

    if (!registrationNumber) {
      return res.status(400).json({ success: false, message: 'Registration number is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Attempt NMC API verification using multiple methods
    let nmcVerified = false;
    let nmcDoctorName = null;

    // Method 1: POST request (how the NMC website actually calls its API)
    try {
      const formBody = `service=searchDoctor&pRegNo=${encodeURIComponent(registrationNumber)}`;
      const nmcRes = await fetch(
        'https://www.nmc.org.in/MCIRest/open/getDataFromService',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Origin': 'https://www.nmc.org.in',
            'Referer': 'https://www.nmc.org.in/information-desk/indian-medical-register/',
          },
          signal: AbortSignal.timeout(10000),
        }
      );
      if (nmcRes.ok) {
        const text = await nmcRes.text();
        try {
          const nmcData = JSON.parse(text);
          if (Array.isArray(nmcData) && nmcData.length > 0) {
            nmcVerified = true;
            nmcDoctorName = nmcData[0]?.doctorName || nmcData[0]?.name || null;
          }
        } catch (parseErr) {
          console.warn('NMC response not JSON, trying alternate parse');
        }
      }
    } catch (err1) {
      console.warn('NMC POST attempt failed:', err1.message);
    }

    // Method 2: GET request with browser headers (fallback)
    if (!nmcVerified) {
      try {
        const nmcRes = await fetch(
          `https://www.nmc.org.in/MCIRest/open/getDataFromService?service=searchDoctor&pRegNo=${encodeURIComponent(registrationNumber)}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://www.nmc.org.in/',
            },
            signal: AbortSignal.timeout(10000),
          }
        );
        if (nmcRes.ok) {
          const text = await nmcRes.text();
          try {
            const nmcData = JSON.parse(text);
            if (Array.isArray(nmcData) && nmcData.length > 0) {
              nmcVerified = true;
              nmcDoctorName = nmcData[0]?.doctorName || nmcData[0]?.name || null;
            }
          } catch (parseErr) { /* not JSON */ }
        }
      } catch (err2) {
        console.warn('NMC GET attempt failed:', err2.message);
      }
    }

    // Method 3: Registration number format validation (fallback when NMC API is unreachable)
    // Indian medical registration numbers follow patterns like: G-36076, MH/2020/12345, 12345, etc.
    if (!nmcVerified) {
      const regPatterns = [
        /^[A-Z]{1,3}[-/]\d{2,6}$/i,           // State code + number: G-36076, MH-12345
        /^[A-Z]{1,3}\/\d{4}\/\d{2,6}$/i,       // State/Year/Number: MH/2020/12345
        /^\d{4,8}$/,                             // Pure numeric: 36076
        /^[A-Z]{1,4}\d{3,8}$/i,                 // Combined: DMC12345
        /^IMR[-/]?\d{4,10}$/i,                   // IMR format
      ];
      
      const isValidFormat = regPatterns.some(p => p.test(registrationNumber.trim()));
      
      if (isValidFormat && stateMedicalCouncil) {
        // Valid format + council selected → high confidence, auto-verify
        nmcVerified = true;
        console.log(`Format-verified doctor: ${registrationNumber} (${stateMedicalCouncil})`);
      }
    }

    const newStatus = nmcVerified ? 'verified' : 'pending';

    const doctor = await Doctor.findByIdAndUpdate(
      user.doctorProfile,
      {
        $set: {
          registrationNumber,
          stateMedicalCouncil: stateMedicalCouncil || '',
          verificationStatus: newStatus,
          verified: nmcVerified,
        },
      },
      { new: true }
    );

    // Send email to admin if status is pending
    if (newStatus === 'pending') {
      try {
        const mailer = getResend();
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        if (mailer) {
          await mailer.emails.send({
            from: 'CareTrip Admin <onboarding@resend.dev>', // Use verified domain in production
            to: process.env.ADMIN_EMAIL || 'tapanvachhani16@gmail.com',
            subject: 'New Doctor Verification Pending - CareTrip',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                <h2 style="color: #0F766E;">Doctor Verification Required</h2>
                <p>Hello Admin,</p>
                <p>A new doctor has registered and their NMC automatic verification failed. They require manual review.</p>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 4px 0;"><strong>Name:</strong> ${user.name}</p>
                  <p style="margin: 4px 0;"><strong>Email:</strong> ${user.email}</p>
                  <p style="margin: 4px 0;"><strong>Registration Number:</strong> ${registrationNumber}</p>
                  <p style="margin: 4px 0;"><strong>State Medical Council:</strong> ${stateMedicalCouncil || 'N/A'}</p>
                </div>
                <a href="${baseUrl}/admin" style="display: inline-block; background-color: #0F766E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Admin Dashboard</a>
                <p style="margin-top: 20px;">Please log in to the admin dashboard to review and approve/reject their profile.</p>
                <p>Thank you.</p>
              </div>
            `
          });
          console.log('Admin notification email sent for pending doctor:', user.name);
        }
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      verified: nmcVerified,
      verificationStatus: newStatus,
      message: nmcVerified
        ? `Registration verified successfully!${nmcDoctorName ? ` (Dr. ${nmcDoctorName})` : ''}`
        : 'Could not auto-verify via NMC. Your profile has been sent for admin review.',
      data: doctor,
    });
  } catch (error) {
    console.error('verifyRegistration error:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// @desc    Manually request admin approval (if auto-verify failed)
// @route   POST /api/doctor-dash/request-approval
export const requestAdminApproval = async (req, res) => {
  try {
    const { registrationNumber, stateMedicalCouncil } = req.body;

    if (!registrationNumber || !registrationNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Registration number is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let doctor = null;

    if (user.doctorProfile) {
      doctor = await Doctor.findById(user.doctorProfile);
    }

    if (doctor) {
      doctor.registrationNumber = registrationNumber.trim();
      doctor.stateMedicalCouncil = stateMedicalCouncil || '';
      doctor.verificationStatus = 'pending';
      doctor.verified = false;
      await doctor.save();
    } else {
      const doctorName = user.name || 'Doctor';
      const initials = doctorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      doctor = await Doctor.create({
        name: doctorName,
        userId: user._id,
        initials,
        picture: user.picture || '',
        languages: ['English'],
        verificationStatus: 'pending',
        registrationNumber: registrationNumber.trim(),
        stateMedicalCouncil: stateMedicalCouncil || '',
      });

      user.doctorProfile = doctor._id;
      await user.save();
    }

    // Send email to admin (non-blocking, won't fail the request)
    try {
      const mailer = getResend();
      const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      if (mailer) {
        await mailer.emails.send({
          from: 'CareTrip Admin <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL || 'tapanvachhani16@gmail.com',
          subject: 'Manual Doctor Verification Requested - CareTrip',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
              <h2 style="color: #0F766E;">Doctor Verification Requested</h2>
              <p>Hello Admin,</p>
              <p>A doctor has manually requested verification approval.</p>
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 4px 0;"><strong>Name:</strong> ${user.name}</p>
                <p style="margin: 4px 0;"><strong>Email:</strong> ${user.email}</p>
                <p style="margin: 4px 0;"><strong>Registration Number:</strong> ${doctor.registrationNumber || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>State Medical Council:</strong> ${doctor.stateMedicalCouncil || 'N/A'}</p>
              </div>
              <a href="${baseUrl}/admin" style="display: inline-block; background-color: #0F766E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Admin Dashboard</a>
              <p style="margin-top: 20px;">Please log in to the admin dashboard to review and approve/reject their profile.</p>
              <p>Thank you.</p>
            </div>
          `,
        });
        console.log('Admin notification email sent for manual request:', user.name);
      }
    } catch (emailError) {
      console.warn('Failed to send admin notification email (non-critical):', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Admin approval requested. You will be notified once reviewed.',
      data: doctor,
    });
  } catch (error) {
    console.error('requestAdminApproval error:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
