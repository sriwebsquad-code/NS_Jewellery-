import express from 'express';
import { getLocker, buyDigitalCoin } from '../controllers/digital.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate); // Require authentication for all routes

router.get('/locker', getLocker);
router.post('/buy', buyDigitalCoin);

export default router;
