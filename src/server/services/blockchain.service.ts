import { ethers } from 'ethers';
import { prisma } from '../db';
import { cryptoService } from './crypto.service';
import { FAMILYVINE_TOKEN_ABI } from '../blockchain/contract-abi';

const MAX_RETRIES = 5;

function getProvider() {
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) throw new Error('BASE_RPC_URL is not set');
  return new ethers.JsonRpcProvider(rpcUrl);
}

function getServerWallet() {
  const privateKey = process.env.SERVER_WALLET_PRIVATE_KEY;
  if (!privateKey) throw new Error('SERVER_WALLET_PRIVATE_KEY is not set');
  return new ethers.Wallet(privateKey, getProvider());
}

function getContract() {
  const address = process.env.FAMILYVINE_TOKEN_CONTRACT_ADDRESS;
  if (!address) throw new Error('FAMILYVINE_TOKEN_CONTRACT_ADDRESS is not set');
  return new ethers.Contract(address, FAMILYVINE_TOKEN_ABI, getServerWallet());
}

function isBlockchainEnabled(): boolean {
  return !!(
    process.env.FAMILYVINE_TOKEN_CONTRACT_ADDRESS &&
    process.env.SERVER_WALLET_PRIVATE_KEY &&
    process.env.BASE_RPC_URL
  );
}

export const blockchainService = {
  isEnabled: isBlockchainEnabled,

  async mintTokens(walletAddress: string, amount: number): Promise<string> {
    const contract = getContract();
    const tx = await contract.mint(walletAddress, amount);
    const receipt = await tx.wait();
    return receipt.hash;
  },

  async burnTokens(walletAddress: string, amount: number): Promise<string> {
    const contract = getContract();
    const tx = await contract.burn(walletAddress, amount);
    const receipt = await tx.wait();
    return receipt.hash;
  },

  async syncTransaction(transactionId: string): Promise<void> {
    if (!isBlockchainEnabled()) return;

    const transaction = await prisma.tokenTransaction.findUnique({
      where: { id: transactionId },
      include: {
        childProfile: {
          include: { wallet: true },
        },
      },
    });

    if (!transaction) return;
    if (!transaction.childProfile.wallet) {
      console.warn(`No wallet for child ${transaction.childProfileId}, skipping sync`);
      return;
    }

    const walletAddress = transaction.childProfile.wallet.address;
    const isEarning = transaction.amount > 0;
    const amount = Math.abs(transaction.amount);

    try {
      // Mark as submitted
      await prisma.tokenTransaction.update({
        where: { id: transactionId },
        data: { blockchainSyncStatus: 'SUBMITTED' },
      });

      const txHash = isEarning
        ? await this.mintTokens(walletAddress, amount)
        : await this.burnTokens(walletAddress, amount);

      // Mark as confirmed
      await prisma.tokenTransaction.update({
        where: { id: transactionId },
        data: {
          blockchainSyncStatus: 'CONFIRMED',
          blockchainTxHash: txHash,
          blockchainSyncError: null,
          blockchainSyncedAt: new Date(),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await prisma.tokenTransaction.update({
        where: { id: transactionId },
        data: {
          blockchainSyncStatus: 'FAILED',
          blockchainSyncError: message,
          blockchainRetryCount: { increment: 1 },
        },
      });
    }
  },

  async processPendingSync(): Promise<{ synced: number; failed: number }> {
    if (!isBlockchainEnabled()) return { synced: 0, failed: 0 };

    const pending = await prisma.tokenTransaction.findMany({
      where: {
        blockchainSyncStatus: { in: ['PENDING', 'FAILED'] },
        blockchainRetryCount: { lt: MAX_RETRIES },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    let synced = 0;
    let failed = 0;

    for (const tx of pending) {
      try {
        await this.syncTransaction(tx.id);
        // Re-check status after sync
        const updated = await prisma.tokenTransaction.findUnique({
          where: { id: tx.id },
          select: { blockchainSyncStatus: true },
        });
        if (updated?.blockchainSyncStatus === 'CONFIRMED') {
          synced++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return { synced, failed };
  },
};
