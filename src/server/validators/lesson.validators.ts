import { z } from 'zod/v4';

export const completeLessonSchema = z.object({
  score: z.number().int().min(0).max(100).optional(),
  timeSpentSeconds: z.number().int().min(0),
});

export const lessonQuerySchema = z.object({
  categorySlug: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;
export type LessonQueryInput = z.infer<typeof lessonQuerySchema>;
