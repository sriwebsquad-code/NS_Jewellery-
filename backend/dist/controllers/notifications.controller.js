"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const firebase_1 = require("../config/firebase");
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const [userSnapshot, globalSnapshot] = await Promise.all([
            firebase_1.db.collection('notifications').where('userId', '==', userId).get(),
            firebase_1.db.collection('notifications').where('userId', '==', 'GLOBAL').get()
        ]);
        const userNotifications = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const globalNotifications = globalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const notifications = [...userNotifications, ...globalNotifications];
        // Sort in memory to avoid requiring a composite Firestore index
        notifications.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
        res.status(200).json({ success: true, data: notifications });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const id = req.params.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        await firebase_1.db.collection('notifications').doc(id).update({ isRead: true });
        res.status(200).json({ success: true, message: 'Notification marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to mark as read', error: error.message });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const unreadSnapshot = await firebase_1.db.collection('notifications')
            .where('userId', '==', userId)
            .where('isRead', '==', false)
            .get();
        if (unreadSnapshot.empty) {
            return res.status(200).json({ success: true, message: 'All notifications are already read' });
        }
        const batch = firebase_1.db.batch();
        unreadSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isRead: true });
        });
        await batch.commit();
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to mark all as read', error: error.message });
    }
};
exports.markAllAsRead = markAllAsRead;
//# sourceMappingURL=notifications.controller.js.map