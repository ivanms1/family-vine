import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt, type JwtPayload } from './auth';

export async function extractUser(
  request?: NextRequest
): Promise<JwtPayload | null> {
  let token: string | undefined;

  if (request) {
    token =
      request.cookies.get('token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
  }

  if (!token) return null;
  return verifyJwt(token);
}

export async function extractChildSession(
  request?: NextRequest
): Promise<JwtPayload | null> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get('child-token')?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get('child-token')?.value;
  }

  if (!token) return null;
  return verifyJwt(token);
}

export async function requireParent(request: NextRequest): Promise<JwtPayload> {
  const user = await extractUser(request);
  if (!user) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'PARENT') {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}

export async function requireChild(request: NextRequest): Promise<JwtPayload> {
  const session = await extractChildSession(request);
  if (!session) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.role !== 'CHILD') {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return session;
}

export function setAuthCookie(token: string): {
  name: string;
  value: string;
  options: Record<string, unknown>;
} {
  return {
    name: 'token',
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  };
}

export function setChildAuthCookie(token: string): {
  name: string;
  value: string;
  options: Record<string, unknown>;
} {
  return {
    name: 'child-token',
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 4, // 4 hours (shorter for child sessions)
    },
  };
}
