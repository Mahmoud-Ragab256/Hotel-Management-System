import express from 'express';
import * as roomCategoryController from './roomCategory.controller.js';

const router = express.Router();

// Room Category routes
router.get('/', roomCategoryController.getAllRoomCategories);
router.get('/:id', roomCategoryController.getRoomCategoryById);
router.post('/', roomCategoryController.createRoomCategory);
router.put('/:id', roomCategoryController.updateRoomCategory);
router.delete('/:id', roomCategoryController.deleteRoomCategory);

export default router;
