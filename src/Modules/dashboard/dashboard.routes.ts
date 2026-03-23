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
import authRouter from './auth/auth.router.js'
import { allowTo, protect } from '../../utils/auth.middleware.js';

const router = express.Router();

router.use('/auth', authRouter)

router.use(protect, allowTo("Admin", "Manager"))

router.use('/room-categories', roomCategoryRouter);
router.use('/rooms', roomRouter);
router.use('/reviews', reviewRouter);
router.use('/guests', guestRouter);
router.use('/services', serviceRouter);

router.use(allowTo("Receptionist"))
router.use('/bookings', bookingRouter);
router.use('/invoices', invoiceRouter);
router.use('/notifications', notificationRouter);


router.use(allowTo("Service"))
router.use('/service-orders', serviceOrderRouter);
router.use('/employees', employeeRouter);

export default router;
