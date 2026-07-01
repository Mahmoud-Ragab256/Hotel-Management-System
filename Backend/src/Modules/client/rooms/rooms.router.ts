import express from 'express';
import {
  getAllRooms,
  getAvailableRooms,
  getRoomCategories,
  getRoomDetails,
  getRoomImages,
  searchRooms
} from './rooms.controller.js';

const router = express.Router();

router.get('/', getAllRooms);
router.get('/available', getAvailableRooms);
router.get('/categories', getRoomCategories);
router.post('/search', searchRooms);
router.get('/:id/images', getRoomImages);
router.get('/:id', getRoomDetails);

export default router;
