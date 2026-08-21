import express from 'express';
import { getPlans, createPlan, joinPlan, payInstallment, getUserPlans, getPlanUsers, getUserPlanTransactions, redeemUserPlan, getMyPlanTransactions } from '../controllers/plans.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', getPlans);

router.use(authenticate);
router.post('/join', joinPlan);
router.post('/pay', payInstallment);
router.get('/my-plans', getUserPlans);
router.get('/my-plan/:userPlanId/transactions', getMyPlanTransactions);
router.post('/create', authorizeAdmin, createPlan);
router.get('/:planId/users', authorizeAdmin, getPlanUsers);
router.get('/user-plan/:userPlanId/transactions', authorizeAdmin, getUserPlanTransactions);
router.post('/user-plan/:userPlanId/redeem', authorizeAdmin, redeemUserPlan);

export default router;
