'use client';

import { use, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Star, Clock } from 'lucide-react';
import { useLesson, useCompleteLesson } from '@/hooks/use-lessons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import type { LessonContentBlock } from '@/types/lesson';

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const { data, isLoading } = useLesson(lessonId);
  const completeLesson = useCompleteLesson();
  const router = useRouter();

  const [currentBlock, setCurrentBlock] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState<Record<number, boolean>>({});
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef(Date.now());

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
          <Link href='/learn'>Back to Learn</Link>
        </Button>
      </div>
    );
  }

  const content = lesson.content as { blocks: LessonContentBlock[] };
  const blocks = content.blocks;
  const totalBlocks = blocks.length;
  const block = blocks[currentBlock];
  const progress = ((currentBlock + 1) / totalBlocks) * 100;

  // Count questions and correct answers
  const questionBlocks = blocks
    .map((b, i) => ({ block: b, index: i }))
    .filter((x) => x.block.type === 'question');
  const totalQuestions = questionBlocks.length;
  const correctAnswers = questionBlocks.filter(
    (q) =>
      q.block.type === 'question' &&
      answers[q.index] === q.block.correctIndex
  ).length;

  function handleAnswer(blockIndex: number, optionIndex: number) {
    if (showResult[blockIndex]) return; // Already answered
    setAnswers((prev) => ({ ...prev, [blockIndex]: optionIndex }));
    setShowResult((prev) => ({ ...prev, [blockIndex]: true }));
  }

  function handleNext() {
    if (currentBlock < totalBlocks - 1) {
      setCurrentBlock((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentBlock > 0) {
      setCurrentBlock((prev) => prev - 1);
    }
  }

  function handleComplete() {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const score =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : undefined;

    completeLesson.mutate(
      {
        lessonId,
        input: { timeSpentSeconds: timeSpent, score },
      },
      {
        onSuccess: (result) => {
          setIsComplete(true);
          if (result.tokensAwarded > 0) {
            toast.success(`You earned ${result.tokensAwarded} tokens!`);
          }
        },
        onError: (error) => toast.error(error.message),
      }
    );
  }

  if (isComplete) {
    const score =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 100;

    return (
      <div className='max-w-lg mx-auto text-center space-y-6 py-8'>
        <div className='text-6xl'>
          {score >= 80 ? '🎉' : score >= 50 ? '👍' : '💪'}
        </div>
        <h1 className='text-3xl font-bold'>Lesson Complete!</h1>
        <p className='text-lg text-muted-foreground'>{lesson.title}</p>

        {totalQuestions > 0 && (
          <div className='flex justify-center gap-6'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-primary'>{score}%</div>
              <p className='text-sm text-muted-foreground'>Score</p>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold'>
                {correctAnswers}/{totalQuestions}
              </div>
              <p className='text-sm text-muted-foreground'>Correct</p>
            </div>
          </div>
        )}

        <div className='flex gap-3 justify-center'>
          <Button asChild>
            <Link href='/learn'>Continue Learning</Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/my-rewards'>My Rewards</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <Button variant='ghost' size='sm' asChild>
          <Link href='/learn'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Link>
        </Button>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' style={{ borderColor: lesson.category.color ?? undefined, color: lesson.category.color ?? undefined }}>
            {lesson.category.name}
          </Badge>
          <span className='text-sm text-muted-foreground flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            {lesson.durationMinutes} min
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className='space-y-1'>
        <div className='flex justify-between text-xs text-muted-foreground'>
          <span>{lesson.title}</span>
          <span>
            {currentBlock + 1} / {totalBlocks}
          </span>
        </div>
        <div className='h-2 bg-muted rounded-full overflow-hidden'>
          <div
            className='h-full bg-primary rounded-full transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content block */}
      <Card className='min-h-[300px]'>
        <CardContent className='pt-6'>
          <ContentBlock
            block={block}
            blockIndex={currentBlock}
            selectedAnswer={answers[currentBlock]}
            showResult={showResult[currentBlock]}
            onAnswer={handleAnswer}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className='flex justify-between'>
        <Button
          variant='outline'
          onClick={handlePrev}
          disabled={currentBlock === 0}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Previous
        </Button>

        {currentBlock === totalBlocks - 1 ? (
          <Button
            onClick={handleComplete}
            disabled={completeLesson.isPending}
            className='gap-2'
          >
            <CheckCircle2 className='h-4 w-4' />
            {completeLesson.isPending ? 'Completing...' : 'Complete Lesson'}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Token reward hint */}
      <div className='text-center'>
        <span className='text-xs text-muted-foreground flex items-center justify-center gap-1'>
          <Star className='h-3 w-3' />
          Earn {lesson.tokenReward} tokens by completing this lesson
        </span>
      </div>
    </div>
  );
}

function ContentBlock({
  block,
  blockIndex,
  selectedAnswer,
  showResult,
  onAnswer,
}: {
  block: LessonContentBlock;
  blockIndex: number;
  selectedAnswer?: number;
  showResult?: boolean;
  onAnswer: (blockIndex: number, optionIndex: number) => void;
}) {
  switch (block.type) {
    case 'text':
      return (
        <div className='prose prose-lg dark:prose-invert max-w-none'>
          <p className='whitespace-pre-line leading-relaxed'>{block.content}</p>
        </div>
      );

    case 'verse':
      return (
        <div className='space-y-4'>
          <blockquote className='border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg'>
            <p className='text-lg italic leading-relaxed'>{block.text}</p>
            <cite className='text-sm text-muted-foreground not-italic mt-2 block'>
              — {block.reference}
            </cite>
          </blockquote>
        </div>
      );

    case 'question':
      return (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>{block.question}</h3>
          <div className='space-y-2'>
            {block.options.map((opt, i) => {
              let className =
                'w-full text-left px-4 py-3 rounded-lg border transition-colors ';
              if (showResult) {
                if (i === block.correctIndex) {
                  className +=
                    'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200';
                } else if (i === selectedAnswer && i !== block.correctIndex) {
                  className +=
                    'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200';
                } else {
                  className += 'bg-muted/50 text-muted-foreground';
                }
              } else {
                className +=
                  'hover:bg-accent hover:border-primary cursor-pointer';
              }

              return (
                <button
                  key={i}
                  className={className}
                  onClick={() => onAnswer(blockIndex, i)}
                  disabled={showResult}
                >
                  <span className='font-medium mr-2'>
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {showResult && block.explanation && (
            <div className='rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3'>
              <p className='text-sm text-blue-800 dark:text-blue-200'>
                {block.explanation}
              </p>
            </div>
          )}
        </div>
      );

    case 'vocabulary':
      return (
        <div className='space-y-4 text-center'>
          <div className='text-4xl font-bold'>{block.word}</div>
          {block.pronunciation && (
            <p className='text-muted-foreground'>/{block.pronunciation}/</p>
          )}
          <div className='text-xl text-primary font-medium'>
            {block.translation}
          </div>
          {block.example && (
            <p className='text-muted-foreground italic max-w-md mx-auto'>
              {block.example}
            </p>
          )}
        </div>
      );

    case 'reflection':
      return (
        <div className='space-y-4'>
          <div className='rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6'>
            <p className='text-sm font-medium text-amber-800 dark:text-amber-200 mb-2'>
              Time to Reflect
            </p>
            <p className='text-lg text-amber-700 dark:text-amber-300'>
              {block.prompt}
            </p>
          </div>
          <p className='text-sm text-muted-foreground text-center'>
            Take a moment to think about this, then continue when you&apos;re ready.
          </p>
        </div>
      );

    case 'image':
      return (
        <div className='text-center space-y-2'>
          <p className='text-muted-foreground'>[Image: {block.alt ?? 'Lesson image'}]</p>
          {block.caption && (
            <p className='text-sm text-muted-foreground'>{block.caption}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}
