import { queryOptions } from '@tanstack/react-query';
import { challengesApi } from '@/api/challenges';
import { progressApi } from '@/api/progress';
import { QUERY_KEYS } from './keys';

export const challengeQueries = {
  list: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.CHALLENGES],
      queryFn: () => challengesApi.getChallenges(),
    }),

  childChallenges: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.CHALLENGES, 'child'],
      queryFn: () => challengesApi.getChildChallenges(),
    }),
};

export const progressQueries = {
  family: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.PROGRESS],
      queryFn: () => progressApi.getFamilyProgress(),
    }),
};
