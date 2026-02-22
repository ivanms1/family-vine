import { queryOptions } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { QUERY_KEYS } from './keys';

export const authQueries = {
  me: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.AUTH, 'me'],
      queryFn: () => authApi.getMe(),
      retry: false,
    }),
};
