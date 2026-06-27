import { prisma } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';

const formatDayOfWeek = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const normalizeDate = (dateString: string) => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const createWeekPlan = async (userId: string, weekStartDate?: string) => {
  const start = weekStartDate
    ? normalizeDate(weekStartDate)
    : normalizeDate(new Date().toISOString());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const plan = await prisma.weeklyPlan.create({
    data: {
      userId,
      weekStartDate: start,
      weekEndDate: end,
    },
  });

  return plan;
};

export const getWeekPlan = async (userId: string, weekStartDate?: string) => {
  const start = weekStartDate
    ? normalizeDate(weekStartDate)
    : normalizeDate(new Date().toISOString());

  const plan = await prisma.weeklyPlan.findFirst({
    where: { userId, weekStartDate: start },
    include: { timeBlocks: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!plan) {
    return createWeekPlan(userId, start.toISOString());
  }

  return plan;
};

export const addTimeBlock = async (
  planId: string,
  data: {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    category: string;
    priority?: string;
    color?: string;
  }
) => {
  const blockDate = normalizeDate(data.date);
  return prisma.timeBlock.create({
    data: {
      planId,
      date: blockDate,
      dayOfWeek: formatDayOfWeek(blockDate),
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      category: data.category,
      priority: data.priority ?? 'medium',
      color: data.color,
    },
  });
};

export const updateTimeBlock = async (
  blockId: string,
  data: Partial<{
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    category: string;
    priority: string;
    color: string;
    isCompleted: boolean;
  }>
) => {
  const updateData: any = { ...data };

  if (data.date) {
    const date = normalizeDate(data.date);
    updateData.date = date;
    updateData.dayOfWeek = formatDayOfWeek(date);
  }

  return prisma.timeBlock.update({
    where: { id: blockId },
    data: updateData,
  });
};

export const deleteTimeBlock = async (blockId: string) => {
  await prisma.timeBlock.delete({ where: { id: blockId } });
};

export const listPlans = async (userId: string, includeTemplates: boolean) => {
  const where: any = { userId };
  if (!includeTemplates) {
    where.isTemplate = false;
  }
  return prisma.weeklyPlan.findMany({
    where,
    include: { timeBlocks: true },
    orderBy: { weekStartDate: 'desc' },
  });
};

export const deletePlan = async (planId: string, userId: string) => {
  const plan = await prisma.weeklyPlan.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== userId) {
    throw new NotFoundError('Plan not found');
  }
  await prisma.timeBlock.deleteMany({ where: { planId } });
  await prisma.weeklyPlan.delete({ where: { id: planId } });
};

export const toggleTimeBlock = async (blockId: string) => {
  const block = await prisma.timeBlock.findUnique({ where: { id: blockId } });
  if (!block) {
    throw new NotFoundError('Time block not found');
  }

  return prisma.timeBlock.update({
    where: { id: blockId },
    data: {
      isCompleted: !block.isCompleted,
      completedAt: block.isCompleted ? null : new Date(),
    },
  });
};
