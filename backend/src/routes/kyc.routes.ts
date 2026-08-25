import express from 'express';
import { sendAadhaarOTP, verifyAadhaarOTP, verifyPAN } from '../controllers/kyc.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/aadhar/send-otp', authenticate, sendAadhaarOTP);
router.post('/aadhar/verify', authenticate, verifyAadhaarOTP);
router.post('/pan/verify', authenticate, verifyPAN);

export default router;
