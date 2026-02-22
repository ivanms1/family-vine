import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { loginSchema } from '@/server/validators/auth.validators';
import { setAuthCookie } from '@/server/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);
    const result = await authService.login(input);

    const cookie = setAuthCookie(result.token);
    const response = NextResponse.json({ user: result.user });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid email or password') {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
