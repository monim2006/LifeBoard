import { z } from 'zod';

export const createIncomeSchema = z.object({
  amount: z.number().positive(),
  source: z.string().min(1).max(200),
  description: z.string().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  isRecurring: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const updateIncomeSchema = createIncomeSchema.partial();
