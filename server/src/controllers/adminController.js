import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

// @desc    Get all doctors pending admin approval
// @route   GET /api/admin/pending-doctors
export const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ verificationStatus: 'pending' })
      .populate('userId', 'name email picture')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    console.error('getPendingDoctors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve a doctor
// @route   PATCH /api/admin/doctors/:id/approve
export const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: { verificationStatus: 'verified', verified: true } },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, message: 'Doctor approved', data: doctor });
  } catch (error) {
    console.error('approveDoctor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reject a doctor
// @route   PATCH /api/admin/doctors/:id/reject
export const rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: { verificationStatus: 'rejected', verified: false } },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, message: 'Doctor rejected', data: doctor });
  } catch (error) {
    console.error('rejectDoctor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [totalDoctors, pendingDoctors, verifiedDoctors, totalTravelers, totalBookings] =
      await Promise.all([
        Doctor.countDocuments(),
        Doctor.countDocuments({ verificationStatus: 'pending' }),
        Doctor.countDocuments({ verificationStatus: 'verified' }),
        User.countDocuments({ role: 'Traveler' }),
        Booking.countDocuments(),
      ]);

    res.status(200).json({
      success: true,
      data: { totalDoctors, pendingDoctors, verifiedDoctors, totalTravelers, totalBookings },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all doctors (admin view)
// @route   GET /api/admin/all-doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email picture')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    console.error('getAllDoctors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
