'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-auth';
import { useFamilyTokenSummary, useReviewSpendRequest } from '@/hooks/use-tokens';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BookOpen,
  Coins,
  Trophy,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardData {
  stats: {
    lessonsCompleted: number;
    totalTokens: number;
    pendingRequests: number;
    activeChallenges: number;
  };
  recentActivity: {
    id: string;
    childName: string;
    lessonTitle: string;
    tokensEarned: number;
    completedAt: string | null;
  }[];
}

export default function DashboardPage() {
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const { data: dashData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get<DashboardData>('/api/progress/dashboard'),
  });
  const { data: tokenData } = useFamilyTokenSummary();
  const reviewRequest = useReviewSpendRequest();

  if (userLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    );
  }

  const user = userData?.user;
  const childCount = user?.familyProfile?.children?.length ?? 0;
  const stats = dashData?.stats;
  const activity = dashData?.recentActivity ?? [];
  const pendingRequests = tokenData?.pendingRequests ?? [];

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
        <h1 className='text-3xl font-bold'>
          Welcome, {user?.displayName ?? 'Parent'}
        </h1>
        <p className='text-muted-foreground'>
          {user?.familyProfile?.familyName ?? 'Your Family'} Dashboard
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Children</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{childCount}</div>
            <p className='text-xs text-muted-foreground'>Family members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Lessons Completed
            </CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.lessonsCompleted ?? 0}
            </div>
            <p className='text-xs text-muted-foreground'>This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Tokens Earned</CardTitle>
            <Coins className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.totalTokens ?? 0}
            </div>
            <p className='text-xs text-muted-foreground'>Total across family</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Requests
            </CardTitle>
            <Trophy className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.pendingRequests ?? 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              {(stats?.pendingRequests ?? 0) > 0 ? (
                <Link
                  href='/tokens'
                  className='text-primary hover:underline'
                >
                  Review now
                </Link>
              ) : (
                'Awaiting approval'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your family&apos;s latest learning activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                No activity yet. Add children to your family and start learning
                together!
              </p>
            ) : (
              <div className='space-y-3'>
                {activity.map((a) => (
                  <div
                    key={a.id}
                    className='flex items-center justify-between py-2 border-b last:border-0'
                  >
                    <div>
                      <p className='text-sm font-medium'>{a.childName}</p>
                      <p className='text-xs text-muted-foreground'>
                        Completed &quot;{a.lessonTitle}&quot;
                      </p>
                    </div>
                    <div className='text-right'>
                      <Badge variant='secondary'>+{a.tokensEarned}</Badge>
                      {a.completedAt && (
                        <p className='text-xs text-muted-foreground mt-0.5'>
                          {new Date(a.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              Pending Approvals
              {pendingRequests.length > 0 && (
                <Badge variant='destructive'>{pendingRequests.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>Token spend requests from children</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                No pending requests.
              </p>
            ) : (
              <div className='space-y-4'>
                {pendingRequests.slice(0, 3).map((r) => (
                  <div key={r.id} className='rounded-lg border p-3 space-y-2'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <p className='font-medium text-sm'>{r.childName}</p>
                        <p className='text-xs text-muted-foreground'>
                          {r.reason}
                        </p>
                      </div>
                      <Badge variant='outline'>{r.amount} tokens</Badge>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        onClick={() => handleReview(r.id, 'APPROVED')}
                        disabled={reviewRequest.isPending}
                        className='gap-1 h-7 text-xs'
                      >
                        <CheckCircle2 className='h-3 w-3' />
                        Approve
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleReview(r.id, 'DENIED')}
                        disabled={reviewRequest.isPending}
                        className='gap-1 h-7 text-xs'
                      >
                        <XCircle className='h-3 w-3' />
                        Deny
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingRequests.length > 3 && (
                  <Button asChild variant='outline' size='sm' className='w-full'>
                    <Link href='/tokens'>
                      View all {pendingRequests.length} requests
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
