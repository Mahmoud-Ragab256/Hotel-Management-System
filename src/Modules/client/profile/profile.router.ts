import express from 'express';
import { getProfile, updateProfile, getBookingHistory, getUserReviews } from './profile.controller.js';
import { protect } from '../../../utils/auth.middleware.js'

const router = express.Router();

router.get('/me', protect, getProfile);

router.put('/:id', updateProfile);

router.get('/:id/bookings', getBookingHistory);

router.get('/:id/reviews', getUserReviews);

export default router;
