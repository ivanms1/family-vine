import { queryOptions } from '@tanstack/react-query';
import { familyApi } from '@/api/family';
import { QUERY_KEYS } from './keys';

export const familyQueries = {
  family: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.FAMILY],
      queryFn: () => familyApi.getFamily(),
    }),

  child: (childId: string) =>
    queryOptions({
      queryKey: [QUERY_KEYS.CHILDREN, childId],
      queryFn: () => familyApi.getChild(childId),
      enabled: !!childId,
    }),
};
