export interface FamilyChallenge {
  id: string;
  familyProfileId: string;
  title: string;
  description: string | null;
  tokenReward: number;
  requiredLessons: number;
  categoryId: string | null;
  categoryName: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
  progress: ChallengeChildProgress[];
}

export interface ChallengeChildProgress {
  childProfileId: string;
  childName: string;
  lessonsCompleted: number;
  completed: boolean;
  completedAt: string | null;
}

export interface CreateChallengeInput {
  title: string;
  description?: string;
  tokenReward?: number;
  requiredLessons: number;
  categoryId?: string;
  endsAt: string;
}

export interface ChildProgress {
  id: string;
  displayName: string;
  tokenBalance: number;
  lessonsCompleted: number;
  lessonsStarted: number;
  totalTimeSpent: number;
  averageScore: number | null;
  categoryBreakdown: {
    categoryName: string;
    categoryColor: string | null;
    completed: number;
    total: number;
  }[];
  recentLessons: {
    lessonTitle: string;
    categoryName: string;
    score: number | null;
    completedAt: string | null;
  }[];
}
