import { prisma } from '../db';

export const progressService = {
  async getFamilyProgress(familyProfileId: string) {
    const children = await prisma.childProfile.findMany({
      where: { familyProfileId },
      orderBy: { createdAt: 'asc' },
      include: {
        lessonProgress: {
          include: {
            lesson: {
              include: {
                category: { select: { name: true, color: true } },
              },
            },
          },
        },
      },
    });

    // Get all categories for breakdown
    const categories = await prisma.lessonCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { lessons: { where: { status: 'PUBLISHED' } } } },
      },
    });

    return children.map((child) => {
      const completed = child.lessonProgress.filter((p) => p.completed);
      const started = child.lessonProgress.filter(
        (p) => p.started && !p.completed
      );

      const scores = completed
        .map((p) => p.score)
        .filter((s): s is number => s !== null);

      const totalTime = child.lessonProgress.reduce(
        (sum, p) => sum + p.timeSpentSeconds,
        0
      );

      // Category breakdown
      const completedByCategory = new Map<string, number>();
      for (const p of completed) {
        const catName = p.lesson.category.name;
        completedByCategory.set(
          catName,
          (completedByCategory.get(catName) ?? 0) + 1
        );
      }

      const categoryBreakdown = categories.map((cat) => ({
        categoryName: cat.name,
        categoryColor: cat.color,
        completed: completedByCategory.get(cat.name) ?? 0,
        total: cat._count.lessons,
      }));

      // Recent lessons (last 5 completed)
      const recentLessons = completed
        .sort(
          (a, b) =>
            (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)
        )
        .slice(0, 5)
        .map((p) => ({
          lessonTitle: p.lesson.title,
          categoryName: p.lesson.category.name,
          score: p.score,
          completedAt: p.completedAt?.toISOString() ?? null,
        }));

      return {
        id: child.id,
        displayName: child.displayName,
        tokenBalance: child.tokenBalance,
        lessonsCompleted: completed.length,
        lessonsStarted: started.length,
        totalTimeSpent: totalTime,
        averageScore:
          scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null,
        categoryBreakdown,
        recentLessons,
      };
    });
  },
};
