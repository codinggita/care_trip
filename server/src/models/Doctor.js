import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  languages: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  fee: { type: Number, required: true },
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
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  verified: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

doctorSchema.index({ location: '2dsphere' });

export default mongoose.model('Doctor', doctorSchema);
