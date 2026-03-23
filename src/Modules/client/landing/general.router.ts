import express from 'express';
import { getLandingPageData, getStatistics, getFeaturedCategories } from './general.controller.js';

const router = express.Router();

router.get('/landing', getLandingPageData);

router.get('/statistics', getStatistics);

router.get('/featured-categories', getFeaturedCategories);

export default router;
