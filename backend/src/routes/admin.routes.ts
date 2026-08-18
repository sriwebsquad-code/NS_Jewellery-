import { Router } from 'express';
import { getDashboardStats, getTransactions, verifyTransaction } from '../controllers/admin.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = Router();

router.get('/dashboard/stats', authenticate, authorizeAdmin, getDashboardStats);
router.get('/transactions', authenticate, authorizeAdmin, getTransactions);
router.post('/transactions/:id/verify', authenticate, authorizeAdmin, auditLog, verifyTransaction);

export default router;
