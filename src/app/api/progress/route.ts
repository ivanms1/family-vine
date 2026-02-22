import { NextRequest, NextResponse } from 'next/server';
import { requireParent } from '@/server/auth-helpers';
import { progressService } from '@/server/services/progress.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireParent(request);

    if (!user.familyProfileId) {
      return NextResponse.json(
        { error: 'Family profile not found' },
        { status: 400 }
      );
    }

    const children = await progressService.getFamilyProgress(
      user.familyProfileId
    );
    return NextResponse.json({ children });
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
