import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['task', 'expense', 'income', 'project', 'goal', 'habit', 'meal', 'journal', 'note', 'timeline']),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  archived: z.boolean().optional(),
  order: z.number().int().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
