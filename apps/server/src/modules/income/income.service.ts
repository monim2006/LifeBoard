import { prisma } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';

export const getIncomes = (userId: string, startDate?: Date, endDate?: Date) =>
  prisma.income.findMany({
    where: {
      userId,
      ...(startDate && endDate ? { date: { gte: startDate, lte: endDate } } : {}),
    },
    orderBy: { date: 'desc' },
  });

export const createIncome = (userId: string, data: any) =>
  prisma.income.create({ data: { ...data, userId, date: new Date(data.date) } });

export const updateIncome = async (incomeId: string, userId: string, data: any) => {
  const income = await prisma.income.findFirst({ where: { id: incomeId, userId } });
  if (!income) throw new NotFoundError('Income entry not found');

  const updateData = { ...data };
  if (updateData.date) updateData.date = new Date(updateData.date);
  return prisma.income.update({ where: { id: incomeId }, data: updateData });
};

export const deleteIncome = async (incomeId: string, userId: string) => {
  const income = await prisma.income.findFirst({ where: { id: incomeId, userId } });
  if (!income) throw new NotFoundError('Income entry not found');
  await prisma.income.delete({ where: { id: incomeId } });
};

export const getIncomeSources = (userId: string) =>
  prisma.income.groupBy({
    by: ['source'],
    where: { userId },
  }).then(results => results.map(r => ({ source: r.source })));

export const getMonthlyTotal = (userId: string, month: number, year: number) =>
  prisma.income.aggregate({
    where: {
      userId,
      date: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59, 999),
      },
    },
    _sum: { amount: true },
  });
