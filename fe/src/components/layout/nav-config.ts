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
  { label: 'Exercises', translationKey: 'exercises', icon: 'code', href: '/exercises' },
  { label: 'Document & Tags', translationKey: 'documentAndTags', icon: 'description', href: '/documents' },
];

const adminMainNav: NavItem[] = [
  { label: 'Dashboard', translationKey: 'dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Courses', translationKey: 'courses', icon: 'school', href: '/courses' },
  { label: 'Track Management', translationKey: 'trackManager', icon: 'local_library', href: '/admin/tracks' },
  { label: 'Review Queue', translationKey: 'reviews', icon: 'rate_review', href: '/admin/reviews' },
  { label: 'Document & Tags', translationKey: 'documentAndTags', icon: 'description', href: '/documents' },
];

export const footerNav: NavItem[] = [
  { label: 'Settings', translationKey: 'settings', icon: 'settings', href: '/settings' },
  { label: 'Support', translationKey: 'support', icon: 'contact_support', href: '/support' },
  { label: 'Logout', translationKey: 'logout', icon: 'logout', href: '/logout' },
];

export function getMainNav(role?: string): NavItem[] {
  return role === 'admin' ? adminMainNav : learnerMainNav;
}
