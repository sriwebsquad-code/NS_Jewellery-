import { Router } from 'express';
import { getRates, getRateHistory, updateRates } from '../controllers/rates.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = Router();

router.get('/', getRates);
router.get('/history', authenticate, authorizeAdmin, getRateHistory);
router.post('/', authenticate, authorizeAdmin, auditLog, updateRates);

export default router;
