import { auth } from '@/lib/auth';
import { NextResponse, type NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
const learnerOnlyPaths = ['/dashboard/learner'];
const adminOnlyPaths = ['/admin', '/dashboard/admin', '/reorder'];
const apiAuthPath = '/api/auth';

type AuthMiddlewareRequest = NextRequest & {
  auth?: {
    user?: {
      role?: string;
    } | null;
  } | null;
};

function getDashboardUrl(role: string | undefined, req: NextRequest) {
  return new URL(role === 'admin' ? '/dashboard/admin' : '/dashboard/learner', req.url);
}

export default auth((req: AuthMiddlewareRequest) => {
  const { auth: session, nextUrl } = req;
  const { pathname } = nextUrl;

  const authCookie = req.cookies.get('auth_verified');
  const isAuthenticated = Boolean(session?.user) || Boolean(authCookie?.value);
  const role =
    (session?.user as { role?: string } | undefined)?.role ??
    authCookie?.value;

  if (pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(getDashboardUrl(role, req));
  }

  // Allow public routes, next-auth API, static assets
  if (publicRoutes.includes(pathname) || pathname.startsWith(apiAuthPath)) {
    return;
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo')
  ) {
    return;
  }

  // Check both next-auth session AND custom auth cookie (email/password)
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/dashboard') {
    return NextResponse.redirect(getDashboardUrl(role, req));
  }

  // Role check for admin-only paths
  if (adminOnlyPaths.some((path) => pathname.startsWith(path)) && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard/learner', req.url));
  }

  // Role check for learner-only paths
  if (learnerOnlyPaths.some((path) => pathname.startsWith(path)) && role !== 'learner') {
    return NextResponse.redirect(new URL('/dashboard/admin', req.url));
  }

  return;
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
