import express from 'express';
import { createBooking, getMyBookings, cancelBooking, deleteBooking, getBookedSlots, submitReview, getDoctorReviews } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Protect all booking routes

router.get('/booked-slots', getBookedSlots);
router.get('/reviews/:doctorId', getDoctorReviews);

router.post('/', createBooking);
router.get('/', getMyBookings);
router.post('/:id/review', submitReview);
router.patch('/:id/cancel', cancelBooking);
router.delete('/:id', deleteBooking);

export default router;
