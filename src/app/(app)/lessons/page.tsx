'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useCategories, useLessons } from '@/hooks/use-lessons';
import { LessonCard } from '@/components/lessons/lesson-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { LessonsListParams } from '@/types/lesson';

export default function LessonsPage() {
  const [params, setParams] = useState<LessonsListParams>({});
  const { data: categoriesData } = useCategories();
  const { data: lessonsData, isLoading } = useLessons(params);

  const categories = categoriesData?.categories ?? [];
  const lessons = lessonsData?.lessons ?? [];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <BookOpen className='h-6 w-6' />
          Lessons
        </h1>
        <p className='text-muted-foreground mt-1'>
          Browse and preview lessons available for your children
        </p>
      </div>

      {/* Category pills */}
      <div className='flex flex-wrap gap-2'>
        <Badge
          variant={!params.categorySlug ? 'default' : 'outline'}
          className='cursor-pointer'
          onClick={() => setParams((p) => ({ ...p, categorySlug: undefined }))}
        >
          All
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.slug}
            variant={params.categorySlug === cat.slug ? 'default' : 'outline'}
            className='cursor-pointer'
            style={
              params.categorySlug === cat.slug
                ? { backgroundColor: cat.color ?? undefined }
                : { borderColor: cat.color ?? undefined, color: cat.color ?? undefined }
            }
            onClick={() =>
              setParams((p) => ({
                ...p,
                categorySlug: p.categorySlug === cat.slug ? undefined : cat.slug,
              }))
            }
          >
            {cat.name} ({cat.lessonCount})
          </Badge>
        ))}
      </div>

      {/* Filters */}
      <div className='flex gap-3'>
        <Input
          placeholder='Search lessons...'
          className='max-w-xs'
          value={params.search ?? ''}
          onChange={(e) =>
            setParams((p) => ({
              ...p,
              search: e.target.value || undefined,
            }))
          }
        />
        <Select
          value={params.difficulty ?? 'all'}
          onValueChange={(v) =>
            setParams((p) => ({
              ...p,
              difficulty: v === 'all' ? undefined : v,
            }))
          }
        >
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Difficulty' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Levels</SelectItem>
            <SelectItem value='BEGINNER'>Beginner</SelectItem>
            <SelectItem value='INTERMEDIATE'>Intermediate</SelectItem>
            <SelectItem value='ADVANCED'>Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={params.status ?? 'all'}
          onValueChange={(v) =>
            setParams((p) => ({
              ...p,
              status: v === 'all' ? undefined : v,
            }))
          }
        >
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='PUBLISHED'>Published</SelectItem>
            <SelectItem value='DRAFT'>Draft</SelectItem>
            <SelectItem value='ARCHIVED'>Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lesson grid */}
      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <p className='text-muted-foreground'>Loading lessons...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className='text-center py-12'>
          <BookOpen className='h-12 w-12 text-muted-foreground mx-auto' />
          <p className='text-muted-foreground mt-4'>
            No lessons found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              href={`/lessons/${lesson.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
