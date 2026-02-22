'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Star, BookOpen } from 'lucide-react';
import { useLesson } from '@/hooks/use-lessons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DIFFICULTY_LABELS } from '@/lib/constants';
import type { LessonContentBlock } from '@/types/lesson';

export default function LessonPreviewPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const { data, isLoading } = useLesson(lessonId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>Loading lesson...</p>
      </div>
    );
  }

  const lesson = data?.lesson;
  if (!lesson) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>Lesson not found</p>
        <Button asChild className='mt-4'>
          <Link href='/lessons'>Back to Lessons</Link>
        </Button>
      </div>
    );
  }

  const content = lesson.content as { blocks: LessonContentBlock[] };

  return (
    <div className='space-y-6 max-w-3xl'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' asChild>
          <Link href='/lessons'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold'>{lesson.title}</h1>
          <p className='text-muted-foreground mt-1'>{lesson.description}</p>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
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
        <Badge variant={lesson.status === 'PUBLISHED' ? 'default' : 'outline'}>
          {lesson.status}
        </Badge>
        <span className='flex items-center gap-1 text-sm text-muted-foreground'>
          <Clock className='h-3.5 w-3.5' />
          {lesson.durationMinutes} min
        </span>
        <span className='flex items-center gap-1 text-sm text-muted-foreground'>
          <Star className='h-3.5 w-3.5' />
          {lesson.tokenReward} tokens reward
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            Lesson Content Preview
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {content.blocks.map((block, i) => (
            <ContentBlockPreview key={i} block={block} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ContentBlockPreview({ block }: { block: LessonContentBlock }) {
  switch (block.type) {
    case 'text':
      return (
        <div className='prose prose-sm dark:prose-invert max-w-none'>
          <p className='whitespace-pre-line'>{block.content}</p>
        </div>
      );
    case 'verse':
      return (
        <blockquote className='border-l-4 border-primary/50 pl-4 py-2 bg-primary/5 rounded-r-md'>
          <p className='italic text-sm'>{block.text}</p>
          <cite className='text-xs text-muted-foreground not-italic'>
            — {block.reference}
          </cite>
        </blockquote>
      );
    case 'question':
      return (
        <div className='rounded-lg border p-4 space-y-2'>
          <p className='font-medium text-sm'>Question: {block.question}</p>
          <ul className='space-y-1'>
            {block.options.map((opt, i) => (
              <li
                key={i}
                className={`text-sm px-3 py-1.5 rounded ${
                  i === block.correctIndex
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : 'bg-muted'
                }`}
              >
                {opt}
                {i === block.correctIndex && ' (correct)'}
              </li>
            ))}
          </ul>
          {block.explanation && (
            <p className='text-xs text-muted-foreground mt-1'>
              {block.explanation}
            </p>
          )}
        </div>
      );
    case 'vocabulary':
      return (
        <div className='rounded-lg border p-4'>
          <div className='flex items-baseline gap-2'>
            <span className='font-bold'>{block.word}</span>
            <span className='text-muted-foreground'>— {block.translation}</span>
          </div>
          {block.pronunciation && (
            <p className='text-xs text-muted-foreground'>
              /{block.pronunciation}/
            </p>
          )}
          {block.example && (
            <p className='text-sm text-muted-foreground mt-1 italic'>
              {block.example}
            </p>
          )}
        </div>
      );
    case 'reflection':
      return (
        <div className='rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4'>
          <p className='text-sm font-medium text-amber-800 dark:text-amber-200'>
            Reflection
          </p>
          <p className='text-sm text-amber-700 dark:text-amber-300 mt-1'>
            {block.prompt}
          </p>
        </div>
      );
    case 'image':
      return (
        <div className='text-center'>
          <p className='text-sm text-muted-foreground'>
            [Image: {block.alt ?? block.url}]
          </p>
          {block.caption && (
            <p className='text-xs text-muted-foreground'>{block.caption}</p>
          )}
        </div>
      );
    default:
      return null;
  }
}
