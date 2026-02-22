'use client';

import Link from 'next/link';
import { Clock, Star, Lock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DIFFICULTY_LABELS } from '@/lib/constants';
import type { Lesson, LessonWithProgress } from '@/types/lesson';

function isLessonWithProgress(
  lesson: Lesson | LessonWithProgress
): lesson is LessonWithProgress {
  return 'progress' in lesson;
}

export function LessonCard({
  lesson,
  href,
}: {
  lesson: Lesson | LessonWithProgress;
  href: string;
}) {
  const hasProgress = isLessonWithProgress(lesson);
  const isCompleted = hasProgress && lesson.progress?.completed;
  const isStarted = hasProgress && lesson.progress?.started && !isCompleted;

  return (
    <Link href={href}>
      <Card className='group relative transition-all hover:shadow-md hover:scale-[1.01]'>
        {isCompleted && (
          <div className='absolute top-3 right-3'>
            <CheckCircle2 className='h-5 w-5 text-green-500' />
          </div>
        )}
        {lesson.isPremium && (
          <div className='absolute top-3 right-3'>
            <Lock className='h-4 w-4 text-muted-foreground' />
          </div>
        )}
        <CardHeader className='pb-2'>
          <div className='flex items-center gap-2 mb-1'>
            <Badge
              variant='outline'
              style={{
                borderColor: lesson.category.color ?? undefined,
                color: lesson.category.color ?? undefined,
              }}
            >
              {lesson.category.name}
            </Badge>
            <Badge variant='secondary'>
              {DIFFICULTY_LABELS[lesson.difficulty] ?? lesson.difficulty}
            </Badge>
          </div>
          <CardTitle className='text-base group-hover:text-primary transition-colors'>
            {lesson.title}
          </CardTitle>
          <CardDescription className='line-clamp-2'>
            {lesson.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              {lesson.durationMinutes} min
            </span>
            <span className='flex items-center gap-1'>
              <Star className='h-3 w-3' />
              {lesson.tokenReward} tokens
            </span>
            {isStarted && (
              <Badge variant='outline' className='text-xs'>
                In Progress
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
