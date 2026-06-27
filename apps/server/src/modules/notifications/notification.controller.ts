import { Request, Response, NextFunction } from 'express';
import * as notificationService from './notification.service';

const p = (params: any, key: string) => Array.isArray(params[key]) ? params[key][0] : params[key];

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const notifications = await notificationService.getNotifications(userId);
    const unreadCount = await notificationService.getUnreadCount(userId);
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const notification = await notificationService.markAsRead(p(req.params, 'id'), userId);
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await notificationService.deleteNotification(p(req.params, 'id'), userId);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

export const clearAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await notificationService.deleteAllNotifications(userId);
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
};
