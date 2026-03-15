import express from 'express';
import * as serviceController from './service.controller.js';

const router = express.Router();

// Service routes
router.get('/', serviceController.getAllServices);
router.get('/available', serviceController.getAvailableServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', serviceController.createService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

export default router;
