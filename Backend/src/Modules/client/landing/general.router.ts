import express from 'express';
import { getLandingPageData, getStatistics, getFeaturedCategories } from './general.controller.js';

const router = express.Router();

// Correct public endpoint used by the frontend: GET /client/landing
router.get('/', getLandingPageData);

// Backward-compatible old endpoint: GET /client/landing/landing
router.get('/landing', getLandingPageData);

router.get('/statistics', getStatistics);
router.get('/featured-categories', getFeaturedCategories);

export default router;
