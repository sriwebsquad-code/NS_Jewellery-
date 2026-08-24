"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = void 0;
const firebase_1 = require("../config/firebase");
/**
 * Middleware to log admin actions (POST, PUT, DELETE)
 */
const auditLog = async (req, res, next) => {
    // Capture original send/json to intercept the response status
    const originalJson = res.json;
    res.json = function (body) {
        // Only log successful mutating actions (POST, PUT, DELETE)
        if (req.method !== 'GET' && res.statusCode >= 200 && res.statusCode < 300) {
            const user = req.user;
            // If a user is logged in (should be admin due to requireAdmin middleware)
            if (user && user.userId) {
                // Asynchronously log the action
                const docRef = firebase_1.db.collection('adminAuditLogs').doc();
                docRef.set({
                    id: docRef.id,
                    adminId: user.userId,
                    action: `${req.method} ${req.originalUrl}`,
                    details: JSON.stringify(req.body || {}),
                    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                    createdAt: new Date().toISOString()
                }).catch(err => {
                    console.error('Failed to write audit log:', err);
                });
            }
        }
        return originalJson.call(this, body);
    };
    next();
};
exports.auditLog = auditLog;
//# sourceMappingURL=audit.middleware.js.map