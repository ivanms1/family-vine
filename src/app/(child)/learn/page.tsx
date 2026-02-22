'use client';

import { useState } from 'react';
import { useCategories, useLessons } from '@/hooks/use-lessons';
import { LessonCard } from '@/components/lessons/lesson-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: categoriesData } = useCategories();
  const { data: lessonsData, isLoading } = useLessons(
    selectedCategory ? { categorySlug: selectedCategory } : undefined
  );

  const categories = categoriesData?.categories ?? [];
  const lessons = lessonsData?.lessons ?? [];

  return (
    <div className='space-y-8'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>What do you want to learn?</h1>
        <p className='mt-2 text-muted-foreground'>
          Pick a category to get started
        </p>
      </div>

      {/* Category selector */}
      <div className='grid gap-4 sm:grid-cols-2'>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <Card
              key={cat.slug}
              className={`cursor-pointer transition-all hover:scale-[1.02] ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              style={{
                backgroundColor: isSelected
                  ? `${cat.color}15`
                  : undefined,
              }}
              onClick={() =>
                setSelectedCategory(isSelected ? undefined : cat.slug)
              }
            >
              <CardHeader className='text-center pb-2'>
                <CardTitle className='mt-2' style={{ color: cat.color ?? undefined }}>
                  {cat.name}
                </CardTitle>
                <CardDescription>{cat.description}</CardDescription>
              </CardHeader>
              <CardContent className='text-center'>
                <Badge variant='secondary'>
                  {cat.lessonCount} {cat.lessonCount === 1 ? 'lesson' : 'lessons'}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lesson list */}
      {(selectedCategory || lessons.length > 0) && (
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>
            {selectedCategory
              ? `${categories.find((c) => c.slug === selectedCategory)?.name} Lessons`
              : 'All Lessons'}
          </h2>

          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-muted-foreground'>Loading lessons...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-muted-foreground'>
                No lessons available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className='grid gap-4 sm:grid-cols-2'>
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  href={`/learn/${lesson.id}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
