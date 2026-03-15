import express from 'express';
import { getAvailableRooms, getRoomDetails, searchRooms } from './rooms.controller.js';

const router = express.Router();

// Get all available rooms with filters
router.get('/available', getAvailableRooms);

// Search rooms by dates and guests
router.post('/search', searchRooms);

// Get room details
router.get('/:id', getRoomDetails);

export default router;
