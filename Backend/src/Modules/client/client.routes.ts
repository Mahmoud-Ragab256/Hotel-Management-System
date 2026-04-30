import express from 'express';
import landingRouter from './landing/general.router.js';
import roomsRouter from './rooms/rooms.router.js';
import bookingRouter from './booking/booking.router.js';
import authRouter from './auth/auth.routes.js';
import profileRouter from './profile/profile.router.js';
import { protect } from '../../utils/auth.middleware.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/landing', landingRouter);

router.use(protect) // guests need to login first
router.use('/rooms', roomsRouter);
router.use('/booking', bookingRouter);
router.use('/profile', profileRouter);

export default router;
