import { NextRequest, NextResponse } from 'next/server';
import { requireParent } from '@/server/auth-helpers';
import { familyService } from '@/server/services/family.service';
import { updateFamilySchema } from '@/server/validators/family.validators';

export async function GET(request: NextRequest) {
  try {
    const user = await requireParent(request);
    const family = await familyService.getFamily(user.userId);
    return NextResponse.json({ family });
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

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireParent(request);
    const body = await request.json();
    const input = updateFamilySchema.parse(body);
    const family = await familyService.updateFamily(user.userId, input);
    return NextResponse.json({ family });
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
