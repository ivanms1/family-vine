'use client';

import Link from 'next/link';
import { Trophy, Clock, Star, CheckCircle2 } from 'lucide-react';
import { useChildChallenges } from '@/hooks/use-challenges';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ChallengesPage() {
  const { data, isLoading } = useChildChallenges();

  const challenges = data?.challenges ?? [];
  const active = challenges.filter((c) => !c.completed);
  const completed = challenges.filter((c) => c.completed);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>Family Challenges</h1>
        <p className='mt-2 text-muted-foreground'>
          Complete challenges to earn bonus tokens!
        </p>
      </div>

      {challenges.length === 0 ? (
        <Card>
          <CardHeader className='text-center'>
            <Trophy className='mx-auto h-12 w-12 text-primary' />
            <CardTitle>No Active Challenges</CardTitle>
            <CardDescription>
              Ask your parents to create a family challenge!
            </CardDescription>
          </CardHeader>
          <CardContent className='text-center'>
            <p className='text-sm text-muted-foreground'>
              Challenges let you earn extra tokens by completing a set of
              lessons.
            </p>
            <Button asChild className='mt-4'>
              <Link href='/learn'>Start Learning</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active challenges */}
          {active.length > 0 && (
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold'>Active Challenges</h2>
              {active.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div>
                        <CardTitle className='text-lg flex items-center gap-2'>
                          <Trophy className='h-5 w-5 text-primary' />
                          {challenge.title}
                        </CardTitle>
                        {challenge.description && (
                          <CardDescription className='mt-1'>
                            {challenge.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant='secondary' className='shrink-0'>
                        <Star className='h-3 w-3 mr-1' />
                        {challenge.tokenReward} tokens
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {/* Progress bar */}
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>
                          {challenge.lessonsCompleted} /{' '}
                          {challenge.requiredLessons} lessons
                        </span>
                        <span className='text-muted-foreground'>
                          {Math.round(
                            (challenge.lessonsCompleted /
                              challenge.requiredLessons) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className='h-3 bg-muted rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-primary rounded-full transition-all'
                          style={{
                            width: `${Math.min(
                              (challenge.lessonsCompleted /
                                challenge.requiredLessons) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        Ends{' '}
                        {new Date(challenge.endsAt).toLocaleDateString()}
                      </div>
                      {challenge.categoryName && (
                        <Badge variant='outline' className='text-xs'>
                          {challenge.categoryName}
                        </Badge>
                      )}
                    </div>

                    <Button asChild className='w-full'>
                      <Link href='/learn'>
                        {challenge.lessonsCompleted > 0
                          ? 'Continue Learning'
                          : 'Start Challenge'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Completed challenges */}
          {completed.length > 0 && (
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold'>Completed</h2>
              {completed.map((challenge) => (
                <Card key={challenge.id} className='opacity-75'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-base flex items-center gap-2'>
                        <CheckCircle2 className='h-5 w-5 text-green-500' />
                        {challenge.title}
                      </CardTitle>
                      <Badge className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'>
                        +{challenge.tokenReward} earned
                      </Badge>
                    </div>
                    {challenge.completedAt && (
                      <CardDescription>
                        Completed{' '}
                        {new Date(challenge.completedAt).toLocaleDateString()}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
