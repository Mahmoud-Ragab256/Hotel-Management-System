import express from 'express';
import { login, forgotPassword, resetPassCode, resetPassword } from './auth.controller.js';

const router = express.Router();

router.post('/login', login);

router.post('/forgot-password', forgotPassword);

router.post('/reset-code', resetPassCode);

router.post('/reset-password', resetPassword);

export default router;