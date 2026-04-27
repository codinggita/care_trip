import express from 'express';
import { getDoctors, getDoctor, getNearbyDoctors } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/nearby', getNearbyDoctors);
router.get('/:id', getDoctor);

export default router;
