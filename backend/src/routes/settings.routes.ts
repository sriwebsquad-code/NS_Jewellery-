import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public route to fetch settings (like WhatsApp number) for the mobile app
router.get('/', getSettings);

// Admin route to update settings
router.post('/', authenticate, authorizeAdmin, updateSettings);

export default router;
