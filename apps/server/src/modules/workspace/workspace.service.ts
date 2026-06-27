import { prisma } from '../../utils/database';
import { NotFoundError, ValidationError, UnauthorizedError } from '../../utils/errors';
import bcrypt from 'bcryptjs';

// ─── Profile Management ─────────────────────────────────────────────────────

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');
  return user;
};

export const updateProfile = async (userId: string, data: any) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  if (data.username && data.username !== user.username) {
    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing) throw new ValidationError('Username already taken');
  }
  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ValidationError('Email already taken');
  }

  return prisma.user.update({ where: { id: userId }, data });
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new ValidationError('Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
};

export const uploadAvatar = async (userId: string, avatar: string) => {
  return prisma.user.update({ where: { id: userId }, data: { avatar } });
};

// ─── Data Management ────────────────────────────────────────────────────────

export const exportAllData = async (userId: string) => {
  const [user, dailyLogs, plans, expenses, incomes, habits, goals, projects, categories, notifications] =
    await prisma.$transaction([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, username: true, theme: true, currency: true, weekStartDay: true, language: true, timezone: true, createdAt: true } }),
      prisma.dailyLog.findMany({ where: { userId }, include: { timelineEvents: true, meals: true, attachments: true } }),
      prisma.weeklyPlan.findMany({ where: { userId }, include: { timeBlocks: true } }),
      prisma.expense.findMany({ where: { userId } }),
      prisma.income.findMany({ where: { userId } }),
      prisma.habit.findMany({ where: { userId }, include: { logs: true } }),
      prisma.goal.findMany({ where: { userId }, include: { milestones: true } }),
      prisma.project.findMany({ where: { userId }, include: { tasks: true } }),
      prisma.category.findMany({ where: { userId } }),
      prisma.notification.findMany({ where: { userId } }),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    user,
    dailyLogs,
    plans,
    expenses,
    incomes,
    habits,
    goals,
    projects,
    categories,
    notifications,
  };
};

export const importData = async (userId: string, data: any) => {
  const results: any[] = [];

  if (data.categories) {
    for (const cat of data.categories) {
      const existing = await prisma.category.findFirst({ where: { userId, name: cat.name, type: cat.type } });
      if (!existing) {
        await prisma.category.create({ data: { userId, name: cat.name, type: cat.type, color: cat.color, icon: cat.icon, archived: cat.archived ?? false, order: cat.order ?? 0 } });
        results.push({ type: 'category', name: cat.name, status: 'imported' });
      }
    }
  }

  if (data.habits) {
    for (const habit of data.habits) {
      const existing = await prisma.habit.findFirst({ where: { userId, name: habit.name } });
      if (!existing) {
        await prisma.habit.create({ data: { userId, name: habit.name, description: habit.description, category: habit.category, frequency: habit.frequency || 'daily', target: habit.target || 1, unit: habit.unit, color: habit.color, icon: habit.icon } });
        results.push({ type: 'habit', name: habit.name, status: 'imported' });
      }
    }
  }

  if (data.goals) {
    for (const goal of data.goals) {
      const existing = await prisma.goal.findFirst({ where: { userId, title: goal.title } });
      if (!existing) {
        await prisma.goal.create({ data: { userId, title: goal.title, description: goal.description, category: goal.category, status: goal.status || 'active', color: goal.color } });
        results.push({ type: 'goal', name: goal.title, status: 'imported' });
      }
    }
  }

  if (data.expenses) {
    for (const exp of data.expenses) {
      await prisma.expense.create({ data: { userId, amount: exp.amount, category: exp.category, description: exp.description, date: new Date(exp.date), paymentMethod: exp.paymentMethod } });
    }
    results.push({ type: 'expenses', count: data.expenses.length, status: 'imported' });
  }

  return { imported: results.length, details: results };
};

// ─── Backup ─────────────────────────────────────────────────────────────────

export const createBackup = async (userId: string) => {
  const exportData = await exportAllData(userId);
  const jsonString = JSON.stringify(exportData);
  const size = Buffer.byteLength(jsonString, 'utf-8');

  const backup = await prisma.backup.create({
    data: { userId, filename: `backup-${new Date().toISOString().split('T')[0]}.json`, data: exportData as any, size },
  });

  return { ...backup, data: undefined };
};

export const getBackups = (userId: string) =>
  prisma.backup.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { id: true, filename: true, size: true, createdAt: true } });

export const getBackup = async (backupId: string, userId: string) => {
  const backup = await prisma.backup.findFirst({ where: { id: backupId, userId } });
  if (!backup) throw new NotFoundError('Backup not found');
  return backup;
};

export const restoreBackup = async (backupId: string, userId: string) => {
  const backup = await prisma.backup.findFirst({ where: { id: backupId, userId } });
  if (!backup) throw new NotFoundError('Backup not found');
  const data = backup.data as any;
  return importData(userId, data);
};

export const deleteBackup = async (backupId: string, userId: string) => {
  const backup = await prisma.backup.findFirst({ where: { id: backupId, userId } });
  if (!backup) throw new NotFoundError('Backup not found');
  await prisma.backup.delete({ where: { id: backupId } });
};

// ─── Data Deletion ─────────────────────────────────────────────────────────

export const deleteAllPlannerData = (userId: string) =>
  prisma.weeklyPlan.deleteMany({ where: { userId } });

export const deleteAllJournalData = (userId: string) =>
  prisma.dailyLog.deleteMany({ where: { userId } });

export const deleteAllFinanceData = (userId: string) =>
  prisma.$transaction([
    prisma.expense.deleteMany({ where: { userId } }),
    prisma.income.deleteMany({ where: { userId } }),
    prisma.budget.deleteMany({ where: { userId } }),
  ]);

export const deleteAllHabits = (userId: string) =>
  prisma.habit.deleteMany({ where: { userId } });

export const deleteAllGoals = (userId: string) =>
  prisma.goal.deleteMany({ where: { userId } });

export const deleteAllProjects = (userId: string) =>
  prisma.project.deleteMany({ where: { userId } });

export const deleteAllCategories = (userId: string) =>
  prisma.category.deleteMany({ where: { userId } });

export const eraseAllData = async (userId: string) => {
  await prisma.$transaction([
    prisma.dailyLog.deleteMany({ where: { userId } }),
    prisma.weeklyPlan.deleteMany({ where: { userId } }),
    prisma.expense.deleteMany({ where: { userId } }),
    prisma.income.deleteMany({ where: { userId } }),
    prisma.budget.deleteMany({ where: { userId } }),
    prisma.habit.deleteMany({ where: { userId } }),
    prisma.goal.deleteMany({ where: { userId } }),
    prisma.project.deleteMany({ where: { userId } }),
    prisma.category.deleteMany({ where: { userId } }),
    prisma.notification.deleteMany({ where: { userId } }),
    prisma.backup.deleteMany({ where: { userId } }),
    prisma.achievement.deleteMany({ where: { userId } }),
  ]);
};

// ─── Account Deletion ───────────────────────────────────────────────────────

export const deleteAccount = async (userId: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new UnauthorizedError('Password is incorrect');

  await prisma.$transaction([
    prisma.dailyLog.deleteMany({ where: { userId } }),
    prisma.weeklyPlan.deleteMany({ where: { userId } }),
    prisma.expense.deleteMany({ where: { userId } }),
    prisma.income.deleteMany({ where: { userId } }),
    prisma.budget.deleteMany({ where: { userId } }),
    prisma.habit.deleteMany({ where: { userId } }),
    prisma.goal.deleteMany({ where: { userId } }),
    prisma.project.deleteMany({ where: { userId } }),
    prisma.category.deleteMany({ where: { userId } }),
    prisma.notification.deleteMany({ where: { userId } }),
    prisma.backup.deleteMany({ where: { userId } }),
    prisma.achievement.deleteMany({ where: { userId } }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
};
