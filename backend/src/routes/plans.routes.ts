import express from 'express';
import { getPlans, purchasePlan, payInstallment, seedPlans } from '../controllers/plans.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Public / Dev routes
router.get('/seed', seedPlans);
router.get('/', getPlans);

// Protected routes
router.use(authenticate);
router.post('/purchase', purchasePlan);
router.post('/pay', payInstallment);

export default router;
