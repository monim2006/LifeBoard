import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { z } from 'zod';
import * as workspaceController from './workspace.controller';

const router = Router();

router.use(authenticate);

// Profile
router.get('/profile', workspaceController.getProfile);
router.put('/profile', validateBody(z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
  theme: z.string().optional(),
  currency: z.string().optional(),
  weekStartDay: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
})), workspaceController.updateProfile);
router.post('/change-password', validateBody(z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})), workspaceController.changePasswordHandler);
router.post('/avatar', validateBody(z.object({ avatar: z.string() })), workspaceController.uploadAvatarHandler);

// Data Management
router.get('/export', workspaceController.exportData);
router.post('/import', validateBody(z.object({ data: z.any() })), workspaceController.importData);

// Backups
router.get('/backups', workspaceController.listBackups);
router.post('/backups', workspaceController.createBackup);
router.get('/backups/:id', workspaceController.getBackup);
router.post('/backups/:id/restore', workspaceController.restoreBackup);
router.delete('/backups/:id', workspaceController.removeBackup);

// Data Deletion
router.delete('/data/planner', workspaceController.deletePlannerData);
router.delete('/data/journal', workspaceController.deleteJournalData);
router.delete('/data/finance', workspaceController.deleteFinanceData);
router.delete('/data/habits', workspaceController.deleteHabits);
router.delete('/data/goals', workspaceController.deleteGoals);
router.delete('/data/projects', workspaceController.deleteProjects);
router.delete('/data/categories', workspaceController.deleteCategories);
router.delete('/data/all', workspaceController.eraseAllData);

// Account
router.delete('/account', validateBody(z.object({ password: z.string().min(1) })), workspaceController.deleteAccountHandler);

export default router;
