import { z } from 'zod/v4';

export const createChallengeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  tokenReward: z.number().int().min(1).max(500).optional().default(50),
  requiredLessons: z.number().int().min(1).max(50),
  categoryId: z.string().optional(),
  endsAt: z.string().min(1, 'End date is required'),
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
