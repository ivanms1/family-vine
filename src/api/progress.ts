import { apiClient } from '@/lib/api-client';
import type { ChildProgress } from '@/types/challenge';

export const progressApi = {
  getFamilyProgress() {
    return apiClient.get<{ children: ChildProgress[] }>('/api/progress');
  },
};
