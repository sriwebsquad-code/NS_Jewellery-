import { Router } from 'express';
import { sendOTP, verifyOTP, verifyOtpOnly, sendEmailOTP, sendAdminPhoneOTP, createMPIN, loginWithMPIN, requestMpinReset, resetMpin } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint for Fast2SMS phone authentication login
router.post('/send-otp', sendOTP);
router.post('/send-email-otp', sendEmailOTP);
router.post('/send-admin-phone-otp', sendAdminPhoneOTP);
router.post('/verify-otp', verifyOTP);
router.post('/verify-otp-only', verifyOtpOnly);

// MPIN Routes
router.post('/mpin/create', authenticate, createMPIN);
router.post('/mpin/login', loginWithMPIN);
router.post('/mpin/request-reset', requestMpinReset);
router.post('/mpin/reset', resetMpin);

export default router;
