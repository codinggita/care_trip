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
  medicalCertificate: { type: String },
  
  // Profile Fields
  phone: { type: String },
  dob: { type: String },
  nationality: { type: String },
  preferredLanguage: { type: String, default: 'English' },
  gender: { type: String },
  currentCity: { type: String },
  homeCountry: { type: String },
  travelPurpose: { type: String },
  tripStart: { type: String },
  tripEnd: { type: String },
  allergies: { type: String, default: 'None' },
  chronicConditions: { type: String, default: 'None' },
  bloodGroup: { type: String },
  emergencyWhatsApp: { type: String },
  emergencyEmail: { type: String },
  doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
