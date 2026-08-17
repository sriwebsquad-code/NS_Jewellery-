import { Router } from 'express';
import { getRates, updateRates } from '../controllers/rates.controller';

const router = Router();

router.get('/', getRates);
router.post('/', updateRates);

export default router;
