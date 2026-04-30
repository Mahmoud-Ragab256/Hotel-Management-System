import express from 'express';
import { getProfile, updateProfile, getBookingHistory, getUserReviews, getProfileImage } from './profile.controller.js';
import { protect } from '../../../utils/auth.middleware.js'
import upload from '../../../utils/upload.middleware.js'
const router = express.Router();

router.get('/me', protect, getProfile);

router.put('/:id', upload.single("avatar"), updateProfile);

router.get('/me/avatar', getProfileImage);

router.get('/:id/bookings', getBookingHistory);

router.get('/:id/reviews', getUserReviews);

export default router;
