import express from 'express';
import { protect } from '../../../utils/auth.middleware.js';
import { createClientReview, getClientReviews } from './reviews.controller.js';

const router = express.Router();

router.get('/', getClientReviews);
router.post('/', protect, createClientReview);

export default router;
