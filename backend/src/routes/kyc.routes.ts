import express from 'express';
import { sendAadharOTP, verifyAadharOTP } from '../controllers/kyc.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/aadhar/send-otp', authenticate, sendAadharOTP);
router.post('/aadhar/verify', authenticate, verifyAadharOTP);

export default router;
