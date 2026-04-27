import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Doctor from './models/Doctor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// This file is intentionally empty of dummy data.
// All doctor/hospital data is now fetched in real-time from the Mappls Nearby API.
// The Doctor model and collection remain for user bookings and profile storage only.

const cleanDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    await Doctor.deleteMany();
    console.log('✅ All dummy/seed doctor data has been permanently deleted.');
    console.log('📡 Live data is now served directly from Mappls API.');

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanDB();
