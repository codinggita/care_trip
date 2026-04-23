import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google users
  googleId: { type: String, sparse: true, unique: true }, // Not required for manual auth
  picture: { type: String },
  role: { type: String, enum: ['Traveler', 'Doctor', 'Admin'], default: 'Traveler' },
  nmcNumber: { type: String, sparse: true },
  isVerified: { type: Boolean, default: false },
  medicalCertificate: { type: String }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
