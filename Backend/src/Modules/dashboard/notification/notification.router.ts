import express from 'express';
import * as notificationController from './notification.controller.js';

const router = express.Router();

router.get('/', notificationController.getAllNotifications);
router.get('/:id', notificationController.getNotificationById);
router.get('/recipient/:recipientId', notificationController.getNotificationsByRecipient);
router.get('/recipient/:recipientId/unread', notificationController.getUnreadNotifications);
router.post('/', notificationController.createNotification);
router.put('/:id/read', notificationController.markAsRead);
router.put('/recipient/:recipientId/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
