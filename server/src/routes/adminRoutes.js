import express from 'express';
import {
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getDashboardStats,
  getAllDoctors,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/pending-doctors', getPendingDoctors);
router.get('/all-doctors', getAllDoctors);
router.get('/stats', getDashboardStats);
router.patch('/doctors/:id/approve', approveDoctor);
router.patch('/doctors/:id/reject', rejectDoctor);

export default router;
