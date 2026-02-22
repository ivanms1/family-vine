import { NextRequest, NextResponse } from 'next/server';
import { requireParent } from '@/server/auth-helpers';
import { familyService } from '@/server/services/family.service';
import { addChildSchema } from '@/server/validators/family.validators';

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
    const input = addChildSchema.parse(body);
    const child = await familyService.addChild(user.familyProfileId, input);
    return NextResponse.json({ child }, { status: 201 });
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
