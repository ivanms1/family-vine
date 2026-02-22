'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsApi } from '@/api/lessons';
import { lessonQueries } from '@/queries/lessons';
import { QUERY_KEYS } from '@/queries/keys';
import type { LessonsListParams, CompleteLessonInput } from '@/types/lesson';

export function useCategories() {
  return useQuery(lessonQueries.categories());
}

export function useLessons(params?: LessonsListParams) {
  return useQuery(lessonQueries.list(params));
}

export function useLesson(lessonId: string) {
  return useQuery(lessonQueries.detail(lessonId));
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      input,
    }: {
      lessonId: string;
      input: CompleteLessonInput;
    }) => lessonsApi.completeLesson(lessonId, input),
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LESSONS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LESSONS, lessonId],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOKENS] });
    },
  });
}
