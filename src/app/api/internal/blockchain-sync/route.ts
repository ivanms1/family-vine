import { NextResponse } from 'next/server';
import { blockchainService } from '@/server/services/blockchain.service';

export async function GET(request: Request) {
  const secret = request.headers.get('x-sync-secret');
  if (secret !== process.env.BLOCKCHAIN_SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!blockchainService.isEnabled()) {
    return NextResponse.json({ message: 'Blockchain not configured' });
  }

  const result = await blockchainService.processPendingSync();
  return NextResponse.json(result);
}
