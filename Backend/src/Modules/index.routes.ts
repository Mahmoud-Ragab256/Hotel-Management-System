import express from 'express';
import dashboardRoutes from './dashboard/dashboard.routes.js';
import clientRoutes from './client/client.routes.js';

const router = express.Router();

router.use('/client', clientRoutes);

router.use('/dashboard', dashboardRoutes);

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Hotel Management System API',
    version: '1.0.0',
    endpoints: {
      client: {
        landing: '/client/landing',
        rooms: '/client/rooms',
        booking: '/client/booking',
        auth: '/client/auth',
        profile: '/client/profile'
      },
      dashboard: {
        guests: '/dashboard/guests',
        employees: '/dashboard/employees',
        roomCategories: '/dashboard/room-categories',
        rooms: '/dashboard/rooms',
        bookings: '/dashboard/bookings',
        services: '/dashboard/services',
        serviceOrders: '/dashboard/service-orders',
        invoices: '/dashboard/invoices',
        reviews: '/dashboard/reviews',
        notifications: '/dashboard/notifications'
      }
    }
  });
});



export default router;
