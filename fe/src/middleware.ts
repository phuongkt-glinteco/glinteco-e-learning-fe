import { NextResponse, type NextRequest } from 'next/server';

// Temporary cookie name until the backend defines the production HttpOnly auth cookie.
const AUTH_COOKIE_NAME = 'auth_token';
const protectedRoutePrefixes = ['/dashboard', '/tracks', '/docs', '/exercises', '/admin'] as const;

function isProtectedPath(pathname: string) {
  return protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthToken = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (pathname === '/login' && hasAuthToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isProtectedPath(pathname) && !hasAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
