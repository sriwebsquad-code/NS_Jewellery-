import express from 'express';
import { getPlans, createPlan, joinPlan, payInstallment, getUserPlans } from '../controllers/plans.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', getPlans);

router.use(authenticate);
router.post('/join', joinPlan);
router.post('/pay', payInstallment);
router.get('/my-plans', getUserPlans);
router.post('/create', authorizeAdmin, createPlan);

export default router;
