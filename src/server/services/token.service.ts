import { prisma } from '../db';
import { TOKEN_DAILY_CAP } from '@/lib/constants';
import type { CreateSpendRequestInput, ReviewSpendRequestInput } from '../validators/token.validators';
import { blockchainService } from './blockchain.service';

export const tokenService = {
  async getBalance(childProfileId: string) {
    const child = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
    });

    if (!child) throw new Error('Child not found');

    // Reset daily counter if needed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(child.lastTokenResetDate);
    lastReset.setHours(0, 0, 0, 0);

    const dailyEarned = today > lastReset ? 0 : child.dailyTokensEarned;

    return {
      balance: child.tokenBalance,
      dailyEarned,
      dailyCap: TOKEN_DAILY_CAP,
    };
  },

  async getHistory(childProfileId: string, limit = 50) {
    const transactions = await prisma.tokenTransaction.findMany({
      where: { childProfileId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions.map(mapTransaction);
  },

  async getSpendRequests(childProfileId: string) {
    const requests = await prisma.spendRequest.findMany({
      where: { childProfileId },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(mapSpendRequest);
  },

  async createSpendRequest(
    childProfileId: string,
    input: CreateSpendRequestInput
  ) {
    const child = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
    });

    if (!child) throw new Error('Child not found');

    if (input.amount > child.tokenBalance) {
      throw new Error('Insufficient token balance');
    }

    // Check for existing pending requests
    const pendingCount = await prisma.spendRequest.count({
      where: { childProfileId, status: 'PENDING' },
    });

    if (pendingCount >= 5) {
      throw new Error('Too many pending requests. Wait for approval.');
    }

    const request = await prisma.spendRequest.create({
      data: {
        childProfileId,
        amount: input.amount,
        reason: input.reason,
        referenceId: input.referenceId,
      },
    });

    return mapSpendRequest(request);
  },

  // Parent-facing methods
  async getFamilyTokenSummary(familyProfileId: string) {
    const children = await prisma.childProfile.findMany({
      where: { familyProfileId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        displayName: true,
        tokenBalance: true,
        dailyTokensEarned: true,
        wallet: { select: { address: true } },
      },
    });

    const childIds = children.map((c) => c.id);

    const pendingRequests = await prisma.spendRequest.findMany({
      where: {
        childProfileId: { in: childIds },
        status: 'PENDING',
      },
      orderBy: { createdAt: 'asc' },
      include: {
        childProfile: { select: { displayName: true } },
      },
    });

    const recentTransactions = await prisma.tokenTransaction.findMany({
      where: { childProfileId: { in: childIds } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        childProfile: { select: { displayName: true } },
      },
    });

    return {
      children: children.map((c) => ({
        id: c.id,
        displayName: c.displayName,
        tokenBalance: c.tokenBalance,
        dailyTokensEarned: c.dailyTokensEarned,
        walletAddress: c.wallet?.address ?? null,
      })),
      pendingRequests: pendingRequests.map((r) => ({
        ...mapSpendRequest(r),
        childName: r.childProfile.displayName,
      })),
      recentTransactions: recentTransactions.map((t) => ({
        ...mapTransaction(t),
        childName: (t as typeof t & { childProfile: { displayName: string } }).childProfile.displayName,
      })),
    };
  },

  async getPendingRequests(familyProfileId: string) {
    const children = await prisma.childProfile.findMany({
      where: { familyProfileId },
      select: { id: true },
    });

    const childIds = children.map((c) => c.id);

    const requests = await prisma.spendRequest.findMany({
      where: {
        childProfileId: { in: childIds },
        status: 'PENDING',
      },
      orderBy: { createdAt: 'asc' },
      include: {
        childProfile: { select: { displayName: true } },
      },
    });

    return requests.map((r) => ({
      ...mapSpendRequest(r),
      childName: r.childProfile.displayName,
    }));
  },

  async reviewSpendRequest(
    requestId: string,
    familyProfileId: string,
    input: ReviewSpendRequestInput
  ) {
    // Find the request and verify it belongs to this family
    const request = await prisma.spendRequest.findUnique({
      where: { id: requestId },
      include: {
        childProfile: { select: { id: true, familyProfileId: true, tokenBalance: true } },
      },
    });

    if (!request) throw new Error('Request not found');
    if (request.childProfile.familyProfileId !== familyProfileId) {
      throw new Error('Request not found');
    }
    if (request.status !== 'PENDING') {
      throw new Error('Request already reviewed');
    }

    if (input.status === 'APPROVED') {
      // Verify child still has enough balance
      if (request.amount > request.childProfile.tokenBalance) {
        throw new Error('Child no longer has sufficient balance');
      }

      // Deduct tokens in a transaction
      const newBalance = request.childProfile.tokenBalance - request.amount;

      const txResult = await prisma.$transaction(async (tx) => {
        await tx.spendRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED', reviewedAt: new Date() },
        });

        const tokenTx = await tx.tokenTransaction.create({
          data: {
            childProfileId: request.childProfileId,
            type: 'SPEND_UNLOCK_CONTENT',
            amount: -request.amount,
            balanceAfter: newBalance,
            description: `Spend approved: ${request.reason}`,
            referenceId: request.referenceId,
            blockchainSyncStatus: blockchainService.isEnabled() ? 'PENDING' : undefined,
          },
        });

        await tx.childProfile.update({
          where: { id: request.childProfileId },
          data: { tokenBalance: newBalance },
        });

        return { tokenTxId: tokenTx.id };
      });

      // Fire-and-forget blockchain sync
      if (txResult.tokenTxId) {
        blockchainService.syncTransaction(txResult.tokenTxId).catch((err) => {
          console.error('Blockchain sync failed (will retry):', err.message);
        });
      }
    } else {
      await prisma.spendRequest.update({
        where: { id: requestId },
        data: { status: 'DENIED', reviewedAt: new Date() },
      });
    }

    const updated = await prisma.spendRequest.findUnique({
      where: { id: requestId },
    });

    return mapSpendRequest(updated!);
  },
};

function mapTransaction(t: {
  id: string;
  childProfileId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId: string | null;
  blockchainSyncStatus: string | null;
  blockchainTxHash: string | null;
  createdAt: Date;
}) {
  return {
    id: t.id,
    childProfileId: t.childProfileId,
    type: t.type,
    amount: t.amount,
    balanceAfter: t.balanceAfter,
    description: t.description,
    referenceId: t.referenceId,
    blockchainSyncStatus: t.blockchainSyncStatus,
    blockchainTxHash: t.blockchainTxHash,
    createdAt: t.createdAt.toISOString(),
  };
}

function mapSpendRequest(r: {
  id: string;
  childProfileId: string;
  amount: number;
  reason: string;
  referenceId: string | null;
  status: string;
  reviewedAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: r.id,
    childProfileId: r.childProfileId,
    amount: r.amount,
    reason: r.reason,
    referenceId: r.referenceId,
    status: r.status,
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}
