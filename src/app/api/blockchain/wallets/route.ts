import { type NextRequest, NextResponse } from 'next/server';
import { requireParent } from '@/server/auth-helpers';
import { walletService } from '@/server/services/wallet.service';
import type { BlockchainSettings } from '@/types/wallet';

export async function GET(request: NextRequest) {
  try {
    const parent = await requireParent(request);
    const wallets = await walletService.getFamilyWallets(parent.familyProfileId!);

    const explorerBaseUrl =
      process.env.NEXT_PUBLIC_BASE_EXPLORER_URL || 'https://sepolia.basescan.org';
    const contractAddress =
      process.env.FAMILYVINE_TOKEN_CONTRACT_ADDRESS || null;

    const familyWallet = wallets.find((w) => w.ownerType === 'family') ?? null;
    const childWallets = wallets.filter((w) => w.ownerType === 'child');

    const response: BlockchainSettings = {
      enabled: !!contractAddress,
      familyWallet,
      childWallets,
      contractAddress,
      explorerBaseUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch wallets';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
