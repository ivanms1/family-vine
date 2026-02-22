import { queryOptions } from '@tanstack/react-query';
import { blockchainApi } from '@/api/blockchain';
import { QUERY_KEYS } from './keys';

export const blockchainQueries = {
  wallets: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.BLOCKCHAIN, 'wallets'],
      queryFn: () => blockchainApi.getWallets(),
    }),
};
