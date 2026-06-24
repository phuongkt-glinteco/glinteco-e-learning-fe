import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const publicRoutes = ['/', '/login', '/register']
const learnerOnlyPaths = ['/dashboard/learner']
const adminOnlyPaths = ['/admin', '/dashboard/admin']
const apiAuthPath = '/api/auth'

export default auth((req) => {
  const { auth: session, nextUrl } = req
  const { pathname } = nextUrl

  // Allow public routes, next-auth API, static assets
  if (publicRoutes.includes(pathname) || pathname.startsWith(apiAuthPath)) {
    return
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo')
  ) {
    return
  }

  // Check both next-auth session AND custom auth cookie (email/password)
  const authCookie = req.cookies.get('auth_verified')
  const isAuthenticated = !!session?.user || !!authCookie?.value

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/dashboard') {
    const role =
      (session?.user as { role?: string } | undefined)?.role ??
      authCookie?.value
    console.log('current role:', role)
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', req.url))
    }
    return NextResponse.redirect(new URL('/dashboard/learner', req.url))
  }

  const role =
      (session?.user as { role?: string } | undefined)?.role ??
      authCookie?.value
    console.log('current role:', role)
  // Role check for admin-only paths
  if (adminOnlyPaths.some((p) => pathname.startsWith(p)) && role !== 'admin')
    return NextResponse.redirect(new URL('/dashboard/learner', req.url))

  if (learnerOnlyPaths.some((p) => pathname.startsWith(p)) && role !== 'learner')     
      return NextResponse.redirect(new URL('/dashboard/admin', req.url))

  return
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
