import express from 'express';
import { register, login, forgotPassword, resetPassword } from './auth.controller.js';

const router = express.Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

export default router;
