import { queryOptions } from '@tanstack/react-query';
import { lessonsApi } from '@/api/lessons';
import { QUERY_KEYS } from './keys';
import type { LessonsListParams } from '@/types/lesson';

export const lessonQueries = {
  categories: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.CATEGORIES],
      queryFn: () => lessonsApi.getCategories(),
    }),

  list: (params?: LessonsListParams) =>
    queryOptions({
      queryKey: [QUERY_KEYS.LESSONS, params ?? {}],
      queryFn: () => lessonsApi.getLessons(params),
    }),

  detail: (lessonId: string) =>
    queryOptions({
      queryKey: [QUERY_KEYS.LESSONS, lessonId],
      queryFn: () => lessonsApi.getLesson(lessonId),
      enabled: !!lessonId,
    }),
};
