import express from 'express';
import * as reviewController from './review.controller.js';

const router = express.Router();

router.get('/', reviewController.getAllReviews);
router.get('/approved', reviewController.getApprovedReviews);
router.get('/:id', reviewController.getReviewById);
router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.put('/:id/approve', reviewController.approveReview);
router.delete('/:id', reviewController.deleteReview);

export default router;
