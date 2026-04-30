import express from 'express';
import * as roomController from './room.controller.js';
import upload from '../../../utils/upload.middleware.js';

const router = express.Router();

router.get('/', roomController.getAllRooms);
router.get('/available', roomController.getAvailableRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.put('/:id/images', upload.array("images", 10), roomController.RoomImages);
router.get('/:id/images', roomController.getAllRoomImages);
router.delete('/:id', roomController.deleteRoom);

export default router;
