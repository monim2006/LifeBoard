import { prisma } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';

export const getHabits = (userId: string) =>
  prisma.habit.findMany({
    where: { userId },
    include: { logs: { orderBy: { date: 'desc' }, take: 31 } },
    orderBy: { createdAt: 'desc' },
  });

export const getHabit = async (habitId: string, userId: string) => {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId }, include: { logs: { orderBy: { date: 'desc' } } } });
  if (!habit) throw new NotFoundError('Habit not found');
  return habit;
};

export const createHabit = (userId: string, data: any) =>
  prisma.habit.create({ data: { ...data, userId } });

export const updateHabit = async (habitId: string, userId: string, data: any) => {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw new NotFoundError('Habit not found');
  return prisma.habit.update({ where: { id: habitId }, data });
};

export const deleteHabit = async (habitId: string, userId: string) => {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw new NotFoundError('Habit not found');
  await prisma.habit.delete({ where: { id: habitId } });
};

export const logHabit = async (userId: string, data: { habitId: string; date: string; value?: number; note?: string }) => {
  const habit = await prisma.habit.findFirst({ where: { id: data.habitId, userId } });
  if (!habit) throw new NotFoundError('Habit not found');

  const logDate = new Date(data.date);
  logDate.setHours(0, 0, 0, 0);

  return prisma.habitLog.upsert({
    where: { habitId_userId_date: { habitId: data.habitId, userId, date: logDate } },
    update: { value: data.value ?? 1, note: data.note },
    create: { habitId: data.habitId, userId, date: logDate, value: data.value ?? 1, note: data.note },
  });
};

export const getHabitStreak = async (habitId: string, userId: string) => {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId }, include: { logs: { orderBy: { date: 'desc' } } } });
  if (!habit) throw new NotFoundError('Habit not found');

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const log of habit.logs) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - streak);
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (logDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return { streak, totalLogs: habit.logs.length };
};
