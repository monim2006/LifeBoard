import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  createWeekPlan,
  getCurrentWeekPlan,
  getWeekPlanByStart,
  addTimeBlock,
  updateTimeBlock,
  toggleTimeBlock,
  deleteTimeBlock,
  listPlans,
  deletePlan,
} from './planner.controller';
import { validateBody } from '../../middleware/validate';
import { createWeekPlanSchema, addTimeBlockSchema, updateTimeBlockSchema } from './planner.schema';

const router = Router();

router.use(authenticate);
router.get('/', listPlans);
router.get('/current-week', getCurrentWeekPlan);
router.get('/week/:startDate', getWeekPlanByStart);
router.post('/week', validateBody(createWeekPlanSchema), createWeekPlan);
router.delete('/:planId', deletePlan);
router.post('/:planId/blocks', validateBody(addTimeBlockSchema), addTimeBlock);
router.put('/blocks/:blockId', validateBody(updateTimeBlockSchema), updateTimeBlock);
router.patch('/blocks/:blockId/toggle', toggleTimeBlock);
router.delete('/blocks/:blockId', deleteTimeBlock);

export default router;
