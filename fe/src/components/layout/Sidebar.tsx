'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Courses', icon: 'school', href: '/courses' },
  { label: 'My Courses', icon: 'local_library', href: '/my-courses' },
  { label: 'Documentation', icon: 'description', href: '/docs' },
];

const footerNav: NavItem[] = [
  { label: 'Settings', icon: 'settings', href: '/settings' },
  { label: 'Support', icon: 'contact_support', href: '/support' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden 
      md:flex flex-col fixed left-0 top-0 h-screen w-sidebar py-lg z-40 
      bg-surface-container-low border-r border-outline-variant">
      <div className="px-lg mb-8">
        <div className="flex items-center justify-start gap-sm">
          <div className="w-10 h-10 bg-primary rounded flex items-center justify-center shrink-0 text-on-primary">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-secondary">RAMP UP</h1>
            <p className="text-xs font-semibold text-on-surface-variant">Engineering Portal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-xs px-md">
        {mainNav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                active
                  ? 'bg-primary/10 text-primary border-r-4 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-xs pt-md px-md border-t border-outline-variant">
        {footerNav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                active
                  ? 'bg-primary/10 text-primary border-r-4 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
