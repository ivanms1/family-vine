import { NextRequest, NextResponse } from 'next/server';
import { requireChild } from '@/server/auth-helpers';
import { tokenService } from '@/server/services/token.service';
import { createSpendRequestSchema } from '@/server/validators/token.validators';

export async function GET(request: NextRequest) {
  try {
    const session = await requireChild(request);
    const requests = await tokenService.getSpendRequests(
      session.childProfileId!
    );
    return NextResponse.json({ requests });
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
    const session = await requireChild(request);
    const body = await request.json();
    const input = createSpendRequestSchema.parse(body);
    const spendRequest = await tokenService.createSpendRequest(
      session.childProfileId!,
      input
    );
    return NextResponse.json({ request: spendRequest }, { status: 201 });
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
