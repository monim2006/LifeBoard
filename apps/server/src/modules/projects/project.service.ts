import { prisma } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';

export const getProjects = (userId: string) =>
  prisma.project.findMany({
    where: { userId },
    include: { tasks: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

export const getProject = async (projectId: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { tasks: { orderBy: { order: 'asc' } } },
  });
  if (!project) throw new NotFoundError('Project not found');
  return project;
};

export const createProject = (userId: string, data: any) =>
  prisma.project.create({ data: { ...data, userId }, include: { tasks: true } });

export const updateProject = async (projectId: string, userId: string, data: any) => {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new NotFoundError('Project not found');
  return prisma.project.update({
    where: { id: projectId },
    data,
    include: { tasks: { orderBy: { order: 'asc' } } },
  });
};

export const deleteProject = async (projectId: string, userId: string) => {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new NotFoundError('Project not found');
  await prisma.project.delete({ where: { id: projectId } });
};

export const createTask = async (projectId: string, userId: string, data: any) => {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new NotFoundError('Project not found');

  const maxOrder = await prisma.projectTask.aggregate({
    where: { projectId },
    _max: { order: true },
  });

  return prisma.projectTask.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      priority: data.priority ?? 'medium',
      deadline: data.deadline,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
};

export const updateTask = async (taskId: string, userId: string, data: any) => {
  const task = await prisma.projectTask.findUnique({
    where: { id: taskId },
    include: { project: true },
  });
  if (!task || task.project.userId !== userId) throw new NotFoundError('Task not found');
  return prisma.projectTask.update({ where: { id: taskId }, data });
};

export const deleteTask = async (taskId: string, userId: string) => {
  const task = await prisma.projectTask.findUnique({
    where: { id: taskId },
    include: { project: true },
  });
  if (!task || task.project.userId !== userId) throw new NotFoundError('Task not found');
  await prisma.projectTask.delete({ where: { id: taskId } });
};
