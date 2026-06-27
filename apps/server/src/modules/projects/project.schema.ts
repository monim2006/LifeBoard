import { z } from 'zod';

export const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid date string',
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  goalId: z.string().optional(),
  color: z.string().optional(),
  deadline: dateString.optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  goalId: z.string().optional().nullable(),
  color: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).optional(),
  deadline: dateString.optional().nullable(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  deadline: dateString.optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  deadline: dateString.optional().nullable(),
  order: z.number().int().min(0).optional(),
});
