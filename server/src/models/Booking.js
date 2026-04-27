import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: String, required: true }, // Changed from ObjectId to String for Mappls support
  doctorName: { type: String }, // For external/Mappls doctors
  doctorSpecialty: { type: String }, // For external/Mappls doctors
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  reason: { type: String },
  location: { type: String },
  languagePreference: { type: String, default: 'English' },
  status: { 
    type: String, 
    enum: ['Confirmed', 'Completed', 'Cancelled'], 
    default: 'Confirmed' 
  }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
