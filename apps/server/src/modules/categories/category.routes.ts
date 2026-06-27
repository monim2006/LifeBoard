import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import * as categoryController from './category.controller';
import { createCategorySchema, updateCategorySchema } from './category.schema';

const router = Router();

router.use(authenticate);

router.get('/', categoryController.list);
router.get('/:id', categoryController.get);
router.post('/', validateBody(createCategorySchema), categoryController.create);
router.put('/:id', validateBody(updateCategorySchema), categoryController.update);
router.delete('/:id', categoryController.remove);
router.patch('/:id/archive', categoryController.toggleArchive);
router.post('/reorder', categoryController.reorder);

export default router;
