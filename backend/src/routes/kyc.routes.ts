import express from 'express';
import { submitKyc } from '../controllers/kyc.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/submit', authenticate, submitKyc);

export default router;
