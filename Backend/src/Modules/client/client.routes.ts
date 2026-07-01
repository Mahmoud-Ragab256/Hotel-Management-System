import express from 'express';
import landingRouter from './landing/general.router.js';
import roomsRouter from './rooms/rooms.router.js';
import bookingRouter from './booking/booking.router.js';
import authRouter from './auth/auth.routes.js';
import profileRouter from './profile/profile.router.js';
import servicesRouter from './services/services.router.js';
import reviewsRouter from './reviews/reviews.router.js';
import { protect } from '../../utils/auth.middleware.js';

const router = express.Router();

router.use('/auth', authRouter);

// Public guest-facing browsing routes.
router.use('/landing', landingRouter);
router.use('/rooms', roomsRouter);
router.use('/services', servicesRouter);
router.use('/reviews', reviewsRouter);

// Booking and profile actions require guest login.
router.use(protect);
router.use('/booking', bookingRouter);
router.use('/me', profileRouter);

export default router;
