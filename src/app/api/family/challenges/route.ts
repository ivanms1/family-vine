import { NextRequest, NextResponse } from 'next/server';
import { requireParent } from '@/server/auth-helpers';
import { challengeService } from '@/server/services/challenge.service';
import { createChallengeSchema } from '@/server/validators/challenge.validators';

export async function GET(request: NextRequest) {
  try {
    const user = await requireParent(request);

    if (!user.familyProfileId) {
      return NextResponse.json(
        { error: 'Family profile not found' },
        { status: 400 }
      );
    }

    const challenges = await challengeService.getChallenges(
      user.familyProfileId
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireParent(request);

    if (!user.familyProfileId) {
      return NextResponse.json(
        { error: 'Family profile not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const input = createChallengeSchema.parse(body);
    const challenge = await challengeService.createChallenge(
      user.familyProfileId,
      input
    );
    return NextResponse.json({ challenge }, { status: 201 });
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
