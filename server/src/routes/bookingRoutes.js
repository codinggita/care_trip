import express from 'express';
import { createBooking, getMyBookings, cancelBooking, deleteBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Protect all booking routes

router.post('/', createBooking);
router.get('/', getMyBookings);
router.patch('/:id/cancel', cancelBooking);
router.delete('/:id', deleteBooking);

export default router;
