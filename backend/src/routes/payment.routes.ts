import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { createPaymentOrder, verifyPayment, renderCheckoutPage } from '../controllers/payment.controller';

const router = Router();

// Unprotected route for the WebView HTML
router.get('/checkout/:sessionId', renderCheckoutPage);

// All other payment routes require authentication
router.use(authenticate);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

export default router;
