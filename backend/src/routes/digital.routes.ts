import express from 'express';
import { getBalance, getTransactions, createTransaction, getLockerDashboard, getDigitalUsers, getUserMetalTransactions, redeemUserMetal } from '../controllers/digital.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate); // Require authentication for all routes

router.get('/balance', getBalance);
router.get('/locker', getLockerDashboard);
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);

// Admin routes
router.get('/admin/users', authorizeAdmin, getDigitalUsers);
router.get('/admin/user/:userId/transactions/:metalType', authorizeAdmin, getUserMetalTransactions);
router.post('/admin/user/:userId/redeem/:metalType', authorizeAdmin, redeemUserMetal);

export default router;
