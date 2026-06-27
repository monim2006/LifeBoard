import { prisma } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';

export const getNotifications = (userId: string) =>
  prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

export const getUnreadCount = (userId: string) =>
  prisma.notification.count({ where: { userId, read: false } });

export const createNotification = (userId: string, data: { title: string; message?: string; type?: string; link?: string }) =>
  prisma.notification.create({
    data: { userId, title: data.title, message: data.message, type: data.type || 'info', link: data.link },
  });

export const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
  if (!notification) throw new NotFoundError('Notification not found');
  return prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
};

export const markAllAsRead = (userId: string) =>
  prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });

export const deleteNotification = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
  if (!notification) throw new NotFoundError('Notification not found');
  await prisma.notification.delete({ where: { id: notificationId } });
};

export const deleteAllNotifications = (userId: string) =>
  prisma.notification.deleteMany({ where: { userId } });
