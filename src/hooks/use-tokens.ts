'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tokensApi } from '@/api/tokens';
import { tokenQueries } from '@/queries/tokens';
import { QUERY_KEYS } from '@/queries/keys';
import type { CreateSpendRequestInput, ReviewSpendRequestInput } from '@/types/token';

// Child hooks
export function useTokenBalance() {
  return useQuery(tokenQueries.balance());
}

export function useTokenHistory() {
  return useQuery(tokenQueries.history());
}

export function useSpendRequests() {
  return useQuery(tokenQueries.spendRequests());
}

export function useCreateSpendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSpendRequestInput) =>
      tokensApi.createSpendRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOKENS] });
    },
  });
}

// Parent hooks
export function useFamilyTokenSummary() {
  return useQuery(tokenQueries.familySummary());
}

export function useReviewSpendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      input,
    }: {
      requestId: string;
      input: ReviewSpendRequestInput;
    }) => tokensApi.reviewSpendRequest(requestId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOKENS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAMILY] });
    },
  });
}
