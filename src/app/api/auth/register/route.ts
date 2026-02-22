import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { registerSchema } from '@/server/validators/auth.validators';
import { setAuthCookie } from '@/server/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = registerSchema.parse(body);
    const result = await authService.register(input);

    const cookie = setAuthCookie(result.token);
    const response = NextResponse.json({ user: result.user }, { status: 201 });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Email already registered') {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
