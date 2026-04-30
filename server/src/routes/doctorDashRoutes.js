import express from 'express';
import {
  getDoctorProfile,
  updateDoctorProfile,
  verifyRegistration,
  requestAdminApproval,
} from '../controllers/doctorDashController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Doctor'));

router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);
router.post('/verify', verifyRegistration);
router.post('/request-approval', requestAdminApproval);

export default router;
