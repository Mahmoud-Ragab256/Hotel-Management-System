import express from 'express';
import guestRouter from './guest/guest.router.js';
import employeeRouter from './employee/employee.router.js';
import roomCategoryRouter from './roomCategory/roomCategory.router.js';
import roomRouter from './room/room.router.js';
import bookingRouter from './booking/booking.router.js';
import serviceRouter from './service/service.router.js';
import serviceOrderRouter from './serviceOrder/serviceOrder.router.js';
import invoiceRouter from './invoice/invoice.router.js';
import reviewRouter from './review/review.router.js';
import notificationRouter from './notification/notification.router.js';

const router = express.Router();

// Dashboard API Routes
router.use('/guests', guestRouter);
router.use('/employees', employeeRouter);
router.use('/room-categories', roomCategoryRouter);
router.use('/rooms', roomRouter);
router.use('/bookings', bookingRouter);
router.use('/services', serviceRouter);
router.use('/service-orders', serviceOrderRouter);
router.use('/invoices', invoiceRouter);
router.use('/reviews', reviewRouter);
router.use('/notifications', notificationRouter);

export default router;
