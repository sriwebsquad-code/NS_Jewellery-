import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public route to fetch settings (like WhatsApp number) for the mobile app
router.get('/', getSettings);

// Admin route to update settings
router.post('/', verifyToken, isAdmin, updateSettings);

export default router;
