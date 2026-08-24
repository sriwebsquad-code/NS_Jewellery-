"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
const firebase_1 = require("../config/firebase");
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const snapshot = await firebase_1.db.collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
//# sourceMappingURL=notifications.controller.js.map