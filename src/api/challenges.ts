import { apiClient } from '@/lib/api-client';
import type { FamilyChallenge, CreateChallengeInput } from '@/types/challenge';

export const challengesApi = {
  // Parent endpoints
  getChallenges() {
    return apiClient.get<{ challenges: FamilyChallenge[] }>(
      '/api/family/challenges'
    );
  },

  createChallenge(input: CreateChallengeInput) {
    return apiClient.post<{ challenge: FamilyChallenge }>(
      '/api/family/challenges',
      input
    );
  },

  deleteChallenge(challengeId: string) {
    return apiClient.delete<{ success: boolean }>(
      `/api/family/challenges/${challengeId}`
    );
  },

  // Child endpoint
  getChildChallenges() {
    return apiClient.get<{
      challenges: {
        id: string;
        title: string;
        description: string | null;
        tokenReward: number;
        requiredLessons: number;
        categoryName: string | null;
        endsAt: string;
        lessonsCompleted: number;
        completed: boolean;
        completedAt: string | null;
      }[];
    }>('/api/challenges');
  },
};
