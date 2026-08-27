"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const firebase_1 = require("../config/firebase");
// Reference to a single document for all global app settings
const SETTINGS_DOC = 'settings/app';
/**
 * Get App Settings (Public)
 * Used by mobile app to fetch WhatsApp number, etc.
 */
const getSettings = async (req, res) => {
    try {
        const docRef = firebase_1.db.doc(SETTINGS_DOC);
        const doc = await docRef.get();
        if (!doc.exists) {
            // Return default empty settings if not created yet
            return res.status(200).json({
                success: true,
                data: { whatsappNumber: '' }
            });
        }
        return res.status(200).json({
            success: true,
            data: doc.data()
        });
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
};
exports.getSettings = getSettings;
/**
 * Update App Settings (Admin Only)
 */
const updateSettings = async (req, res) => {
    try {
        const { whatsappNumber } = req.body;
        const docRef = firebase_1.db.doc(SETTINGS_DOC);
        // Use set with merge:true to create if it doesn't exist, or update if it does
        await docRef.set({ whatsappNumber, updatedAt: new Date() }, { merge: true });
        return res.status(200).json({
            success: true,
            message: 'Settings updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
};
exports.updateSettings = updateSettings;
//# sourceMappingURL=settings.controller.js.map