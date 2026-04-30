import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { Resend } from 'resend';

let resend;
const getResend = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

// @desc    Create new booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason, languagePreference, doctorName, doctorSpecialty } = req.body;
    
    // Check if it's an internal doctor (MongoDB ID)
    let internalDoctor = null;
    if (mongoose.Types.ObjectId.isValid(doctorId)) {
      internalDoctor = await Doctor.findById(doctorId);
    }

    const booking = await Booking.create({
      patientId: req.user.id,
      doctorId,
      doctorName: internalDoctor ? internalDoctor.name : doctorName,
      doctorSpecialty: internalDoctor ? internalDoctor.specialty : doctorSpecialty,
      date,
      timeSlot,
      reason,
      languagePreference,
      location: 'Clinic/Online'
    });

    // Send confirmation email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const patient = await User.findById(req.user.id);
        const docName = internalDoctor ? internalDoctor.name : doctorName;
        
        const mailer = getResend();
        if (mailer) {
          await mailer.emails.send({
            from: 'CareTrip <onboarding@resend.dev>', // Use verified domain in production
            to: patient.email,
            subject: 'Appointment Confirmed - CareTrip',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                <h2 style="color: #0F766E;">Appointment Confirmed!</h2>
                <p>Hello ${patient.name},</p>
                <p>Your appointment with <strong>${docName}</strong> has been successfully booked.</p>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 4px 0;"><strong>Date:</strong> ${date}</p>
                  <p style="margin: 4px 0;"><strong>Time:</strong> ${timeSlot}</p>
                  <p style="margin: 4px 0;"><strong>Doctor:</strong> ${docName}</p>
                </div>
                <p>Thank you for choosing CareTrip.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 12px; color: #64748b;">This is an automated message. Please do not reply.</p>
              </div>
            `
          });
          console.log('Confirmation email sent to:', patient.email);
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ patientId: req.user.id })
      .sort('-createdAt')
      .lean(); // Use lean() for easier manipulation

    // For each booking, ensure doctor details are present and update status if past
    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      let updatedBooking = { ...booking };

      // Auto-complete past bookings
      try {
        if (updatedBooking.status === 'Confirmed' && updatedBooking.date && updatedBooking.timeSlot) {
          const currentYear = new Date().getFullYear();
          const dateParts = updatedBooking.date.split(', ')[1]; // e.g., "30 Apr"
          if (dateParts) {
            const bookingDateTime = new Date(`${dateParts} ${currentYear} ${updatedBooking.timeSlot}`);
            if (bookingDateTime < new Date()) {
              updatedBooking.status = 'Completed';
              // Update in DB silently
              await Booking.findByIdAndUpdate(updatedBooking._id, { status: 'Completed' });
            }
          }
        }
      } catch (e) {
        console.error('Error auto-completing booking:', e);
      }

      // If we already have doctorName, it's a Mappls doctor or already saved
      if (!updatedBooking.doctorName && mongoose.Types.ObjectId.isValid(updatedBooking.doctorId)) {
        // If no doctorName, try to fetch from Doctor collection using doctorId
        const doc = await Doctor.findById(updatedBooking.doctorId).select('name specialty initials color');
        if (doc) {
          updatedBooking.doctorName = doc.name;
          updatedBooking.doctorSpecialty = doc.specialty;
          updatedBooking.doctorInitials = doc.initials;
          updatedBooking.doctorColor = doc.color;
        }
      }
      return updatedBooking;
    }));

    res.status(200).json({ success: true, count: enrichedBookings.length, data: enrichedBookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.patientId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.patientId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await booking.deleteOne();

    res.status(200).json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get booked slots for a specific doctor on a specific date
// @route   GET /api/bookings/booked-slots
export const getBookedSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'doctorId and date are required' });
    }

    const bookings = await Booking.find({
      doctorId,
      date,
      status: { $ne: 'Cancelled' }
    }).select('timeSlot');

    const bookedSlots = bookings.map(b => b.timeSlot);

    res.status(200).json({ success: true, data: bookedSlots });
  } catch (error) {
    console.error('Get booked slots error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit a review for a completed booking
// @route   POST /api/bookings/:id/review
export const submitReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.patientId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed appointments' });
    }

    if (booking.reviewed) {
      return res.status(400).json({ success: false, message: 'Already reviewed' });
    }

    const patient = await User.findById(req.user.id).select('name');

    const review = await Review.create({
      doctorId: booking.doctorId,
      bookingId: booking._id,
      patientId: req.user.id,
      patientName: patient.name,
      text,
      rating,
      travelerType: 'Tourist' // Could be dynamic based on user profile
    });

    booking.reviewed = true;
    await booking.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get top 3 reviews for a doctor
// @route   GET /api/bookings/reviews/:doctorId
export const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.doctorId })
      .sort('-createdAt')
      .limit(3)
      .select('patientName text rating travelerType createdAt');

    // Format for frontend
    const formattedReviews = reviews.map(r => ({
      author: r.patientName,
      text: r.text,
      rating: r.rating,
      type: r.travelerType,
      date: r.createdAt
    }));

    res.status(200).json({ success: true, data: formattedReviews });
  } catch (error) {
    console.error('Get doctor reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get bookings for a specific doctor (doctor's own view)
// @route   GET /api/bookings/doctor/:doctorId
export const getDoctorBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ doctorId: req.params.doctorId })
      .sort('-createdAt')
      .lean();

    // Enrich with patient info
    const enriched = await Promise.all(bookings.map(async (b) => {
      const patient = await User.findById(b.patientId).select('name email picture');
      return { ...b, patientId: patient || { name: 'Unknown' } };
    }));

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    console.error('Get doctor bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

