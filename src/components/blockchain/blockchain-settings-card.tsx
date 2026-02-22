'use client';

import { Copy, ExternalLink, Link2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBlockchainWallets } from '@/hooks/use-blockchain';
import { BASE_EXPLORER_URL } from '@/lib/constants';

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function copyAddress(address: string) {
  navigator.clipboard.writeText(address);
  toast.success('Address copied to clipboard');
}

function WalletRow({
  label,
  address,
  explorerUrl,
}: {
  label: string;
  address: string;
  explorerUrl: string;
}) {
  return (
    <div className='flex items-center justify-between rounded-lg border p-3'>
      <div className='min-w-0'>
        <p className='text-sm font-medium'>{label}</p>
        <p className='font-mono text-xs text-muted-foreground'>
          {truncateAddress(address)}
        </p>
      </div>
      <div className='flex gap-1'>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          onClick={() => copyAddress(address)}
        >
          <Copy className='h-3.5 w-3.5' />
        </Button>
        <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
          <a
            href={`${explorerUrl}/address/${address}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <ExternalLink className='h-3.5 w-3.5' />
          </a>
        </Button>
      </div>
    </div>
  );
}

export function BlockchainSettingsCard() {
  const { data, isLoading } = useBlockchainWallets();

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>
          Unable to load blockchain settings.
        </CardContent>
      </Card>
    );
  }

  const explorerUrl = data.explorerBaseUrl || BASE_EXPLORER_URL;

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Link2 className='h-5 w-5' />
            <CardTitle className='text-lg'>Blockchain Wallets</CardTitle>
          </div>
          <CardDescription>
            Your family&apos;s learning achievements are recorded on the Base
            blockchain as permanent proof of growth.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {data.familyWallet && (
            <WalletRow
              label={`${data.familyWallet.label} (Family)`}
              address={data.familyWallet.address}
              explorerUrl={explorerUrl}
            />
          )}

          {data.childWallets.map((wallet) => (
            <WalletRow
              key={wallet.ownerId}
              label={wallet.label}
              address={wallet.address}
              explorerUrl={explorerUrl}
            />
          ))}

          {!data.familyWallet && data.childWallets.length === 0 && (
            <p className='text-sm text-muted-foreground'>
              No wallets generated yet. Wallets are created automatically when
              you register and add children.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>About VINE Tokens</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary'>Soulbound</Badge>
            <span className='text-sm text-muted-foreground'>
              Tokens cannot be transferred or traded
            </span>
          </div>
          <p className='text-sm text-muted-foreground'>
            VINE tokens are earned through learning — not bought. They are
            recorded on the blockchain as a permanent record of your
            child&apos;s educational achievements. They cannot be traded on
            exchanges, converted to cash, or transferred between accounts.
          </p>
          {data.contractAddress && (
            <div className='pt-2'>
              <a
                href={`${explorerUrl}/address/${data.contractAddress}`}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
              >
                <span className='font-mono'>
                  Contract: {truncateAddress(data.contractAddress)}
                </span>
                <ExternalLink className='h-3 w-3' />
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
