'use client';

import { useState } from 'react';
import { Coins, Send, Clock, CheckCircle2, XCircle, ArrowUp, ArrowDown, Link2 } from 'lucide-react';
import {
  useTokenBalance,
  useTokenHistory,
  useSpendRequests,
  useCreateSpendRequest,
} from '@/hooks/use-tokens';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from 'sonner';
import { TOKEN_DAILY_CAP } from '@/lib/constants';

export default function MyRewardsPage() {
  const { data: balanceData } = useTokenBalance();
  const { data: historyData } = useTokenHistory();
  const { data: requestsData } = useSpendRequests();
  const createSpend = useCreateSpendRequest();

  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const balance = balanceData?.balance ?? 0;
  const dailyEarned = balanceData?.dailyEarned ?? 0;
  const transactions = historyData?.transactions ?? [];
  const spendRequests = requestsData?.requests ?? [];

  function handleSpendRequest(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = parseInt(amount);
    if (!numAmount || numAmount < 1) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    createSpend.mutate(
      { amount: numAmount, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success('Spend request sent to your parent!');
          setAmount('');
          setReason('');
        },
        onError: (error) => toast.error(error.message),
      }
    );
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>My Rewards</h1>
        <p className='mt-2 text-muted-foreground'>
          Earn tokens by completing lessons!
        </p>
      </div>

      {/* Balance card */}
      <Card>
        <CardHeader className='text-center'>
          <Coins className='mx-auto h-12 w-12 text-primary' />
          <CardTitle className='text-5xl font-bold mt-2'>{balance}</CardTitle>
          <CardDescription>tokens earned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex justify-center'>
            <div className='text-center'>
              <div className='text-sm text-muted-foreground'>
                Today: {dailyEarned} / {TOKEN_DAILY_CAP}
              </div>
              <div className='h-2 w-40 bg-muted rounded-full mt-1 overflow-hidden'>
                <div
                  className='h-full bg-primary rounded-full transition-all'
                  style={{
                    width: `${Math.min((dailyEarned / TOKEN_DAILY_CAP) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='history'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='history'>History</TabsTrigger>
          <TabsTrigger value='spend'>Spend</TabsTrigger>
          <TabsTrigger value='requests'>
            Requests
            {spendRequests.filter((r) => r.status === 'PENDING').length > 0 && (
              <Badge variant='secondary' className='ml-1.5 text-xs px-1.5'>
                {spendRequests.filter((r) => r.status === 'PENDING').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='history' className='mt-4'>
          <Card>
            <CardHeader>
              <CardTitle>Token History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  No transactions yet. Complete lessons to earn tokens!
                </p>
              ) : (
                <div className='space-y-3'>
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className='flex items-center justify-between py-2 border-b last:border-0'
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`rounded-full p-1.5 ${
                            t.amount > 0
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}
                        >
                          {t.amount > 0 ? (
                            <ArrowUp className='h-3.5 w-3.5 text-green-600' />
                          ) : (
                            <ArrowDown className='h-3.5 w-3.5 text-red-600' />
                          )}
                        </div>
                        <div>
                          <p className='text-sm font-medium'>
                            {t.description}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {new Date(t.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <span
                          className={`font-semibold ${
                            t.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {t.amount > 0 ? '+' : ''}
                          {t.amount}
                        </span>
                        {t.blockchainSyncStatus === 'CONFIRMED' && (
                          <span title='Recorded on blockchain'>
                            <Link2 className='h-3 w-3 text-blue-500' />
                          </span>
                        )}
                        {(t.blockchainSyncStatus === 'PENDING' || t.blockchainSyncStatus === 'SUBMITTED') && (
                          <span title='Syncing to blockchain...'>
                            <Link2 className='h-3 w-3 text-muted-foreground animate-pulse' />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='spend' className='mt-4'>
          <Card>
            <CardHeader>
              <CardTitle>Request to Spend Tokens</CardTitle>
              <CardDescription>
                Ask your parent to approve spending tokens on something special
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSpendRequest} className='space-y-4'>
                <div>
                  <label className='text-sm font-medium'>
                    How many tokens?
                  </label>
                  <Input
                    type='number'
                    min={1}
                    max={balance}
                    placeholder='10'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className='mt-1'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    You have {balance} tokens available
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    What would you like to use them for?
                  </label>
                  <Textarea
                    placeholder='e.g., Unlock a special lesson, get a reward...'
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={200}
                    className='mt-1'
                  />
                </div>
                <Button
                  type='submit'
                  disabled={createSpend.isPending || balance === 0}
                  className='w-full'
                >
                  <Send className='mr-2 h-4 w-4' />
                  {createSpend.isPending
                    ? 'Sending...'
                    : 'Send Request to Parent'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='requests' className='mt-4'>
          <Card>
            <CardHeader>
              <CardTitle>My Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {spendRequests.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  No spend requests yet.
                </p>
              ) : (
                <div className='space-y-3'>
                  {spendRequests.map((r) => (
                    <div
                      key={r.id}
                      className='flex items-center justify-between py-2 border-b last:border-0'
                    >
                      <div>
                        <p className='text-sm font-medium'>{r.reason}</p>
                        <p className='text-xs text-muted-foreground'>
                          {r.amount} tokens &middot;{' '}
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant='outline' className='gap-1'>
          <Clock className='h-3 w-3' />
          Pending
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge className='gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'>
          <CheckCircle2 className='h-3 w-3' />
          Approved
        </Badge>
      );
    case 'DENIED':
      return (
        <Badge variant='destructive' className='gap-1'>
          <XCircle className='h-3 w-3' />
          Denied
        </Badge>
      );
    default:
      return <Badge variant='outline'>{status}</Badge>;
  }
}
