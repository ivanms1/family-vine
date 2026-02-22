import { NextRequest, NextResponse } from 'next/server';
import { requireParent } from '@/server/auth-helpers';
import { familyService } from '@/server/services/family.service';
import { updateChildSchema } from '@/server/validators/family.validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const user = await requireParent(request);
    const { childId } = await params;

    if (!user.familyProfileId) {
      return NextResponse.json(
        { error: 'Family profile not found' },
        { status: 400 }
      );
    }

    const child = await familyService.getChild(childId, user.familyProfileId);
    return NextResponse.json({ child });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error) {
      if (error.message === 'Child not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const user = await requireParent(request);
    const { childId } = await params;

    if (!user.familyProfileId) {
      return NextResponse.json(
        { error: 'Family profile not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const input = updateChildSchema.parse(body);
    const child = await familyService.updateChild(
      childId,
      user.familyProfileId,
      input
    );
    return NextResponse.json({ child });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error) {
      if (error.message === 'Child not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const user = await requireParent(request);
    const { childId } = await params;

    if (!user.familyProfileId) {
      return NextResponse.json(
        { error: 'Family profile not found' },
        { status: 400 }
      );
    }

    await familyService.deleteChild(childId, user.familyProfileId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error) {
      if (error.message === 'Child not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
