import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .get();
      
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort in memory to avoid requiring a composite Firestore index
    notifications.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    res.status(200).json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await db.collection('notifications').doc(id).update({ isRead: true });

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to mark as read', error: error.message });
  }
};
