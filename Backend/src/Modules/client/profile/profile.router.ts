import express from 'express';
import { getProfile, updateProfile, getBookingHistory, getUserReviews, getProfileImage, updateProfileImage, removeProfileImage, changeMyPassword } from './profile.controller.js';
import { protect } from '../../../utils/auth.middleware.js'
import upload from '../../../utils/upload.middleware.js'
const router = express.Router();

router.get('/', getProfile);

router.put('/', updateProfile);

router.put('/change-password', changeMyPassword);

router.get('/avatar', getProfileImage);

router.put('/avatar', upload.single("avatar"), updateProfileImage);

router.delete('/avatar', removeProfileImage);

router.get('/bookings', getBookingHistory);

router.get('/reviews', getUserReviews);

export default router;
