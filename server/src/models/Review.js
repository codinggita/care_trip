import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  travelerType: { type: String, default: 'Tourist' }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
