import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import * as incomeController from './income.controller';
import { createIncomeSchema, updateIncomeSchema } from './income.schema';

const router = Router();

router.use(authenticate);

router.get('/', incomeController.list);
router.post('/', validateBody(createIncomeSchema), incomeController.create);
router.put('/:id', validateBody(updateIncomeSchema), incomeController.update);
router.delete('/:id', incomeController.remove);
router.get('/sources', incomeController.sources);
router.get('/monthly/:year/:month', incomeController.monthlyTotal);

export default router;
