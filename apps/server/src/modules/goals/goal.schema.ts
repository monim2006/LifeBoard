import { z } from 'zod';

export const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid date string',
});

export const createGoalSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  category: z.string().min(1).max(50),
  startDate: dateString.optional(),
  targetDate: dateString.optional(),
  color: z.string().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().optional(),
  category: z.string().min(1).max(50).optional(),
  targetDate: dateString.optional(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  color: z.string().optional(),
});

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(200),
  order: z.number().int().min(0).optional(),
});
