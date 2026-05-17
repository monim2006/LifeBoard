import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { analyticsOverview } from './analytics.controller';

const router = Router();
router.use(authenticate);

router.get('/overview', analyticsOverview);

export default router;
