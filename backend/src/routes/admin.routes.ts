import { Router } from 'express';
import { getDashboardStats, getTransactions, verifyTransaction, verifyAdminPassword, deleteCustomer } from '../controllers/admin.controller';
import { getReports } from '../controllers/reports.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = Router();

router.post('/verify-password', authenticate, authorizeAdmin, verifyAdminPassword);
router.delete('/customer/:id', authenticate, authorizeAdmin, auditLog, deleteCustomer);

router.get('/dashboard/stats', authenticate, authorizeAdmin, getDashboardStats);
router.get('/transactions', authenticate, authorizeAdmin, getTransactions);
router.post('/transactions/:id/verify', authenticate, authorizeAdmin, auditLog, verifyTransaction);
router.get('/reports', authenticate, authorizeAdmin, getReports);

export default router;
