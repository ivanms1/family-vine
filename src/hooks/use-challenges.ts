'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesApi } from '@/api/challenges';
import { challengeQueries, progressQueries } from '@/queries/challenges';
import { QUERY_KEYS } from '@/queries/keys';
import type { CreateChallengeInput } from '@/types/challenge';

// Parent hooks
export function useChallenges() {
  return useQuery(challengeQueries.list());
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateChallengeInput) =>
      challengesApi.createChallenge(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHALLENGES] });
    },
  });
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (challengeId: string) =>
      challengesApi.deleteChallenge(challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHALLENGES] });
    },
  });
}

// Child hooks
export function useChildChallenges() {
  return useQuery(challengeQueries.childChallenges());
}

// Progress hooks
export function useFamilyProgress() {
  return useQuery(progressQueries.family());
}
