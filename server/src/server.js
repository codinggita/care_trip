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
import doctorDashRoutes from './routes/doctorDashRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { startReminderScheduler } from './jobs/reminderScheduler.js';

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
app.use('/api/doctor-dash', doctorDashRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('CareTrip API Running');
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caretrip', {
  dbName: 'caretrip'
})
  .then(async () => {
    console.log('MongoDB connected');

    // One-time: index cleanups
    try {
      const db = mongoose.connection.db;
      
      // 1. Doctors location indexes
      const indexes = await db.collection('doctors').indexes();
      const geoIndex = indexes.find(i => i.key && i.key['location.coordinates'] === '2dsphere');
      if (geoIndex) {
        await db.collection('doctors').dropIndex(geoIndex.name);
        console.log('Dropped old 2dsphere index:', geoIndex.name);
      }
      const locIndex = indexes.find(i => i.key && i.key.location === '2dsphere' && !i.sparse);
      if (locIndex) {
        await db.collection('doctors').dropIndex(locIndex.name);
        console.log('Dropped non-sparse location index:', locIndex.name);
      }

      // 2. Users googleId index (must be sparse)
      try {
        await db.collection('users').dropIndex('googleId_1');
        console.log('Dropped googleId_1 index explicitly to recreate as sparse');
      } catch (err) {
        // Ignore error if index doesn't exist
      }

      // 3. Cleanup broken doctor registrations
      try {
        const result = await db.collection('users').deleteMany({
          role: 'Doctor',
          doctorProfile: { $exists: false }
        });
        console.log(`Cleaned up ${result.deletedCount} broken doctor registrations.`);
      } catch (err) {
        console.log('Cleanup error:', err.message);
      }
    } catch (idxErr) {
      console.log('Index cleanup note:', idxErr.message);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Start the appointment reminder cron job
      startReminderScheduler();
    });
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
  });
