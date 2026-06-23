export const landingNavLinkItems = [
  {
    key: 'product',
    href: '#product',
    isActive: true,
  },
  {
    key: 'howItWorks',
    href: '#how-it-works',
  },
  {
    key: 'features',
    href: '#features',
  },
  {
    key: 'mentors',
    href: '#mentors',
  },
  {
    key: 'access',
    href: '/login',
  },
] as const;

export const curriculumStageItems = [
  {
    key: 'foundation',
    id: 'foundation',
    iconName: 'terminal',
    progressPercent: 35,
    moduleKeys: ['productContext', 'localSetup', 'codebaseTour'],
  },
  {
    key: 'implementation',
    id: 'implementation',
    iconName: 'code_blocks',
    progressPercent: 62,
    moduleKeys: ['componentTask', 'apiIntegration', 'testChecklist'],
  },
  {
    key: 'review',
    id: 'review',
    iconName: 'rate_review',
    progressPercent: 88,
    moduleKeys: ['prSubmission', 'mentorReview', 'skillRubric'],
  },
] as const;

export const activityFlowItems = [
  {
    key: 'learn',
    id: 'learn',
    iconName: 'menu_book',
  },
  {
    key: 'practice',
    id: 'practice',
    iconName: 'code_blocks',
  },
  {
    key: 'submit',
    id: 'submit',
    iconName: 'assignment',
  },
  {
    key: 'xp',
    id: 'xp',
    iconName: 'workspace_premium',
  },
] as const;

export const dashboardPreviewMeta = {
  learnerInitials: 'MA',
  progressPercent: 65,
  tag: '#PR-102',
} as const;

export const landingFooterColumnItems = [
  {
    key: 'product',
    linkKeys: [
      { key: 'features', href: '#features' },
      { key: 'learningPath', href: '#product' },
      { key: 'reviewFlow', href: '#how-it-works' },
      { key: 'updates', href: '#product' },
    ],
  },
  {
    key: 'resources',
    linkKeys: [
      { key: 'docs', href: '#product' },
      { key: 'articles', href: '#features' },
      { key: 'engineeringGuides', href: '#how-it-works' },
      { key: 'support', href: '#mentors' },
    ],
  },
  {
    key: 'company',
    linkKeys: [
      { key: 'about', href: '#product' },
      { key: 'careers', href: '#mentors' },
      { key: 'privacy', href: '#product' },
      { key: 'terms', href: '#product' },
    ],
  },
] as const;

export const landingFooterSocialItems = [
  {
    key: 'share',
    href: '#product',
    iconName: 'share',
  },
  {
    key: 'contact',
    href: '#mentors',
    iconName: 'chat_bubble',
  },
] as const;
