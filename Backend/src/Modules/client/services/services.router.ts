import express from 'express';
import { protect } from '../../../utils/auth.middleware.js';
import { createClientServiceOrder, getClientServices } from './services.controller.js';

const router = express.Router();

router.get('/', getClientServices);
router.post('/orders', protect, createClientServiceOrder);

export default router;
