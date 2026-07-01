import LandingPageContainer from '@/components/features/landing/containers/landing-page-container';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function getDashboardPath(role?: string | null) {
  return role === 'admin' ? '/dashboard/admin' : '/dashboard/learner';
}

export default async function HomePage() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const authCookieRole = cookieStore.get('auth_verified')?.value;
  const sessionRole = (session?.user as { role?: string } | undefined)?.role;
  const role = sessionRole ?? authCookieRole;

  if (session?.user || authCookieRole) {
    redirect(getDashboardPath(role));
  }

  return <LandingPageContainer />;
}
