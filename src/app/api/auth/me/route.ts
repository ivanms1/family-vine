import { NextRequest, NextResponse } from 'next/server';
import { extractUser } from '@/server/auth-helpers';
import { authService } from '@/server/services/auth.service';

export async function GET(request: NextRequest) {
  try {
    const user = await extractUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await authService.getMe(user.userId);
    return NextResponse.json({ user: userData });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
