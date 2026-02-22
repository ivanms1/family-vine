import { apiClient } from '@/lib/api-client';
import type { BlockchainSettings } from '@/types/wallet';

export const blockchainApi = {
  getWallets() {
    return apiClient.get<BlockchainSettings>('/api/blockchain/wallets');
  },
};
