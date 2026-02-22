import { apiClient } from '@/lib/api-client';
import type {
  LessonCategory,
  Lesson,
  LessonWithProgress,
  LessonProgress,
  CompleteLessonInput,
  LessonsListParams,
} from '@/types/lesson';

export const lessonsApi = {
  getCategories() {
    return apiClient.get<{ categories: LessonCategory[] }>(
      '/api/lessons/categories'
    );
  },

  getLessons(params?: LessonsListParams) {
    const queryParams: Record<string, string> = {};
    if (params?.categorySlug) queryParams.categorySlug = params.categorySlug;
    if (params?.difficulty) queryParams.difficulty = params.difficulty;
    if (params?.search) queryParams.search = params.search;
    if (params?.status) queryParams.status = params.status;

    return apiClient.get<{ lessons: (Lesson | LessonWithProgress)[] }>(
      '/api/lessons',
      Object.keys(queryParams).length > 0 ? queryParams : undefined
    );
  },

  getLesson(lessonId: string) {
    return apiClient.get<{ lesson: Lesson | LessonWithProgress }>(
      `/api/lessons/${lessonId}`
    );
  },

  completeLesson(lessonId: string, input: CompleteLessonInput) {
    return apiClient.post<{
      progress: LessonProgress;
      tokensAwarded: number;
      newBalance: number;
    }>(`/api/lessons/${lessonId}/complete`, input);
  },
};
