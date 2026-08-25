import { Request, Response } from 'express';
import { db } from '../config/firebase';

// Reference to a single document for all global app settings
const SETTINGS_DOC = 'settings/app';

/**
 * Get App Settings (Public)
 * Used by mobile app to fetch WhatsApp number, etc.
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    const docRef = db.doc(SETTINGS_DOC);
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
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

/**
 * Update App Settings (Admin Only)
 */
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { whatsappNumber } = req.body;
    const docRef = db.doc(SETTINGS_DOC);

    // Use set with merge:true to create if it doesn't exist, or update if it does
    await docRef.set({ whatsappNumber, updatedAt: new Date() }, { merge: true });

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};
