import express from 'express';
import * as serviceOrderController from './serviceOrder.controller.js';

const router = express.Router();

router.get('/', serviceOrderController.getAllServiceOrders);
router.get('/:id', serviceOrderController.getServiceOrderById);
router.post('/', serviceOrderController.createServiceOrder);
router.put('/:id', serviceOrderController.updateServiceOrder);
router.delete('/:id', serviceOrderController.deleteServiceOrder);

export default router;
