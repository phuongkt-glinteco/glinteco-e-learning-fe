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
  { label: 'Leaderboard', translationKey: 'leaderboard', icon: 'social_leaderboard', href: '/leaderboard' },
  { label: 'Document', translationKey: 'document', icon: 'description', href: '/documents' },
];

const adminMainNav: NavItem[] = [
  { label: 'Dashboard', translationKey: 'dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Courses', translationKey: 'courses', icon: 'school', href: '/courses' },
  { label: 'User Management', translationKey: 'userManager', icon: 'person', href: '/admin/users' },
  { label: 'Track Management', translationKey: 'trackManager', icon: 'local_library', href: '/admin/tracks' },
  { label: 'Cohort Management', translationKey: 'cohortManager', icon: 'groups', href: '/admin/cohorts' },
  { label: 'Learner Progress', translationKey: 'learnerProgress', icon: 'trending_up', href: '/admin/progress' },
  { label: 'Review Queue', translationKey: 'reviews', icon: 'rate_review', href: '/admin/reviews' },
  { label: 'Document & Tags', translationKey: 'documentAndTags', icon: 'description', href: '/documents' },
  { label: 'FAQ Management', translationKey: 'faqManager', icon: 'help_center', href: '/admin/faqs' },
  { label: 'Support Tickets', translationKey: 'supportTicketManager', icon: 'support_agent', href: '/admin/support-tickets' },
];

export const footerNav: NavItem[] = [
  { label: 'Settings', translationKey: 'settings', icon: 'settings', href: '/settings' },
  { label: 'Support', translationKey: 'support', icon: 'contact_support', href: '/support' },
  { label: 'Logout', translationKey: 'logout', icon: 'logout', href: '/logout' },
];

export function getMainNav(role?: string): NavItem[] {
  return role?.toLowerCase() === 'admin' ? adminMainNav : learnerMainNav;
}
