export interface ChildProfile {
  id: string;
  familyProfileId: string;
  displayName: string;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  tokenBalance: number;
  dailyTokensEarned: number;
  hasPin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyProfile {
  id: string;
  userId: string;
  familyName: string;
  children: ChildProfile[];
  createdAt: string;
  updatedAt: string;
}

export interface AddChildInput {
  displayName: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  pin?: string;
}

export interface UpdateChildInput {
  displayName?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
}

export interface SetChildPinInput {
  pin: string;
}

export interface ChildLoginInput {
  childProfileId: string;
  pin?: string;
}
