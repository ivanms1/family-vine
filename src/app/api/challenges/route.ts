import { NextRequest, NextResponse } from 'next/server';
import { requireChild } from '@/server/auth-helpers';
import { challengeService } from '@/server/services/challenge.service';

export async function GET(request: NextRequest) {
  try {
    const session = await requireChild(request);
    const challenges = await challengeService.getChildChallenges(
      session.childProfileId!,
      session.familyProfileId!
    );
    return NextResponse.json({ challenges });
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
