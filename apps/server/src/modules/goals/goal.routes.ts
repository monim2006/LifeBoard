import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import * as goalController from './goal.controller';
import { createGoalSchema, updateGoalSchema, createMilestoneSchema } from './goal.schema';

const router = Router();

router.use(authenticate);

router.get('/', goalController.list);
router.get('/:id', goalController.get);
router.post('/', validateBody(createGoalSchema), goalController.create);
router.put('/:id', validateBody(updateGoalSchema), goalController.update);
router.delete('/:id', goalController.remove);

router.post('/:id/milestones', validateBody(createMilestoneSchema), goalController.addMilestone);
router.patch('/milestones/:milestoneId/toggle', goalController.toggleMilestone);
router.delete('/milestones/:milestoneId', goalController.removeMilestone);

export default router;
