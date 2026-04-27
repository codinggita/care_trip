import Doctor from '../models/Doctor.js';
import Review from '../models/Review.js';

// @desc    Get all doctors
// @route   GET /api/doctors
export const getDoctors = async (req, res) => {
  try {
    const { specialty, language, minPrice, maxPrice, rating } = req.query;
    
    let query = {};
    
    if (specialty) query.specialty = specialty;
    if (language) query.languages = { $in: [language] };
    if (minPrice || maxPrice) {
      query.fee = {};
      if (minPrice) query.fee.$gte = Number(minPrice);
      if (maxPrice) query.fee.$lte = Number(maxPrice);
    }
    if (rating) query.rating = { $gte: Number(rating) };

    const doctors = await Doctor.find(query);
    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
export const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    const reviews = await Review.find({ doctorId: req.params.id }).populate('patientId', 'name picture');
    
    res.status(200).json({ success: true, data: { ...doctor._doc, reviewsList: reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get nearby doctors (Geospatial)
// @route   GET /api/doctors/nearby
export const getNearbyDoctors = async (req, res) => {
  try {
    const { lat, lng, distance = 10 } = req.query; // distance in km
    
    const doctors = await Doctor.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: distance * 1000 // Convert km to meters
        }
      }
    });

    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
