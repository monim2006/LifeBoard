import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import * as habitController from './habit.controller';
import { createHabitSchema, updateHabitSchema, createHabitLogSchema } from './habit.schema';

const router = Router();

router.use(authenticate);

router.get('/', habitController.list);
router.get('/:id', habitController.get);
router.post('/', validateBody(createHabitSchema), habitController.create);
router.put('/:id', validateBody(updateHabitSchema), habitController.update);
router.delete('/:id', habitController.remove);

router.post('/log', validateBody(createHabitLogSchema), habitController.log);
router.get('/:id/streak', habitController.streak);

export default router;
