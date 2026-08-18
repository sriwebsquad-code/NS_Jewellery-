import { Router } from 'express';
import { getProfile, updateProfile, getAllUsers } from '../controllers/user.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin routes
router.get('/', authorizeAdmin, getAllUsers);

export default router;
