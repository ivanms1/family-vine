import { queryOptions } from '@tanstack/react-query';
import { tokensApi } from '@/api/tokens';
import { QUERY_KEYS } from './keys';

export const tokenQueries = {
  balance: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.TOKENS, 'balance'],
      queryFn: () => tokensApi.getBalance(),
    }),

  history: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.TOKENS, 'history'],
      queryFn: () => tokensApi.getHistory(),
    }),

  spendRequests: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.TOKENS, 'spend-requests'],
      queryFn: () => tokensApi.getSpendRequests(),
    }),

  familySummary: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.TOKENS, 'family-summary'],
      queryFn: () => tokensApi.getFamilyTokenSummary(),
    }),
};
