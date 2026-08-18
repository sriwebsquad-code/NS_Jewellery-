import { Router } from 'express';
import { getDashboardStats } from '../controllers/admin.controller';

const router = Router();

router.get('/dashboard/stats', getDashboardStats);

export default router;
