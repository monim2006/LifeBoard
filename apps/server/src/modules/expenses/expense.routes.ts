import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getTodayTotal,
  getWeeklyTotal,
  getCategoryBreakdown,
} from './expense.controller';
import { addExpenseSchema, updateExpenseSchema } from './expense.schema';

const router = Router();
router.use(authenticate);

router.get('/', getExpenses);
router.post('/', validateBody(addExpenseSchema), addExpense);
router.put('/:id', validateBody(updateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);
router.get('/today', getTodayTotal);
router.get('/weekly-total', getWeeklyTotal);
router.get('/breakdown', getCategoryBreakdown);

export default router;
