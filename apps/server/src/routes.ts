import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import plannerRoutes from './modules/planner/planner.routes';
import expenseRoutes from './modules/expenses/expense.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/plans', plannerRoutes);
router.use('/expenses', expenseRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
