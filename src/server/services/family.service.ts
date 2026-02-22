import { prisma } from '../db';
import { hashPassword, comparePassword, signJwt } from '../auth';
import type {
  AddChildInput,
  UpdateChildInput,
  SetChildPinInput,
  ChildLoginInput,
  UpdateFamilyInput,
} from '../validators/family.validators';

function mapChild(child: {
  id: string;
  familyProfileId: string;
  displayName: string;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  pin: string | null;
  tokenBalance: number;
  dailyTokensEarned: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: child.id,
    familyProfileId: child.familyProfileId,
    displayName: child.displayName,
    avatarUrl: child.avatarUrl,
    dateOfBirth: child.dateOfBirth?.toISOString() ?? null,
    tokenBalance: child.tokenBalance,
    dailyTokensEarned: child.dailyTokensEarned,
    hasPin: !!child.pin,
    createdAt: child.createdAt.toISOString(),
    updatedAt: child.updatedAt.toISOString(),
  };
}

export const familyService = {
  async getFamily(userId: string) {
    const family = await prisma.familyProfile.findUnique({
      where: { userId },
      include: {
        children: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!family) {
      throw new Error('Family not found');
    }

    return {
      id: family.id,
      userId: family.userId,
      familyName: family.familyName,
      children: family.children.map(mapChild),
      createdAt: family.createdAt.toISOString(),
      updatedAt: family.updatedAt.toISOString(),
    };
  },

  async updateFamily(userId: string, input: UpdateFamilyInput) {
    const family = await prisma.familyProfile.update({
      where: { userId },
      data: { familyName: input.familyName },
      include: { children: { orderBy: { createdAt: 'asc' } } },
    });

    return {
      id: family.id,
      userId: family.userId,
      familyName: family.familyName,
      children: family.children.map(mapChild),
      createdAt: family.createdAt.toISOString(),
      updatedAt: family.updatedAt.toISOString(),
    };
  },

  async addChild(familyProfileId: string, input: AddChildInput) {
    const pinHash = input.pin ? await hashPassword(input.pin) : null;

    const child = await prisma.childProfile.create({
      data: {
        familyProfileId,
        displayName: input.displayName,
        dateOfBirth: input.dateOfBirth
          ? new Date(input.dateOfBirth)
          : undefined,
        avatarUrl: input.avatarUrl,
        pin: pinHash,
      },
    });

    return mapChild(child);
  },

  async getChild(childId: string, familyProfileId: string) {
    const child = await prisma.childProfile.findFirst({
      where: { id: childId, familyProfileId },
    });

    if (!child) {
      throw new Error('Child not found');
    }

    return mapChild(child);
  },

  async updateChild(
    childId: string,
    familyProfileId: string,
    input: UpdateChildInput
  ) {
    const child = await prisma.childProfile.findFirst({
      where: { id: childId, familyProfileId },
    });

    if (!child) {
      throw new Error('Child not found');
    }

    const updated = await prisma.childProfile.update({
      where: { id: childId },
      data: {
        displayName: input.displayName,
        dateOfBirth: input.dateOfBirth
          ? new Date(input.dateOfBirth)
          : undefined,
        avatarUrl: input.avatarUrl,
      },
    });

    return mapChild(updated);
  },

  async deleteChild(childId: string, familyProfileId: string) {
    const child = await prisma.childProfile.findFirst({
      where: { id: childId, familyProfileId },
    });

    if (!child) {
      throw new Error('Child not found');
    }

    await prisma.childProfile.delete({ where: { id: childId } });
    return { success: true };
  },

  async setChildPin(
    childId: string,
    familyProfileId: string,
    input: SetChildPinInput
  ) {
    const child = await prisma.childProfile.findFirst({
      where: { id: childId, familyProfileId },
    });

    if (!child) {
      throw new Error('Child not found');
    }

    const pinHash = await hashPassword(input.pin);
    await prisma.childProfile.update({
      where: { id: childId },
      data: { pin: pinHash },
    });

    return { success: true };
  },

  async removeChildPin(childId: string, familyProfileId: string) {
    const child = await prisma.childProfile.findFirst({
      where: { id: childId, familyProfileId },
    });

    if (!child) {
      throw new Error('Child not found');
    }

    await prisma.childProfile.update({
      where: { id: childId },
      data: { pin: null },
    });

    return { success: true };
  },

  async childLogin(parentUserId: string, input: ChildLoginInput) {
    const family = await prisma.familyProfile.findUnique({
      where: { userId: parentUserId },
    });

    if (!family) {
      throw new Error('Family not found');
    }

    const child = await prisma.childProfile.findFirst({
      where: { id: input.childProfileId, familyProfileId: family.id },
    });

    if (!child) {
      throw new Error('Child not found in your family');
    }

    // Verify PIN if set
    if (child.pin) {
      if (!input.pin) {
        throw new Error('PIN required');
      }
      const isValid = await comparePassword(input.pin, child.pin);
      if (!isValid) {
        throw new Error('Invalid PIN');
      }
    }

    const token = await signJwt({
      userId: parentUserId,
      role: 'CHILD',
      childProfileId: child.id,
      familyProfileId: family.id,
    });

    return {
      token,
      child: mapChild(child),
    };
  },
};
