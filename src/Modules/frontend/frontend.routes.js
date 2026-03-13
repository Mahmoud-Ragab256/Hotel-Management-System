import express from 'express';
import landingRouter from './landing/general.router.js';
import roomsRouter from './rooms/rooms.router.js';
import bookingRouter from './booking/booking.router.js';
import authRouter from './auth/auth.router.js';
import profileRouter from './profile/profile.router.js';

const router = express.Router();

// Frontend API Routes
router.use('/landing', landingRouter);
router.use('/rooms', roomsRouter);
router.use('/booking', bookingRouter);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);

export default router;
