import { z } from 'zod';

export const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid date string',
});

export const createDailyLogSchema = z.object({
  date: dateString,
  mood: z.number().int().min(1).max(10).optional(),
  energy: z.number().int().min(1).max(10).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().int().min(1).max(10).optional(),
  waterGlasses: z.number().int().min(0).optional(),
  workout: z.boolean().optional(),
  workoutNotes: z.string().optional(),
  journalEntry: z.string().optional(),
  notes: z.string().optional(),
  tomorrowPlan: z.string().optional(),
});

export const updateDailyLogSchema = createDailyLogSchema.partial().omit({ date: true });

export const createTimelineEventSchema = z.object({
  date: dateString,
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format').optional(),
  category: z.string().min(1).max(50),
  color: z.string().optional(),
});

export const updateTimelineEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format').optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format').optional(),
  category: z.string().min(1).max(50).optional(),
  color: z.string().optional(),
});

export const createMealSchema = z.object({
  date: dateString,
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  name: z.string().min(1).max(200),
  calories: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format').optional(),
});
