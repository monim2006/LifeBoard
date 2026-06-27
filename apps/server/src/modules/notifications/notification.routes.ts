import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as notificationController from './notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.list);
router.patch('/:id/read', notificationController.markRead);
router.post('/mark-all-read', notificationController.markAllRead);
router.delete('/:id', notificationController.remove);
router.delete('/', notificationController.clearAll);

export default router;
