import express from 'express';
import * as serviceController from './service.controller.js';
import { serviceUpload } from '../../../utils/upload.middleware.js';

const router = express.Router();

router.get('/', serviceController.getAllServices);
router.get('/available', serviceController.getAvailableServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', serviceUpload.array('images', 10), serviceController.createService);
router.put('/:id/images', serviceUpload.array('images', 10), serviceController.updateServiceImages);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

export default router;
