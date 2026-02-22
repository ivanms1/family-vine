import { prisma } from '../db';
import type { CreateChallengeInput } from '../validators/challenge.validators';

export const challengeService = {
  async getChallenges(familyProfileId: string) {
    const challenges = await prisma.familyChallenge.findMany({
      where: { familyProfileId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        challengeProgress: {
          include: {
            childProfile: { select: { displayName: true } },
          },
        },
      },
    });

    // Get category names for challenges with categoryId
    const categoryIds = challenges
      .map((c) => c.categoryId)
      .filter((id): id is string => !!id);

    const categories =
      categoryIds.length > 0
        ? await prisma.lessonCategory.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
          })
        : [];

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    return challenges.map((c) => ({
      id: c.id,
      familyProfileId: c.familyProfileId,
      title: c.title,
      description: c.description,
      tokenReward: c.tokenReward,
      requiredLessons: c.requiredLessons,
      categoryId: c.categoryId,
      categoryName: c.categoryId ? categoryMap.get(c.categoryId) ?? null : null,
      status: c.status,
      startsAt: c.startsAt.toISOString(),
      endsAt: c.endsAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      progress: c.challengeProgress.map((p) => ({
        childProfileId: p.childProfileId,
        childName: p.childProfile.displayName,
        lessonsCompleted: p.lessonsCompleted,
        completed: p.completed,
        completedAt: p.completedAt?.toISOString() ?? null,
      })),
    }));
  },

  async createChallenge(
    familyProfileId: string,
    input: CreateChallengeInput
  ) {
    const endsAt = new Date(input.endsAt);
    if (endsAt <= new Date()) {
      throw new Error('End date must be in the future');
    }

    // Validate categoryId if provided
    if (input.categoryId) {
      const category = await prisma.lessonCategory.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) throw new Error('Category not found');
    }

    const challenge = await prisma.familyChallenge.create({
      data: {
        familyProfileId,
        title: input.title,
        description: input.description,
        tokenReward: input.tokenReward ?? 50,
        requiredLessons: input.requiredLessons,
        categoryId: input.categoryId,
        endsAt,
      },
    });

    // Enroll all children in the challenge
    const children = await prisma.childProfile.findMany({
      where: { familyProfileId },
      select: { id: true, displayName: true },
    });

    await prisma.challengeProgress.createMany({
      data: children.map((child) => ({
        challengeId: challenge.id,
        childProfileId: child.id,
      })),
    });

    return {
      id: challenge.id,
      familyProfileId: challenge.familyProfileId,
      title: challenge.title,
      description: challenge.description,
      tokenReward: challenge.tokenReward,
      requiredLessons: challenge.requiredLessons,
      categoryId: challenge.categoryId,
      categoryName: null,
      status: challenge.status,
      startsAt: challenge.startsAt.toISOString(),
      endsAt: challenge.endsAt.toISOString(),
      createdAt: challenge.createdAt.toISOString(),
      updatedAt: challenge.updatedAt.toISOString(),
      progress: children.map((c) => ({
        childProfileId: c.id,
        childName: c.displayName,
        lessonsCompleted: 0,
        completed: false,
        completedAt: null,
      })),
    };
  },

  async deleteChallenge(challengeId: string, familyProfileId: string) {
    const challenge = await prisma.familyChallenge.findFirst({
      where: { id: challengeId, familyProfileId },
    });

    if (!challenge) throw new Error('Challenge not found');

    await prisma.familyChallenge.delete({ where: { id: challengeId } });
    return { success: true };
  },

  // Get challenges visible to a child
  async getChildChallenges(childProfileId: string, familyProfileId: string) {
    const challenges = await prisma.familyChallenge.findMany({
      where: {
        familyProfileId,
        status: 'ACTIVE',
      },
      orderBy: { endsAt: 'asc' },
      include: {
        challengeProgress: {
          where: { childProfileId },
          take: 1,
        },
      },
    });

    const categoryIds = challenges
      .map((c) => c.categoryId)
      .filter((id): id is string => !!id);

    const categories =
      categoryIds.length > 0
        ? await prisma.lessonCategory.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
          })
        : [];

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    return challenges.map((c) => {
      const progress = c.challengeProgress[0];
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        tokenReward: c.tokenReward,
        requiredLessons: c.requiredLessons,
        categoryName: c.categoryId ? categoryMap.get(c.categoryId) ?? null : null,
        endsAt: c.endsAt.toISOString(),
        lessonsCompleted: progress?.lessonsCompleted ?? 0,
        completed: progress?.completed ?? false,
        completedAt: progress?.completedAt?.toISOString() ?? null,
      };
    });
  },
};
