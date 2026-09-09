import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notifications.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.post('/mark-all-read', markAllAsRead);
router.patch('/:notificationId/read', markAsRead);

export default router;
