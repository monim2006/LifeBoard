import { z } from 'zod';

export const createHabitSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().min(1).max(50),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  target: z.number().int().min(1).default(1),
  unit: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const updateHabitSchema = createHabitSchema.partial();

export const createHabitLogSchema = z.object({
  habitId: z.string(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  value: z.number().min(0).default(1),
  note: z.string().optional(),
});
