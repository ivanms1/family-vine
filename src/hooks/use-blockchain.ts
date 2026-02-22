import { useQuery } from '@tanstack/react-query';
import { blockchainQueries } from '@/queries/blockchain';

export function useBlockchainWallets() {
  return useQuery(blockchainQueries.wallets());
}
