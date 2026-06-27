import { Request, Response, NextFunction } from 'express';
import * as workspaceService from './workspace.service';

const p = (params: any, key: string) => Array.isArray(params[key]) ? params[key][0] : params[key];

// ─── Profile ────────────────────────────────────────────────────────────────

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const user = await workspaceService.getProfile(userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const user = await workspaceService.updateProfile(userId, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const changePasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;
    const user = await workspaceService.changePassword(userId, currentPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatarHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { avatar } = req.body;
    const user = await workspaceService.uploadAvatar(userId, avatar);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── Data Management ────────────────────────────────────────────────────────

export const exportData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const data = await workspaceService.exportAllData(userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const importData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const result = await workspaceService.importData(userId, req.body.data);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── Backup ─────────────────────────────────────────────────────────────────

export const createBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const backup = await workspaceService.createBackup(userId);
    res.status(201).json({ success: true, data: backup });
  } catch (error) {
    next(error);
  }
};

export const listBackups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const backups = await workspaceService.getBackups(userId);
    res.json({ success: true, data: backups });
  } catch (error) {
    next(error);
  }
};

export const getBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const backup = await workspaceService.getBackup(p(req.params, 'id'), userId);
    res.json({ success: true, data: backup });
  } catch (error) {
    next(error);
  }
};

export const restoreBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const result = await workspaceService.restoreBackup(p(req.params, 'id'), userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const removeBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await workspaceService.deleteBackup(p(req.params, 'id'), userId);
    res.json({ success: true, message: 'Backup deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Data Deletion ──────────────────────────────────────────────────────────

export const deletePlannerData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await workspaceService.deleteAllPlannerData(userId);
    res.json({ success: true, message: 'All planner data deleted' });
  } catch (error) {
    next(error);
  }
};

export const deleteJournalData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await workspaceService.deleteAllJournalData(userId);
    res.json({ success: true, message: 'All journal data deleted' });
  } catch (error) {
    next(error);
  }
};

export const deleteFinanceData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await workspaceService.deleteAllFinanceData(userId);
    res.json({ success: true, message: 'All finance data deleted' });
  } catch (error) {
    next(error);
  }
};

export const deleteHabits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await workspaceService.deleteAllHabits(userId);
    res.json({ success: true, message: 'All habits deleted' });
  } catch (error) {
    next(error);
  }
};

export const deleteGoals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await workspaceService.deleteAllGoals(userId);
    res.json({ success: true, message: 'All goals deleted' });
  } catch (error) {
    next(error);
  }
};

export const deleteProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await workspaceService.deleteAllProjects(userId);
    res.json({ success: true, message: 'All projects deleted' });
  } catch (error) {
    next(error);
  }
};

export const deleteCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await workspaceService.deleteAllCategories(userId);
    res.json({ success: true, message: 'All categories deleted' });
  } catch (error) {
    next(error);
  }
};

export const eraseAllData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    await workspaceService.eraseAllData(userId);
    res.json({ success: true, message: 'All personal data erased' });
  } catch (error) {
    next(error);
  }
};

// ─── Account Deletion ───────────────────────────────────────────────────────

export const deleteAccountHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { password } = req.body;
    await workspaceService.deleteAccount(userId, password);
    res.clearCookie('refreshToken', { sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.json({ success: true, message: 'Account permanently deleted' });
  } catch (error) {
    next(error);
  }
};
