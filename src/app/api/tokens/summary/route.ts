import { NextRequest, NextResponse } from 'next/server';
import { requireParent } from '@/server/auth-helpers';
import { tokenService } from '@/server/services/token.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireParent(request);

    if (!user.familyProfileId) {
      return NextResponse.json(
        { error: 'Family profile not found' },
        { status: 400 }
      );
    }

    const summary = await tokenService.getFamilyTokenSummary(
      user.familyProfileId
    );
    return NextResponse.json(summary);
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
