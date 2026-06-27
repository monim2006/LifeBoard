import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as achievementController from './achievement.controller';

const router = Router();

router.use(authenticate);

router.get('/', achievementController.list);
router.post('/check', achievementController.check);
router.get('/stats', achievementController.stats);

export default router;
