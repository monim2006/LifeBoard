import { prisma } from '../../utils/database';

export const getAchievements = (userId: string) =>
  prisma.achievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
  });

export const checkAndAward = async (userId: string) => {
  const achievements = await prisma.achievement.findMany({ where: { userId } });
  const existingTypes = new Set(achievements.map((a) => a.type));
  const newAchievements: Array<{ userId: string; type: string; title: string; description: string; xpReward: number }> = [];

  // First daily log
  const dailyLogCount = await prisma.dailyLog.count({ where: { userId } });
  if (dailyLogCount >= 1 && !existingTypes.has('first_day')) {
    newAchievements.push({ userId, type: 'first_day', title: 'First Day', description: 'Completed your first daily log', xpReward: 50 });
  }

  // 7-day streak
  if (dailyLogCount >= 7 && !existingTypes.has('week_streak')) {
    newAchievements.push({ userId, type: 'week_streak', title: 'Week Warrior', description: 'Logged 7 days', xpReward: 100 });
  }

  // First habit completed
  const habitLogCount = await prisma.habitLog.count({ where: { userId } });
  if (habitLogCount >= 1 && !existingTypes.has('first_habit')) {
    newAchievements.push({ userId, type: 'first_habit', title: 'First Habit', description: 'Completed your first habit', xpReward: 50 });
  }

  // First expense tracked
  const expenseCount = await prisma.expense.count({ where: { userId } });
  if (expenseCount >= 1 && !existingTypes.has('first_expense')) {
    newAchievements.push({ userId, type: 'first_expense', title: 'First Expense', description: 'Tracked your first expense', xpReward: 25 });
  }

  // First goal created
  const goalCount = await prisma.goal.count({ where: { userId } });
  if (goalCount >= 1 && !existingTypes.has('first_goal')) {
    newAchievements.push({ userId, type: 'first_goal', title: 'Goal Setter', description: 'Created your first goal', xpReward: 75 });
  }

  if (newAchievements.length > 0) {
    await prisma.achievement.createMany({ data: newAchievements });
    const totalXp = newAchievements.reduce((sum, a) => sum + a.xpReward, 0);
    await prisma.user.update({ where: { id: userId }, data: { xp: { increment: totalXp } } });
  }

  return newAchievements;
};

export const getUserStats = async (userId: string) => {
  const [dailyLogs, habits, habitLogs, goals, expenses, achievements] = await Promise.all([
    prisma.dailyLog.count({ where: { userId } }),
    prisma.habit.count({ where: { userId } }),
    prisma.habitLog.count({ where: { userId } }),
    prisma.goal.count({ where: { userId } }),
    prisma.expense.count({ where: { userId } }),
    prisma.achievement.count({ where: { userId } }),
  ]);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true, level: true } });

  return {
    xp: user?.xp ?? 0,
    level: user?.level ?? 1,
    stats: { dailyLogs, habits, habitLogs, goals, expenses, achievements },
  };
};
