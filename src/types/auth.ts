export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'PARENT' | 'ADMIN';
  familyProfile: FamilyProfileSummary | null;
  subscription: SubscriptionSummary | null;
}

export interface FamilyProfileSummary {
  id: string;
  familyName: string;
  children?: ChildProfileSummary[];
}

export interface ChildProfileSummary {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  tokenBalance: number;
}

export interface SubscriptionSummary {
  id: string;
  tier: 'FREE' | 'FAMILY' | 'PREMIUM';
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  familyName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
