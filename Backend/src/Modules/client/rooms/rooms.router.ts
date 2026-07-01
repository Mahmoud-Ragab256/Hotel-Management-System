import express from 'express';
import { getAvailableRooms, getRoomDetails, searchRooms } from './rooms.controller.js';

const router = express.Router();

router.get('/available', getAvailableRooms);

router.post('/search', searchRooms);

router.get('/:id', getRoomDetails);

export default router;
