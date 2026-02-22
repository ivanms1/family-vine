import { NextRequest, NextResponse } from 'next/server';
import { requireParent } from '@/server/auth-helpers';
import { tokenService } from '@/server/services/token.service';
import { reviewSpendRequestSchema } from '@/server/validators/token.validators';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await requireParent(request);
    const { requestId } = await params;

    if (!user.familyProfileId) {
      return NextResponse.json(
        { error: 'Family profile not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const input = reviewSpendRequestSchema.parse(body);

    const result = await tokenService.reviewSpendRequest(
      requestId,
      user.familyProfileId,
      input
    );

    return NextResponse.json({ request: result });
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
