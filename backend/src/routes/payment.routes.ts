import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { createPaymentOrder, verifyPayment } from '../controllers/payment.controller';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

export default router;
