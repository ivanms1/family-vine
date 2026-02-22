import { apiClient } from '@/lib/api-client';
import type {
  TokenBalance,
  TokenTransaction,
  SpendRequest,
  CreateSpendRequestInput,
  ReviewSpendRequestInput,
  FamilyTokenSummary,
} from '@/types/token';

export const tokensApi = {
  // Child endpoints
  getBalance() {
    return apiClient.get<TokenBalance>('/api/tokens/balance');
  },

  getHistory() {
    return apiClient.get<{ transactions: TokenTransaction[] }>(
      '/api/tokens/history'
    );
  },

  getSpendRequests() {
    return apiClient.get<{ requests: SpendRequest[] }>('/api/tokens/spend');
  },

  createSpendRequest(input: CreateSpendRequestInput) {
    return apiClient.post<{ request: SpendRequest }>(
      '/api/tokens/spend',
      input
    );
  },

  // Parent endpoints
  getFamilyTokenSummary() {
    return apiClient.get<FamilyTokenSummary>('/api/tokens/summary');
  },

  reviewSpendRequest(requestId: string, input: ReviewSpendRequestInput) {
    return apiClient.post<{ request: SpendRequest }>(
      `/api/tokens/approve/${requestId}`,
      input
    );
  },
};
