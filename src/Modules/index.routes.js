import express from 'express';
import dashboardRoutes from './dashboard/dashboard.routes.js';
import frontendRoutes from './frontend/frontend.routes.js';

const router = express.Router();

// Frontend Routes (for website visitors/guests)
router.use('/frontend', frontendRoutes);

// Dashboard Routes (for admin panel)
router.use('/dashboard', dashboardRoutes);

// Welcome route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Hotel Management System API',
    version: '1.0.0',
    endpoints: {
      frontend: {
        landing: '/frontend/landing',
        rooms: '/frontend/rooms',
        booking: '/frontend/booking',
        auth: '/frontend/auth',
        profile: '/frontend/profile'
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
