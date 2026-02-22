import { NextRequest, NextResponse } from 'next/server';
import { requireParent } from '@/server/auth-helpers';
import { prisma } from '@/server/db';
import { hashPassword, comparePassword } from '@/server/auth';
import { z } from 'zod/v4';

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireParent(request);
    const body = await request.json();
    const input = updateProfileSchema.parse(body);

    // If changing password, verify current password
    if (input.newPassword) {
      if (!input.currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        );
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.userId },
      });

      if (!dbUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const isValid = await comparePassword(
        input.currentPassword,
        dbUser.passwordHash
      );
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }

    // If changing email, check uniqueness
    if (input.email) {
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing && existing.id !== user.userId) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (input.displayName) updateData.displayName = input.displayName;
    if (input.email) updateData.email = input.email;
    if (input.newPassword) {
      updateData.passwordHash = await hashPassword(input.newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updated });
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
