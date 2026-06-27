import { prisma } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';

export const getGoals = (userId: string) =>
  prisma.goal.findMany({
    where: { userId },
    include: {
      milestones: { orderBy: { order: 'asc' } },
      projects: { include: { tasks: { orderBy: { order: 'asc' } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

export const getGoal = async (goalId: string, userId: string) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    include: {
      milestones: { orderBy: { order: 'asc' } },
      projects: { include: { tasks: { orderBy: { order: 'asc' } } } },
    },
  });
  if (!goal) throw new NotFoundError('Goal not found');
  return goal;
};

export const createGoal = (userId: string, data: any) =>
  prisma.goal.create({ data: { ...data, userId }, include: { milestones: true, projects: true } });

export const updateGoal = async (goalId: string, userId: string, data: any) => {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw new NotFoundError('Goal not found');
  return prisma.goal.update({
    where: { id: goalId },
    data,
    include: { milestones: { orderBy: { order: 'asc' } }, projects: { include: { tasks: { orderBy: { order: 'asc' } } } } },
  });
};

export const deleteGoal = async (goalId: string, userId: string) => {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw new NotFoundError('Goal not found');
  await prisma.goal.delete({ where: { id: goalId } });
};

export const createMilestone = async (goalId: string, userId: string, data: { title: string; order?: number }) => {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw new NotFoundError('Goal not found');

  const maxOrder = await prisma.milestone.aggregate({
    where: { goalId },
    _max: { order: true },
  });

  return prisma.milestone.create({
    data: { goalId, title: data.title, order: data.order ?? (maxOrder._max.order ?? -1) + 1 },
  });
};

export const toggleMilestone = async (milestoneId: string, userId: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { goal: true },
  });
  if (!milestone || milestone.goal.userId !== userId) throw new NotFoundError('Milestone not found');

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: { completed: !milestone.completed, completedAt: !milestone.completed ? new Date() : null },
  });

  const allMilestones = await prisma.milestone.findMany({ where: { goalId: milestone.goalId } });
  const completedCount = allMilestones.filter((m) => m.completed).length;
  const progress = Math.round((completedCount / allMilestones.length) * 100);

  await prisma.goal.update({ where: { id: milestone.goalId }, data: { progress } });

  return updated;
};

export const deleteMilestone = async (milestoneId: string, userId: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { goal: true },
  });
  if (!milestone || milestone.goal.userId !== userId) throw new NotFoundError('Milestone not found');
  await prisma.milestone.delete({ where: { id: milestoneId } });
};
