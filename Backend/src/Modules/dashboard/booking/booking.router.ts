import express from 'express';
import * as bookingController from './booking.controller.js';

const router = express.Router();

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.put('/:id/cancel', bookingController.cancelBooking);
router.delete('/:id', bookingController.deleteBooking);

export default router;
