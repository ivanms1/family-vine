'use client';

import {
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  useFamilyTokenSummary,
  useReviewSpendRequest,
} from '@/hooks/use-tokens';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

export default function TokensPage() {
  const { data, isLoading } = useFamilyTokenSummary();
  const reviewRequest = useReviewSpendRequest();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    );
  }

  const children = data?.children ?? [];
  const pendingRequests = data?.pendingRequests ?? [];
  const recentTransactions = data?.recentTransactions ?? [];
  const totalTokens = children.reduce((sum, c) => sum + c.tokenBalance, 0);

  function handleReview(requestId: string, status: 'APPROVED' | 'DENIED') {
    reviewRequest.mutate(
      { requestId, input: { status } },
      {
        onSuccess: () =>
          toast.success(
            status === 'APPROVED' ? 'Request approved' : 'Request denied'
          ),
        onError: (error) => toast.error(error.message),
      }
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <Coins className='h-6 w-6' />
          Token Management
        </h1>
        <p className='text-muted-foreground mt-1'>
          Overview of your family&apos;s token activity
        </p>
      </div>

      {/* Child balances */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {children.map((child) => (
          <Card key={child.id}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                {child.displayName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold text-primary'>
                {child.tokenBalance}
              </div>
              <p className='text-xs text-muted-foreground'>
                {child.dailyTokensEarned} earned today
              </p>
              {child.walletAddress && (
                <p className='mt-1 font-mono text-xs text-muted-foreground truncate'>
                  {child.walletAddress.slice(0, 6)}...{child.walletAddress.slice(-4)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Family Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{totalTokens}</div>
            <p className='text-xs text-muted-foreground'>
              Across {children.length}{' '}
              {children.length === 1 ? 'child' : 'children'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              Pending Requests
              {pendingRequests.length > 0 && (
                <Badge variant='destructive'>{pendingRequests.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Approve or deny token spend requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-4'>
                No pending requests.
              </p>
            ) : (
              <div className='space-y-4'>
                {pendingRequests.map((r) => (
                  <div key={r.id} className='rounded-lg border p-4 space-y-3'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <p className='font-medium text-sm'>{r.childName}</p>
                        <p className='text-sm text-muted-foreground'>
                          {r.reason}
                        </p>
                      </div>
                      <Badge variant='outline' className='shrink-0'>
                        {r.amount} tokens
                      </Badge>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        onClick={() => handleReview(r.id, 'APPROVED')}
                        disabled={reviewRequest.isPending}
                        className='gap-1'
                      >
                        <CheckCircle2 className='h-3.5 w-3.5' />
                        Approve
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleReview(r.id, 'DENIED')}
                        disabled={reviewRequest.isPending}
                        className='gap-1'
                      >
                        <XCircle className='h-3.5 w-3.5' />
                        Deny
                      </Button>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      <Clock className='inline h-3 w-3 mr-1' />
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Token transactions across your family
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-4'>
                No transactions yet.
              </p>
            ) : (
              <div className='space-y-3'>
                {recentTransactions.map((t) => (
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
                          {(t as typeof t & { childName?: string }).childName} &middot;{' '}
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold text-sm ${
                        t.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {t.amount > 0 ? '+' : ''}
                      {t.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
