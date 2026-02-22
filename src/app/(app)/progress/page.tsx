'use client';

import { useState } from 'react';
import { BarChart3, Clock, Star, BookOpen, Trophy, Trash2 } from 'lucide-react';
import { useFamilyProgress, useChallenges, useCreateChallenge, useDeleteChallenge } from '@/hooks/use-challenges';
import { useCategories } from '@/hooks/use-lessons';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ProgressPage() {
  const { data: progressData, isLoading } = useFamilyProgress();
  const { data: challengesData } = useChallenges();

  const children = progressData?.children ?? [];
  const challenges = challengesData?.challenges ?? [];

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <BarChart3 className='h-6 w-6' />
            Progress & Challenges
          </h1>
          <p className='text-muted-foreground mt-1'>
            Track your family&apos;s learning journey
          </p>
        </div>
        <CreateChallengeDialog />
      </div>

      <Tabs defaultValue='progress'>
        <TabsList>
          <TabsTrigger value='progress'>Progress</TabsTrigger>
          <TabsTrigger value='challenges'>
            Challenges
            {challenges.filter((c) => c.status === 'ACTIVE').length > 0 && (
              <Badge variant='secondary' className='ml-1.5 text-xs px-1.5'>
                {challenges.filter((c) => c.status === 'ACTIVE').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='progress' className='mt-4 space-y-6'>
          {children.length === 0 ? (
            <Card>
              <CardContent className='text-center py-8'>
                <p className='text-muted-foreground'>
                  No children in your family yet. Add children to see their progress.
                </p>
              </CardContent>
            </Card>
          ) : (
            children.map((child) => (
              <Card key={child.id}>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle>{child.displayName}</CardTitle>
                    <Badge variant='outline'>{child.tokenBalance} tokens</Badge>
                  </div>
                  <CardDescription>
                    {child.lessonsCompleted} lessons completed
                    {child.averageScore !== null &&
                      ` · ${child.averageScore}% avg score`}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Stats row */}
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-primary'>
                        {child.lessonsCompleted}
                      </div>
                      <p className='text-xs text-muted-foreground'>Completed</p>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>
                        {child.lessonsStarted}
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        In Progress
                      </p>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>
                        {child.averageScore ?? '-'}
                        {child.averageScore !== null && '%'}
                      </div>
                      <p className='text-xs text-muted-foreground'>Avg Score</p>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>
                        {formatTime(child.totalTimeSpent)}
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Time Spent
                      </p>
                    </div>
                  </div>

                  {/* Category breakdown */}
                  {child.categoryBreakdown.length > 0 && (
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>
                        Category Progress
                      </h4>
                      <div className='space-y-2'>
                        {child.categoryBreakdown.map((cat) => (
                          <div key={cat.categoryName} className='space-y-1'>
                            <div className='flex justify-between text-xs'>
                              <span>{cat.categoryName}</span>
                              <span className='text-muted-foreground'>
                                {cat.completed}/{cat.total}
                              </span>
                            </div>
                            <div className='h-2 bg-muted rounded-full overflow-hidden'>
                              <div
                                className='h-full rounded-full transition-all'
                                style={{
                                  width:
                                    cat.total > 0
                                      ? `${(cat.completed / cat.total) * 100}%`
                                      : '0%',
                                  backgroundColor:
                                    cat.categoryColor ?? '#6366f1',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent lessons */}
                  {child.recentLessons.length > 0 && (
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Recent Lessons</h4>
                      <div className='space-y-2'>
                        {child.recentLessons.map((lesson, i) => (
                          <div
                            key={i}
                            className='flex items-center justify-between text-sm py-1.5 border-b last:border-0'
                          >
                            <div className='flex items-center gap-2'>
                              <BookOpen className='h-3.5 w-3.5 text-muted-foreground' />
                              <span>{lesson.lessonTitle}</span>
                              <Badge variant='outline' className='text-xs'>
                                {lesson.categoryName}
                              </Badge>
                            </div>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                              {lesson.score !== null && (
                                <span className='flex items-center gap-1'>
                                  <Star className='h-3 w-3' />
                                  {lesson.score}%
                                </span>
                              )}
                              {lesson.completedAt && (
                                <span className='flex items-center gap-1 text-xs'>
                                  <Clock className='h-3 w-3' />
                                  {new Date(
                                    lesson.completedAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value='challenges' className='mt-4 space-y-4'>
          {challenges.length === 0 ? (
            <Card>
              <CardContent className='text-center py-8'>
                <Trophy className='h-12 w-12 text-muted-foreground mx-auto' />
                <p className='text-muted-foreground mt-4'>
                  No challenges yet. Create one to motivate your family!
                </p>
              </CardContent>
            </Card>
          ) : (
            challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChallengeCard({
  challenge,
}: {
  challenge: {
    id: string;
    title: string;
    description: string | null;
    tokenReward: number;
    requiredLessons: number;
    categoryName: string | null;
    status: string;
    endsAt: string;
    progress: {
      childName: string;
      lessonsCompleted: number;
      completed: boolean;
    }[];
  };
}) {
  const deleteChallenge = useDeleteChallenge();
  const isExpired = new Date(challenge.endsAt) < new Date();

  return (
    <Card
      className={
        challenge.status !== 'ACTIVE' ? 'opacity-60' : ''
      }
    >
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-base flex items-center gap-2'>
              <Trophy className='h-4 w-4' />
              {challenge.title}
            </CardTitle>
            {challenge.description && (
              <CardDescription className='mt-1'>
                {challenge.description}
              </CardDescription>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Badge
              variant={
                challenge.status === 'ACTIVE'
                  ? 'default'
                  : challenge.status === 'COMPLETED'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {challenge.status}
            </Badge>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                if (confirm('Delete this challenge?')) {
                  deleteChallenge.mutate(challenge.id, {
                    onSuccess: () => toast.success('Challenge deleted'),
                    onError: (e) => toast.error(e.message),
                  });
                }
              }}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
        <div className='flex gap-3 text-xs text-muted-foreground mt-2'>
          <span>{challenge.requiredLessons} lessons required</span>
          <span>{challenge.tokenReward} token reward</span>
          {challenge.categoryName && <span>{challenge.categoryName}</span>}
          <span>
            {isExpired ? 'Ended' : 'Ends'}{' '}
            {new Date(challenge.endsAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {challenge.progress.map((p) => (
            <div
              key={p.childName}
              className='flex items-center justify-between'
            >
              <span className='text-sm'>{p.childName}</span>
              <div className='flex items-center gap-2'>
                <div className='h-2 w-24 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary rounded-full transition-all'
                    style={{
                      width: `${Math.min(
                        (p.lessonsCompleted / challenge.requiredLessons) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <span className='text-xs text-muted-foreground'>
                  {p.lessonsCompleted}/{challenge.requiredLessons}
                </span>
                {p.completed && (
                  <Badge variant='secondary' className='text-xs'>
                    Done
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateChallengeDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredLessons, setRequiredLessons] = useState('5');
  const [tokenReward, setTokenReward] = useState('50');
  const [categoryId, setCategoryId] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const createChallenge = useCreateChallenge();
  const { data: categoriesData } = useCategories();

  const categories = categoriesData?.categories ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createChallenge.mutate(
      {
        title,
        description: description || undefined,
        requiredLessons: parseInt(requiredLessons),
        tokenReward: parseInt(tokenReward),
        categoryId: categoryId || undefined,
        endsAt,
      },
      {
        onSuccess: () => {
          toast.success('Challenge created!');
          setOpen(false);
          setTitle('');
          setDescription('');
          setRequiredLessons('5');
          setTokenReward('50');
          setCategoryId('');
          setEndsAt('');
        },
        onError: (error) => toast.error(error.message),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Trophy className='mr-2 h-4 w-4' />
          New Challenge
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Family Challenge</DialogTitle>
          <DialogDescription>
            Set a learning goal for your children to work towards
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='text-sm font-medium'>Challenge Title</label>
            <Input
              placeholder='e.g., Faith Week Challenge'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='mt-1'
              required
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Description (optional)</label>
            <Textarea
              placeholder='Describe the challenge...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='mt-1'
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-sm font-medium'>Required Lessons</label>
              <Input
                type='number'
                min={1}
                max={50}
                value={requiredLessons}
                onChange={(e) => setRequiredLessons(e.target.value)}
                className='mt-1'
              />
            </div>
            <div>
              <label className='text-sm font-medium'>Token Reward</label>
              <Input
                type='number'
                min={1}
                max={500}
                value={tokenReward}
                onChange={(e) => setTokenReward(e.target.value)}
                className='mt-1'
              />
            </div>
          </div>
          <div>
            <label className='text-sm font-medium'>Category (optional)</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Any category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='any'>Any category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className='text-sm font-medium'>End Date</label>
            <Input
              type='date'
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className='mt-1'
              required
            />
          </div>
          <Button type='submit' className='w-full' disabled={createChallenge.isPending}>
            {createChallenge.isPending ? 'Creating...' : 'Create Challenge'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
