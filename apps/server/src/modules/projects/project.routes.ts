import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import * as projectController from './project.controller';
import { createProjectSchema, updateProjectSchema, createTaskSchema, updateTaskSchema } from './project.schema';

const router = Router();

router.use(authenticate);

router.get('/', projectController.list);
router.get('/:id', projectController.get);
router.post('/', validateBody(createProjectSchema), projectController.create);
router.put('/:id', validateBody(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.remove);

router.post('/:id/tasks', validateBody(createTaskSchema), projectController.addTask);
router.put('/tasks/:taskId', validateBody(updateTaskSchema), projectController.updateTask);
router.delete('/tasks/:taskId', projectController.removeTask);

export default router;
