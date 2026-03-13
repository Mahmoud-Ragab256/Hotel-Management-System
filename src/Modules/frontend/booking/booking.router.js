import express from 'express';
import { createBooking, getBookingDetails, getUserBookings, cancelBooking } from './booking.controller.js';

const router = express.Router();

// Create new booking
router.post('/', createBooking);

// Get booking details
router.get('/:id', getBookingDetails);

// Get user bookings
router.get('/user/:guestId', getUserBookings);

// Cancel booking
router.put('/:id/cancel', cancelBooking);

export default router;
