export type BlockchainSyncStatus = 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED' | null;

export interface TokenTransaction {
  id: string;
  childProfileId: string;
  type: TokenTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId: string | null;
  blockchainSyncStatus: BlockchainSyncStatus;
  blockchainTxHash: string | null;
  createdAt: string;
}

export type TokenTransactionType =
  | 'EARN_LESSON_COMPLETE'
  | 'EARN_CHALLENGE_COMPLETE'
  | 'EARN_STREAK_BONUS'
  | 'SPEND_UNLOCK_LESSON'
  | 'SPEND_UNLOCK_CONTENT'
  | 'SPEND_JOIN_CHALLENGE'
  | 'ADMIN_ADJUSTMENT';

export interface SpendRequest {
  id: string;
  childProfileId: string;
  amount: number;
  reason: string;
  referenceId: string | null;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  reviewedAt: string | null;
  createdAt: string;
  childName?: string;
}

export interface TokenBalance {
  balance: number;
  dailyEarned: number;
  dailyCap: number;
}

export interface CreateSpendRequestInput {
  amount: number;
  reason: string;
  referenceId?: string;
}

export interface ReviewSpendRequestInput {
  status: 'APPROVED' | 'DENIED';
}

export interface FamilyTokenSummary {
  children: {
    id: string;
    displayName: string;
    tokenBalance: number;
    dailyTokensEarned: number;
    walletAddress: string | null;
  }[];
  pendingRequests: SpendRequest[];
  recentTransactions: TokenTransaction[];
}
