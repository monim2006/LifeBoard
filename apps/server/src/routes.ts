import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import plannerRoutes from './modules/planner/planner.routes';
import expenseRoutes from './modules/expenses/expense.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import dailyRoutes from './modules/daily/daily.routes';
import habitRoutes from './modules/habits/habit.routes';
import goalRoutes from './modules/goals/goal.routes';
import projectRoutes from './modules/projects/project.routes';
import achievementRoutes from './modules/achievements/achievement.routes';
import incomeRoutes from './modules/income/income.routes';
import categoryRoutes from './modules/categories/category.routes';
import workspaceRoutes from './modules/workspace/workspace.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import aiRoutes from './modules/ai/ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/plans', plannerRoutes);
router.use('/expenses', expenseRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/daily', dailyRoutes);
router.use('/habits', habitRoutes);
router.use('/goals', goalRoutes);
router.use('/projects', projectRoutes);
router.use('/achievements', achievementRoutes);
router.use('/income', incomeRoutes);
router.use('/categories', categoryRoutes);
router.use('/workspace', workspaceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);

export default router;
