import { prisma } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';

export const getOrCreateDailyLog = async (userId: string, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  let dailyLog = await prisma.dailyLog.findFirst({
    where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    include: { timelineEvents: { orderBy: { order: 'asc' } }, meals: { orderBy: { createdAt: 'asc' } }, attachments: true },
  });

  if (!dailyLog) {
    dailyLog = await prisma.dailyLog.create({
      data: { userId, date: startOfDay },
      include: { timelineEvents: { orderBy: { order: 'asc' } }, meals: { orderBy: { createdAt: 'asc' } }, attachments: true },
    });
  }

  return dailyLog;
};

export const getDailyLog = async (userId: string, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const dailyLog = await prisma.dailyLog.findFirst({
    where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    include: { timelineEvents: { orderBy: { order: 'asc' } }, meals: { orderBy: { createdAt: 'asc' } }, attachments: true },
  });

  return dailyLog;
};

export const updateDailyLog = async (userId: string, date: Date, data: Record<string, any>) => {
  const log = await getOrCreateDailyLog(userId, date);
  return prisma.dailyLog.update({
    where: { id: log.id },
    data,
    include: { timelineEvents: { orderBy: { order: 'asc' } }, meals: { orderBy: { createdAt: 'asc' } }, attachments: true },
  });
};

export const createTimelineEvent = async (userId: string, date: Date, data: {
  title: string; description?: string; startTime: string; endTime?: string; category: string; color?: string;
}) => {
  const log = await getOrCreateDailyLog(userId, date);
  const maxOrder = await prisma.timelineEvent.aggregate({
    where: { dailyLogId: log.id },
    _max: { order: true },
  });

  return prisma.timelineEvent.create({
    data: {
      dailyLogId: log.id,
      userId,
      date: log.date,
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      category: data.category,
      color: data.color,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
};

export const updateTimelineEvent = async (eventId: string, userId: string, data: Record<string, any>) => {
  const event = await prisma.timelineEvent.findFirst({ where: { id: eventId, userId } });
  if (!event) throw new NotFoundError('Timeline event not found');

  return prisma.timelineEvent.update({ where: { id: eventId }, data });
};

export const deleteTimelineEvent = async (eventId: string, userId: string) => {
  const event = await prisma.timelineEvent.findFirst({ where: { id: eventId, userId } });
  if (!event) throw new NotFoundError('Timeline event not found');

  await prisma.timelineEvent.delete({ where: { id: eventId } });
};

export const createMeal = async (userId: string, date: Date, data: {
  type: string; name: string; calories?: number; notes?: string; time?: string;
}) => {
  const log = await getOrCreateDailyLog(userId, date);
  return prisma.meal.create({
    data: {
      dailyLogId: log.id,
      userId,
      type: data.type,
      name: data.name,
      calories: data.calories,
      notes: data.notes,
      time: data.time,
    },
  });
};

export const searchDailyLogs = async (userId: string, query: string) => {
  if (!query.trim()) return [];

  return prisma.dailyLog.findMany({
    where: {
      userId,
      journalEntry: { contains: query, mode: 'insensitive' },
    },
    include: { timelineEvents: { orderBy: { order: 'asc' } }, meals: { orderBy: { createdAt: 'asc' } } },
    orderBy: { date: 'desc' },
    take: 50,
  });
};

export const deleteMeal = async (mealId: string, userId: string) => {
  const meal = await prisma.meal.findFirst({ where: { id: mealId, userId } });
  if (!meal) throw new NotFoundError('Meal not found');
  await prisma.meal.delete({ where: { id: mealId } });
};
