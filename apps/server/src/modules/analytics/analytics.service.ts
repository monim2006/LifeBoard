import { prisma } from '../../utils/database';

export const getUserAnalytics = async (userId: string) => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const totalExpenses = await prisma.expense.aggregate({
    where: { userId, date: { gte: weekStart, lte: weekEnd } },
    _sum: { amount: true },
  });

  const planSummary = await prisma.weeklyPlan.findMany({
    where: { userId, weekStartDate: { gte: weekStart, lte: weekEnd } },
    include: { timeBlocks: true },
  });

  const completedBlocks = planSummary.reduce((count, plan) => {
    return count + plan.timeBlocks.filter((block) => block.isCompleted).length;
  }, 0);

  const totalBlocks = planSummary.reduce((count, plan) => count + plan.timeBlocks.length, 0);

  const categoryBreakdown = await prisma.expense.groupBy({
    by: ['category'],
    where: { userId, date: { gte: weekStart, lte: weekEnd } },
    _sum: { amount: true },
  });

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totalExpenses: totalExpenses._sum.amount ?? 0,
    completedBlocks,
    totalBlocks,
    categoryBreakdown: categoryBreakdown.map((group) => ({
      category: group.category,
      total: group._sum.amount ?? 0,
    })),
  };
};
