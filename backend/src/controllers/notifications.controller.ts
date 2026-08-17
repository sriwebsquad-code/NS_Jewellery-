import { Request, Response } from 'express';
import prisma from '../config/db';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (notificationId === 'all') {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
    } else {
      await prisma.notification.update({
        where: { id: notificationId as string, userId },
        data: { isRead: true }
      });
    }

    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
