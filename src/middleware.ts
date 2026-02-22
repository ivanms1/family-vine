import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production'
);

const parentProtectedPaths = [
  '/dashboard',
  '/family',
  '/lessons',
  '/progress',
  '/tokens',
  '/settings',
  '/subscription',
  '/select-child',
];

const childProtectedPaths = ['/learn', '/my-rewards', '/challenges'];

const authPaths = ['/login', '/register'];

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as {
      userId: string;
      role: 'PARENT' | 'CHILD';
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const childToken = request.cookies.get('child-token')?.value;

  // Check if path matches auth routes
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p));
  if (isAuthPath) {
    if (token) {
      const user = await verifyToken(token);
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Check if path matches parent-protected routes
  const isParentPath = parentProtectedPaths.some((p) =>
    pathname.startsWith(p)
  );
  if (isParentPath) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const user = await verifyToken(token);
    if (!user || user.role !== 'PARENT') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Check if path matches child-protected routes
  const isChildPath = childProtectedPaths.some((p) =>
    pathname.startsWith(p)
  );
  if (isChildPath) {
    if (!childToken) {
      // Need parent token to select child
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.redirect(new URL('/select-child', request.url));
    }
    const child = await verifyToken(childToken);
    if (!child || child.role !== 'CHILD') {
      return NextResponse.redirect(new URL('/select-child', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|manifest.webmanifest).*)',
  ],
};
