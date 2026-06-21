import express from 'express';
import * as invoiceController from './invoice.controller.js';

const router = express.Router();

router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.get('/booking/:bookingId', invoiceController.getInvoiceByBookingId);
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

export default router;
