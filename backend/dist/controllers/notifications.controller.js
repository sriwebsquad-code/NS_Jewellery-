"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
const db_1 = __importDefault(require("../config/db"));
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const notifications = await db_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({
            success: true,
            data: notifications
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { notificationId } = req.params;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (notificationId === 'all') {
            await db_1.default.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true }
            });
        }
        else {
            await db_1.default.notification.update({
                where: { id: notificationId, userId },
                data: { isRead: true }
            });
        }
        res.status(200).json({ success: true, message: 'Notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.markAsRead = markAsRead;
//# sourceMappingURL=notifications.controller.js.map