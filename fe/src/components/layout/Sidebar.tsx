'use client';

import { useState, useEffect } from 'react';
import AppLogo from './AppLogo';
import NavMenu from './NavMenu';
import { useAuth } from '@/providers/AuthProvider';

export interface NavItem {
  label: string;
  translationKey: string;
  icon: string;
  href: string;
}

const learnerMainNav: NavItem[] = [
  { label: 'Dashboard', translationKey: 'dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Courses', translationKey: 'courses', icon: 'school', href: '/tracks' },
  { label: 'My Courses', translationKey: 'myCourses', icon: 'local_library', href: '/my-courses' },
  { label: 'Documentation', translationKey: 'documentation', icon: 'description', href: '/documents' },
];

const adminMainNav: NavItem[] = [
  { label: 'Dashboard', translationKey: 'dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Courses', translationKey: 'courses', icon: 'school', href: '/courses' },
  { label: 'Track Management', translationKey: 'trackManager', icon: 'local_library', href: '/admin/tracks' },
  { label: 'Review Queue', translationKey: 'reviews', icon: 'rate_review', href: '/admin/reviews' },
  { label: 'Documentation', translationKey: 'documentation', icon: 'description', href: '/documents' },
];

export const footerNav: NavItem[] = [
  { label: 'Settings', translationKey: 'settings', icon: 'settings', href: '/settings' },
  { label: 'Support', translationKey: 'support', icon: 'contact_support', href: '/support' },
  { label: 'Logout', translationKey: 'logout', icon: 'logout', href: '/logout' },
];

export function getMainNav(role?: string): NavItem[] {
  return role === 'admin' ? adminMainNav : learnerMainNav;
}

// Pre-computed learner nav for SSR/skeleton - ensures consistent initial render
const initialNav = learnerMainNav;

export const mainNav = learnerMainNav;
export { learnerMainNav };

export default function Sidebar() {
  const { user } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Always show learner nav initially (SSG/SSR and first client render match)
  // After mount, switch to logged-in user's actual nav (admin or learner)
  const navItems = hasMounted && user?.role === 'admin' ? adminMainNav : initialNav;

  return (
    <nav className="hidden 
      md:flex flex-col fixed left-0 top-0 h-screen w-sidebar py-lg z-40 
      bg-surface-container-low border-r border-outline-variant">
      <div className="px-lg mb-8">
        <AppLogo />
      </div>

      <div className="flex-1 flex flex-col gap-xs px-md">
        <NavMenu items={navItems} variant="desktop" />
      </div>

      <div className="mt-auto flex flex-col gap-xs pt-md px-md border-t border-outline-variant">
        <NavMenu items={footerNav} variant="desktop" />
      </div>
    </nav>
  );
}