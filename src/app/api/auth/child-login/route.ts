import { NextRequest, NextResponse } from 'next/server';
import { extractUser, setChildAuthCookie } from '@/server/auth-helpers';
import { familyService } from '@/server/services/family.service';
import { childLoginSchema } from '@/server/validators/family.validators';

export async function POST(request: NextRequest) {
  try {
    const user = await extractUser(request);
    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input = childLoginSchema.parse(body);
    const result = await familyService.childLogin(user.userId, input);

    const cookie = setChildAuthCookie(result.token);
    const response = NextResponse.json({ child: result.child });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === 'PIN required' ||
        error.message === 'Invalid PIN'
      ) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message === 'Child not found in your family') {
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
