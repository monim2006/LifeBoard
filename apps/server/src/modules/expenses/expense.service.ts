import { prisma } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';

export const addExpense = async (
  userId: string,
  data: {
    amount: number;
    category: string;
    subCategory?: string;
    description?: string;
    date?: string;
    paymentMethod?: string;
    isRecurring?: boolean;
    tags?: string[];
    location?: string;
  }
) => {
  const date = data.date ? new Date(data.date) : new Date();
  return prisma.expense.create({
    data: {
      userId,
      amount: data.amount,
      category: data.category,
      subCategory: data.subCategory,
      description: data.description,
      date,
      paymentMethod: data.paymentMethod,
      isRecurring: data.isRecurring ?? false,
      tags: data.tags ?? [],
      location: data.location,
    },
  });
};

export const getExpenses = async (
  userId: string,
  filters: {
    startDate?: string;
    endDate?: string;
    category?: string;
    limit?: number;
    page?: number;
  }
) => {
  const where: any = { userId };

  if (filters.startDate || filters.endDate) {
    where.date = {};
  }

  if (filters.startDate) {
    where.date.gte = new Date(filters.startDate);
  }

  if (filters.endDate) {
    where.date.lte = new Date(filters.endDate);
  }

  if (filters.category) {
    where.category = filters.category;
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  const [data, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return { data, total, page, limit };
};

export const updateExpense = async (
  expenseId: string,
  userId: string,
  data: Partial<{
    amount: number;
    category: string;
    subCategory: string;
    description: string;
    date: string;
    paymentMethod: string;
    isRecurring: boolean;
    tags: string[];
    location: string;
  }>
) => {
  const existing = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!existing || existing.userId !== userId) {
    throw new NotFoundError('Expense not found');
  }

  const updateData: any = { ...data };
  if (data.date) updateData.date = new Date(data.date);

  return prisma.expense.update({
    where: { id: expenseId },
    data: updateData,
  });
};

export const deleteExpense = async (expenseId: string, userId: string) => {
  const existing = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!existing || existing.userId !== userId) {
    throw new NotFoundError('Expense not found');
  }

  await prisma.expense.delete({ where: { id: expenseId } });
};

export const getDailyTotal = async (userId: string, date: string) => {
  const day = new Date(date);
  const startOfDay = new Date(day);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(day);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await prisma.expense.aggregate({
    where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    _sum: { amount: true },
  });

  return result._sum.amount ?? 0;
};

export const getWeeklyTotal = async (userId: string, weekStartDate: string) => {
  const start = new Date(weekStartDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const result = await prisma.expense.aggregate({
    where: { userId, date: { gte: start, lte: end } },
    _sum: { amount: true },
  });

  return result._sum.amount ?? 0;
};

// ─── Budget CRUD ────────────────────────────────────────────────────────────

export const getBudgets = (userId: string) =>
  prisma.budget.findMany({ where: { userId }, orderBy: [{ year: 'desc' }, { month: 'desc' }] });

export const upsertBudget = async (userId: string, data: { month: number; year: number; category: string; budgetAmount: number; alertThreshold?: number }) => {
  const existing = await prisma.budget.findFirst({
    where: { userId, month: data.month, year: data.year, category: data.category },
  });

  if (existing) {
    return prisma.budget.update({
      where: { id: existing.id },
      data: { budgetAmount: data.budgetAmount, alertThreshold: data.alertThreshold ?? 80 },
    });
  }

  return prisma.budget.create({
    data: { userId, month: data.month, year: data.year, category: data.category, budgetAmount: data.budgetAmount, alertThreshold: data.alertThreshold ?? 80 },
  });
};

export const updateBudget = async (budgetId: string, userId: string, data: { budgetAmount?: number; alertThreshold?: number }) => {
  const existing = await prisma.budget.findUnique({ where: { id: budgetId } });
  if (!existing || existing.userId !== userId) throw new NotFoundError('Budget not found');
  return prisma.budget.update({ where: { id: budgetId }, data });
};

export const deleteBudget = async (budgetId: string, userId: string) => {
  const existing = await prisma.budget.findUnique({ where: { id: budgetId } });
  if (!existing || existing.userId !== userId) throw new NotFoundError('Budget not found');
  await prisma.budget.delete({ where: { id: budgetId } });
};

export const getCategoryBreakdown = async (userId: string, startDate: string, endDate: string) => {
  const breakdown = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      userId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    _sum: { amount: true },
  });

  return breakdown.map((entry) => ({
    category: entry.category,
    total: entry._sum.amount ?? 0,
  }));
};
