import './config/dotenv.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import placesRoutes from './routes/placesRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Load Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/places', placesRoutes);

app.get('/', (req, res) => {
  res.send('CareTrip API Running');
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caretrip', {
  dbName: 'caretrip'
})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
  });
