import Doctor from '../models/Doctor.js';
import Review from '../models/Review.js';

// @desc    Get all doctors
// @route   GET /api/doctors
export const getDoctors = async (req, res) => {
  try {
    const { specialty, language, minPrice, maxPrice, rating, search } = req.query;

    let query = {
      $and: [
        {
          $or: [
            { verificationStatus: 'verified' },
            { verificationStatus: { $exists: false } } // Legacy seeded doctors
          ]
        }
      ]
    };

    if (specialty) query.$and.push({ specialty });
    if (language) query.$and.push({ languages: { $in: [language] } });
    if (minPrice || maxPrice) {
      const feeQuery = {};
      if (minPrice) feeQuery.$gte = Number(minPrice);
      if (maxPrice) feeQuery.$lte = Number(maxPrice);
      query.$and.push({ fee: feeQuery });
    }
    if (rating) query.$and.push({ rating: { $gte: Number(rating) } });
    if (search) {
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { clinicName: { $regex: search, $options: 'i' } },
          { specialty: { $regex: search, $options: 'i' } },
        ]
      });
    }

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
    const { lat, lng, distance = 10 } = req.query;
    const refLat = parseFloat(lat);
    const refLng = parseFloat(lng);
    const maxDistMeters = distance * 1000;

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371000;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const doctors = await Doctor.find({
      $or: [
        { verificationStatus: 'verified' },
        { verificationStatus: { $exists: false } }
      ]
    });

    const nearby = doctors
      .map((doc) => {
        const coords = doc.location?.coordinates;
        if (!coords || coords.length !== 2 || !coords[0] || !coords[1]) return null;
        const dist = calculateDistance(refLat, refLng, coords[1], coords[0]);
        if (dist > maxDistMeters) return null;
        return { ...doc._doc, distanceMeters: Math.round(dist), distance: `${(dist / 1000).toFixed(1)} km` };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    res.status(200).json({ success: true, count: nearby.length, data: nearby });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
