import { z } from 'zod';

export const createWeekPlanSchema = z.object({
  weekStartDate: z.string().datetime().optional(),
});

export const addTimeBlockSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  category: z.string().min(1),
  priority: z.string().default('medium'),
  color: z.string().optional(),
});

export const updateTimeBlockSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  color: z.string().optional(),
  isCompleted: z.boolean().optional(),
});
