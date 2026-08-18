import express from 'express';
import { getBalance, getTransactions, createTransaction } from '../controllers/digital.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate); // Require authentication for all routes

router.get('/balance', getBalance);
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);

export default router;
