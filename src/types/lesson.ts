export interface LessonCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  color: string | null;
  sortOrder: number;
  lessonCount: number;
}

export interface Lesson {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  content: LessonContent;
  thumbnailUrl: string | null;
  durationMinutes: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tokenReward: number;
  tokenCost: number;
  minAge: number | null;
  maxAge: number | null;
  sortOrder: number;
  isFeatured: boolean;
  isPremium: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LessonWithProgress extends Lesson {
  progress: LessonProgress | null;
}

export interface LessonProgress {
  id: string;
  childProfileId: string;
  lessonId: string;
  started: boolean;
  completed: boolean;
  score: number | null;
  timeSpentSeconds: number;
  startedAt: string | null;
  completedAt: string | null;
}

// Content block types for the JSON lesson content
export type LessonContentBlock =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; alt?: string; caption?: string }
  | { type: 'verse'; reference: string; text: string }
  | { type: 'question'; question: string; options: string[]; correctIndex: number; explanation?: string }
  | { type: 'vocabulary'; word: string; translation: string; pronunciation?: string; example?: string }
  | { type: 'reflection'; prompt: string };

export interface LessonContent {
  blocks: LessonContentBlock[];
}

export interface CompleteLessonInput {
  score?: number;
  timeSpentSeconds: number;
}

export interface LessonsListParams {
  categorySlug?: string;
  difficulty?: string;
  search?: string;
  status?: string;
}
