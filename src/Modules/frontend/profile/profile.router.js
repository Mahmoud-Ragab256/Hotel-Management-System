import express from 'express';
import { getProfile, updateProfile, getBookingHistory, getUserReviews } from './profile.controller.js';

const router = express.Router();

// Get profile
router.get('/:id', getProfile);

// Update profile
router.put('/:id', updateProfile);

// Get booking history
router.get('/:id/bookings', getBookingHistory);

// Get user reviews
router.get('/:id/reviews', getUserReviews);

export default router;
