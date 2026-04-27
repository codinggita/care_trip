import express from 'express';
import { sendEmergencyEmail, getWhatsAppLink } from '../controllers/emergencyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/email', sendEmergencyEmail);
router.get('/whatsapp-link', getWhatsAppLink);

export default router;
