import { prisma } from '../db';
import { TOKEN_DAILY_CAP } from '@/lib/constants';
import type { CompleteLessonInput, LessonQueryInput } from '../validators/lesson.validators';
import type { Prisma } from '@/generated/prisma/client';
import { blockchainService } from './blockchain.service';

export const lessonService = {
  async getCategories() {
    const categories = await prisma.lessonCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { lessons: { where: { status: 'PUBLISHED' } } } },
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      iconName: cat.iconName,
      color: cat.color,
      sortOrder: cat.sortOrder,
      lessonCount: cat._count.lessons,
    }));
  },

  async getLessons(query: LessonQueryInput, isParent = false) {
    const where: Prisma.LessonWhereInput = {};

    // Only show published lessons to children
    if (!isParent) {
      where.status = 'PUBLISHED';
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }

    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        category: { select: { id: true, name: true, slug: true, color: true } },
      },
    });

    return lessons.map(mapLesson);
  },

  async getLessonsForChild(
    query: LessonQueryInput,
    childProfileId: string
  ) {
    const where: Prisma.LessonWhereInput = {
      status: 'PUBLISHED',
    };

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }

    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        category: { select: { id: true, name: true, slug: true, color: true } },
        lessonProgress: {
          where: { childProfileId },
          take: 1,
        },
      },
    });

    return lessons.map((lesson) => ({
      ...mapLesson(lesson),
      progress: lesson.lessonProgress[0]
        ? mapProgress(lesson.lessonProgress[0])
        : null,
    }));
  },

  async getLesson(lessonId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        category: { select: { id: true, name: true, slug: true, color: true } },
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    return mapLesson(lesson);
  },

  async getLessonForChild(lessonId: string, childProfileId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, status: 'PUBLISHED' },
      include: {
        category: { select: { id: true, name: true, slug: true, color: true } },
        lessonProgress: {
          where: { childProfileId },
          take: 1,
        },
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Mark as started if not already
    let progress = lesson.lessonProgress[0] ?? null;
    if (!progress) {
      progress = await prisma.lessonProgress.create({
        data: {
          childProfileId,
          lessonId,
          started: true,
          startedAt: new Date(),
        },
      });
    } else if (!progress.started) {
      progress = await prisma.lessonProgress.update({
        where: { id: progress.id },
        data: { started: true, startedAt: new Date() },
      });
    }

    return {
      ...mapLesson(lesson),
      progress: mapProgress(progress),
    };
  },

  async completeLesson(
    lessonId: string,
    childProfileId: string,
    input: CompleteLessonInput
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, status: 'PUBLISHED' },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check if already completed
    const existing = await prisma.lessonProgress.findUnique({
      where: { childProfileId_lessonId: { childProfileId, lessonId } },
    });

    if (existing?.completed) {
      throw new Error('Lesson already completed');
    }

    // Get child profile for daily cap check
    const child = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
    });

    if (!child) {
      throw new Error('Child profile not found');
    }

    // Reset daily counter if needed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(child.lastTokenResetDate);
    lastReset.setHours(0, 0, 0, 0);

    let dailyEarned = child.dailyTokensEarned;
    if (today > lastReset) {
      dailyEarned = 0;
    }

    // Calculate token reward respecting daily cap
    const maxEarnable = TOKEN_DAILY_CAP - dailyEarned;
    const tokensToAward = Math.min(lesson.tokenReward, maxEarnable);
    const newBalance = child.tokenBalance + tokensToAward;

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update or create lesson progress
      const progress = existing
        ? await tx.lessonProgress.update({
            where: { id: existing.id },
            data: {
              completed: true,
              score: input.score ?? null,
              timeSpentSeconds: input.timeSpentSeconds,
              completedAt: new Date(),
            },
          })
        : await tx.lessonProgress.create({
            data: {
              childProfileId,
              lessonId,
              started: true,
              completed: true,
              score: input.score ?? null,
              timeSpentSeconds: input.timeSpentSeconds,
              startedAt: new Date(),
              completedAt: new Date(),
            },
          });

      // Award tokens
      let tokenTxId: string | null = null;
      if (tokensToAward > 0) {
        const tokenTx = await tx.tokenTransaction.create({
          data: {
            childProfileId,
            type: 'EARN_LESSON_COMPLETE',
            amount: tokensToAward,
            balanceAfter: newBalance,
            description: `Completed: ${lesson.title}`,
            referenceId: lessonId,
            blockchainSyncStatus: blockchainService.isEnabled() ? 'PENDING' : undefined,
          },
        });
        tokenTxId = tokenTx.id;
      }

      // Update child balance
      await tx.childProfile.update({
        where: { id: childProfileId },
        data: {
          tokenBalance: newBalance,
          dailyTokensEarned: dailyEarned + tokensToAward,
          lastTokenResetDate: today > lastReset ? today : undefined,
        },
      });

      return { progress, tokensAwarded: tokensToAward, newBalance, tokenTxId };
    });

    // Fire-and-forget blockchain sync
    if (result.tokenTxId) {
      blockchainService.syncTransaction(result.tokenTxId).catch((err) => {
        console.error('Blockchain sync failed (will retry):', err.message);
      });
    }

    return {
      progress: mapProgress(result.progress),
      tokensAwarded: result.tokensAwarded,
      newBalance: result.newBalance,
    };
  },
};

function mapLesson(lesson: {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  content: unknown;
  thumbnailUrl: string | null;
  durationMinutes: number;
  difficulty: string;
  status: string;
  tokenReward: number;
  tokenCost: number;
  minAge: number | null;
  maxAge: number | null;
  sortOrder: number;
  isFeatured: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string; color: string | null };
}) {
  return {
    id: lesson.id,
    categoryId: lesson.categoryId,
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    content: lesson.content,
    thumbnailUrl: lesson.thumbnailUrl,
    durationMinutes: lesson.durationMinutes,
    difficulty: lesson.difficulty,
    status: lesson.status,
    tokenReward: lesson.tokenReward,
    tokenCost: lesson.tokenCost,
    minAge: lesson.minAge,
    maxAge: lesson.maxAge,
    sortOrder: lesson.sortOrder,
    isFeatured: lesson.isFeatured,
    isPremium: lesson.isPremium,
    category: lesson.category,
    createdAt: lesson.createdAt.toISOString(),
    updatedAt: lesson.updatedAt.toISOString(),
  };
}

function mapProgress(progress: {
  id: string;
  childProfileId: string;
  lessonId: string;
  started: boolean;
  completed: boolean;
  score: number | null;
  timeSpentSeconds: number;
  startedAt: Date | null;
  completedAt: Date | null;
}) {
  return {
    id: progress.id,
    childProfileId: progress.childProfileId,
    lessonId: progress.lessonId,
    started: progress.started,
    completed: progress.completed,
    score: progress.score,
    timeSpentSeconds: progress.timeSpentSeconds,
    startedAt: progress.startedAt?.toISOString() ?? null,
    completedAt: progress.completedAt?.toISOString() ?? null,
  };
}
