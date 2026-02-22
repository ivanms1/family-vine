import { NextRequest, NextResponse } from 'next/server';
import { requireParent } from '@/server/auth-helpers';
import { prisma } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireParent(request);

    if (!user.familyProfileId) {
      return NextResponse.json(
        { error: 'Family profile not found' },
        { status: 400 }
      );
    }

    const children = await prisma.childProfile.findMany({
      where: { familyProfileId: user.familyProfileId },
      select: { id: true },
    });

    const childIds = children.map((c) => c.id);

    // Get stats for this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [lessonsCompleted, totalTokens, pendingRequests, activeChallenges] =
      await Promise.all([
        prisma.lessonProgress.count({
          where: {
            childProfileId: { in: childIds },
            completed: true,
            completedAt: { gte: weekAgo },
          },
        }),
        prisma.childProfile.aggregate({
          where: { familyProfileId: user.familyProfileId },
          _sum: { tokenBalance: true },
        }),
        prisma.spendRequest.count({
          where: {
            childProfileId: { in: childIds },
            status: 'PENDING',
          },
        }),
        prisma.familyChallenge.count({
          where: {
            familyProfileId: user.familyProfileId,
            status: 'ACTIVE',
          },
        }),
      ]);

    // Recent activity
    const recentActivity = await prisma.lessonProgress.findMany({
      where: {
        childProfileId: { in: childIds },
        completed: true,
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: {
        childProfile: { select: { displayName: true } },
        lesson: { select: { title: true, tokenReward: true } },
      },
    });

    return NextResponse.json({
      stats: {
        lessonsCompleted,
        totalTokens: totalTokens._sum.tokenBalance ?? 0,
        pendingRequests,
        activeChallenges,
      },
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        childName: a.childProfile.displayName,
        lessonTitle: a.lesson.title,
        tokensEarned: a.lesson.tokenReward,
        completedAt: a.completedAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
