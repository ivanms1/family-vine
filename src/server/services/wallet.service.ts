import { prisma } from '../db';
import { cryptoService } from './crypto.service';

export interface WalletInfo {
  address: string;
  label: string;
  ownerType: 'family' | 'child';
  ownerId: string;
}

export const walletService = {
  async createFamilyWallet(familyProfileId: string): Promise<{ address: string }> {
    const existing = await prisma.wallet.findUnique({
      where: { familyProfileId },
    });
    if (existing) return { address: existing.address };

    const wallet = cryptoService.generateWallet();
    const created = await prisma.wallet.create({
      data: {
        address: wallet.address,
        encryptedKey: wallet.encryptedKey,
        encryptionIV: wallet.encryptionIV,
        encryptionTag: wallet.encryptionTag,
        familyProfileId,
      },
    });
    return { address: created.address };
  },

  async createChildWallet(childProfileId: string): Promise<{ address: string }> {
    const existing = await prisma.wallet.findUnique({
      where: { childProfileId },
    });
    if (existing) return { address: existing.address };

    const wallet = cryptoService.generateWallet();
    const created = await prisma.wallet.create({
      data: {
        address: wallet.address,
        encryptedKey: wallet.encryptedKey,
        encryptionIV: wallet.encryptionIV,
        encryptionTag: wallet.encryptionTag,
        childProfileId,
      },
    });
    return { address: created.address };
  },

  async getFamilyWallets(familyProfileId: string): Promise<WalletInfo[]> {
    const wallets: WalletInfo[] = [];

    // Family wallet
    const familyWallet = await prisma.wallet.findUnique({
      where: { familyProfileId },
      include: { familyProfile: true },
    });
    if (familyWallet) {
      wallets.push({
        address: familyWallet.address,
        label: familyWallet.familyProfile?.familyName ?? 'Family',
        ownerType: 'family',
        ownerId: familyProfileId,
      });
    }

    // Child wallets
    const children = await prisma.childProfile.findMany({
      where: { familyProfileId },
      include: { wallet: true },
    });
    for (const child of children) {
      if (child.wallet) {
        wallets.push({
          address: child.wallet.address,
          label: child.displayName,
          ownerType: 'child',
          ownerId: child.id,
        });
      }
    }

    return wallets;
  },

  async getChildWalletAddress(childProfileId: string): Promise<string | null> {
    const wallet = await prisma.wallet.findUnique({
      where: { childProfileId },
    });
    return wallet?.address ?? null;
  },
};
