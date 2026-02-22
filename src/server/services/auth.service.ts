import { prisma } from '../db';
import { hashPassword, comparePassword, signJwt } from '../auth';
import type { RegisterInput, LoginInput } from '../validators/auth.validators';
import { walletService } from './wallet.service';

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        displayName: input.displayName,
        familyProfile: {
          create: {
            familyName: input.familyName,
          },
        },
        subscription: {
          create: {
            tier: 'FREE',
            status: 'ACTIVE',
          },
        },
      },
      include: {
        familyProfile: true,
        subscription: true,
      },
    });

    // Generate blockchain wallet for the family (non-blocking)
    walletService.createFamilyWallet(user.familyProfile!.id).catch((err) => {
      console.error('Failed to create family wallet:', err.message);
    });

    const token = await signJwt({
      userId: user.id,
      role: 'PARENT',
      familyProfileId: user.familyProfile!.id,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        familyProfile: user.familyProfile,
        subscription: user.subscription,
      },
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        familyProfile: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = await signJwt({
      userId: user.id,
      role: 'PARENT',
      familyProfileId: user.familyProfile?.id,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        familyProfile: user.familyProfile,
        subscription: user.subscription,
      },
    };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        familyProfile: {
          include: {
            children: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                tokenBalance: true,
              },
            },
          },
        },
        subscription: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      familyProfile: user.familyProfile,
      subscription: user.subscription,
    };
  },
};
