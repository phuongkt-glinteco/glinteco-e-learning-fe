'use client';

import { useAuth } from '@/providers/AuthProvider';
import AppLogo from './AppLogo';
import NavMenu from './NavMenu';

export interface NavItem {
  label: string;
  translationKey: string;
  icon: string;
  href: string;
}

export const learnerMainNav: NavItem[] = [
  { label: 'Dashboard', translationKey: 'dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Courses', translationKey: 'courses', icon: 'school', href: '/tracks' },
  { label: 'My Courses', translationKey: 'myCourses', icon: 'local_library', href: '/my-courses' },
  { label: 'Documentation', translationKey: 'documentation', icon: 'description', href: '/docs' },
];

export const adminMainNav: NavItem[] = [
  { label: 'Dashboard', translationKey: 'dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Courses', translationKey: 'courses', icon: 'school', href: '/tracks' },
  { label: 'Track Manager', translationKey: 'trackManager', icon: 'route', href: '/admin/tracks' },
  { label: 'Documentation', translationKey: 'documentation', icon: 'description', href: '/docs' },
];

export const footerNav: NavItem[] = [
  { label: 'Settings', translationKey: 'settings', icon: 'settings', href: '/settings' },
  { label: 'Support', translationKey: 'support', icon: 'contact_support', href: '/support' },
  { label: 'Logout', translationKey: 'logout', icon: 'logout', href: '/logout' },
];


export default function Sidebar() {
  const { user } = useAuth();
  const navItems = user?.role === 'admin' ? adminMainNav : learnerMainNav;

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

