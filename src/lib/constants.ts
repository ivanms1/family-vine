export const APP_NAME = 'FamilyVine';

export const TOKEN_DAILY_CAP = 100;
export const TOKEN_LESSON_REWARD = 10;

export const LESSON_CATEGORIES = {
  FAITH: 'Faith',
  LANGUAGE: 'Language',
  CULTURE: 'Culture',
  DIGITAL_WISDOM: 'Digital Wisdom',
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Faith: '#7C3AED',
  Language: '#2563EB',
  Culture: '#D97706',
  'Digital Wisdom': '#059669',
};

export const CATEGORY_ICONS: Record<string, string> = {
  Faith: 'Heart',
  Language: 'Languages',
  Culture: 'Globe',
  'Digital Wisdom': 'Cpu',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export const SUBSCRIPTION_TIERS = {
  FREE: {
    label: 'Free',
    features: ['Up to 2 children', 'Basic lessons', 'Token rewards'],
  },
  FAMILY: {
    label: 'Family',
    features: [
      'Unlimited children',
      'All lessons',
      'Family challenges',
      'Progress analytics',
    ],
  },
  PREMIUM: {
    label: 'Premium',
    features: [
      'Everything in Family',
      'Premium courses',
      'Church/school features',
      'Priority support',
    ],
  },
} as const;
