import express from 'express';
import { createBooking, getBookingDetails, getUserBookings, cancelBooking } from './booking.controller.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/user/:guestId', getUserBookings);
router.get('/:id', getBookingDetails);
router.put('/:id/cancel', cancelBooking);

export default router;
