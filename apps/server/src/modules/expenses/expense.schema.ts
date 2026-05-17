import { z } from 'zod';

export const addExpenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  subCategory: z.string().optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  paymentMethod: z.string().optional(),
  isRecurring: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
});

export const updateExpenseSchema = addExpenseSchema.partial();
