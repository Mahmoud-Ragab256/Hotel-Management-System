import { Request, Response } from 'express';
import { Notification } from '../../../DB/Models/notification.model.js';
import { INotification, RecipientType, NotificationType } from '../../../DB/Models/notification.model.js';
import { Types } from 'mongoose';


interface CreateNotificationBody {
  recipientType: RecipientType;
  recipientId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  images?: string[];
}


interface NotificationsData {
  notifications: INotification[];
}

interface NotificationData {
  notification: INotification;
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


export const getAllNotifications = async (
  req: Request,
  res: Response<ApiResponse<NotificationsData>>
): Promise<void> => {
  try {
    const notifications: INotification[] = await Notification.find();

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getNotificationById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<NotificationData>>
): Promise<void> => {
  try {
    const notification: INotification | null = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getNotificationsByRecipient = async (
  req: Request<{ recipientId: string }>,
  res: Response<ApiResponse<NotificationsData>>
): Promise<void> => {
  try {
    const { recipientId } = req.params;

    const notifications: INotification[] = await Notification.find({ recipientId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getUnreadNotifications = async (
  req: Request<{ recipientId: string }>,
  res: Response<ApiResponse<NotificationsData>>
): Promise<void> => {
  try {
    const { recipientId } = req.params;

    const notifications: INotification[] = await Notification.find({
      recipientId,
      isRead: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const createNotification = async (
  req: Request<{}, ApiResponse<NotificationData>, CreateNotificationBody>,
  res: Response<ApiResponse<NotificationData>>
): Promise<void> => {
  try {
    const notification: INotification = await Notification.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const markAsRead = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<NotificationData>>
): Promise<void> => {
  try {
    const notification: INotification | null = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const markAllAsRead = async (
  req: Request<{ recipientId: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { recipientId } = req.params;

    await Notification.updateMany(
      { recipientId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const deleteNotification = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const notification: INotification | null = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};