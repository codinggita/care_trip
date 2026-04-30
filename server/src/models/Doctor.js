import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, default: 'General Physician' },
  languages: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  fee: { type: Number, default: 500 },
  initials: { type: String },
  color: { type: String, default: 'bg-primary-700' },
  bio: { type: String },
  estimatedTreatment: { type: String },
  timeSlots: {
    morning: [{ type: String }],
    afternoon: [{ type: String }],
    evening: [{ type: String }]
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: undefined } // [longitude, latitude] — undefined means no location set
  },
  verified: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Verification fields
  registrationNumber: { type: String },
  stateMedicalCouncil: { type: String },
  verificationStatus: { 
    type: String, 
    enum: ['unverified', 'pending', 'verified', 'rejected'], 
    default: 'unverified' 
  },

  // Clinic fields
  clinicName: { type: String },
  clinicAddress: { type: String },
  clinicPhone: { type: String },

  // Professional fields
  qualifications: { type: String },
  experience: { type: Number },
  availableDays: [{ type: String }],
  profileComplete: { type: Boolean, default: false },
  picture: { type: String }
}, { timestamps: true });

doctorSchema.index({ location: '2dsphere' }, { sparse: true });

// Prevent saving invalid GeoJSON (missing coordinates) which breaks 2dsphere index
doctorSchema.pre('save', function (next) {
  if (this.location && (!this.location.coordinates || this.location.coordinates.length !== 2)) {
    this.location = undefined;
  }
  next();
});

export default mongoose.model('Doctor', doctorSchema);
