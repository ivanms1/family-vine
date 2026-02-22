import { z } from 'zod/v4';

export const createSpendRequestSchema = z.object({
  amount: z.number().int().min(1, 'Amount must be at least 1'),
  reason: z.string().min(1, 'Reason is required').max(200),
  referenceId: z.string().optional(),
});

export const reviewSpendRequestSchema = z.object({
  status: z.enum(['APPROVED', 'DENIED']),
});

export type CreateSpendRequestInput = z.infer<typeof createSpendRequestSchema>;
export type ReviewSpendRequestInput = z.infer<typeof reviewSpendRequestSchema>;
