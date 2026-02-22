import { NextRequest, NextResponse } from 'next/server';
import { requireChild } from '@/server/auth-helpers';
import { tokenService } from '@/server/services/token.service';

export async function GET(request: NextRequest) {
  try {
    const session = await requireChild(request);
    const transactions = await tokenService.getHistory(
      session.childProfileId!
    );
    return NextResponse.json({ transactions });
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
