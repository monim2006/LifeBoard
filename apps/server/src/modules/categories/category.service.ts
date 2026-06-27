import { prisma } from '../../utils/database';
import { NotFoundError, ValidationError } from '../../utils/errors';

export const getCategories = (userId: string, type?: string) =>
  prisma.category.findMany({
    where: { userId, ...(type ? { type } : {}) },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });

export const getCategory = async (categoryId: string, userId: string) => {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw new NotFoundError('Category not found');
  return category;
};

export const createCategory = async (userId: string, data: { name: string; type: string; color?: string; icon?: string }) => {
  const existing = await prisma.category.findFirst({
    where: { userId, name: data.name, type: data.type },
  });
  if (existing) throw new ValidationError('A category with that name already exists for this type');

  return prisma.category.create({ data: { ...data, userId } });
};

export const updateCategory = async (categoryId: string, userId: string, data: any) => {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw new NotFoundError('Category not found');

  if (data.name && data.name !== category.name) {
    const existing = await prisma.category.findFirst({
      where: { userId, name: data.name, type: data.type || category.type, id: { not: categoryId } },
    });
    if (existing) throw new ValidationError('A category with that name already exists');
  }

  return prisma.category.update({ where: { id: categoryId }, data });
};

export const deleteCategory = async (categoryId: string, userId: string) => {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw new NotFoundError('Category not found');
  await prisma.category.delete({ where: { id: categoryId } });
};

export const archiveCategory = async (categoryId: string, userId: string) => {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw new NotFoundError('Category not found');
  return prisma.category.update({ where: { id: categoryId }, data: { archived: !category.archived } });
};

export const reorderCategories = async (userId: string, items: { id: string; order: number }[]) => {
  await prisma.$transaction(
    items.map((item) =>
      prisma.category.updateMany({
        where: { id: item.id, userId },
        data: { order: item.order },
      })
    )
  );
};
