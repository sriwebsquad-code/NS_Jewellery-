import { Router } from 'express';
import { verifyFirebaseOTP, createMPIN, loginWithMPIN, requestMpinReset, resetMpin } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint for Firebase phone authentication login
router.post('/verify-otp', verifyFirebaseOTP);

// MPIN Routes
router.post('/mpin/create', authenticate, createMPIN);
router.post('/mpin/login', loginWithMPIN);
router.post('/mpin/request-reset', requestMpinReset);
router.post('/mpin/reset', resetMpin);

export default router;
