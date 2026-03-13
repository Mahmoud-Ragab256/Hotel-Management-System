import express from 'express';
import { getLandingPageData, getStatistics, getFeaturedCategories } from './general.controller.js';

const router = express.Router();

// Landing page data
router.get('/landing', getLandingPageData);

// Statistics
router.get('/statistics', getStatistics);

// Featured categories
router.get('/featured-categories', getFeaturedCategories);

export default router;
