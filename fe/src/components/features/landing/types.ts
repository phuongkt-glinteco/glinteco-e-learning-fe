export type LandingCta = {
  label: string;
  href: string;
};

export type LandingNavLink = {
  label: string;
  href: string;
  isActive?: boolean;
};

export type LandingHeroContent = {
  headline: string;
  description: string;
  primaryCta: LandingCta;
  secondaryCta?: LandingCta;
};

export type SectionIntro = {
  eyebrow: string;
  title: string;
  description?: string;
};

export type CurriculumStage = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  iconName: string;
  duration: string;
  progressPercent: number;
  modules: string[];
  statusLabel: string;
};

export type ActivityFlowStep = {
  id: string;
  title: string;
  description: string;
  iconName: string;
};

export type ReviewPreviewItem = {
  title: string;
  subtitle: string;
  tag: string;
  statusLabel: string;
};

export type DashboardPreview = {
  ariaLabel: string;
  learnerName: string;
  learnerInitials: string;
  learnerRole: string;
  activeTrack: string;
  activeTrackLabel: string;
  progressPercent: number;
  xpLabel: string;
  xpTitle: string;
  levelTitle: string;
  levelLabel: string;
  streakTitle: string;
  streakLabel: string;
  reviewItem: ReviewPreviewItem;
};

export type FinalCtaContent = {
  title: string;
  description: string;
  primaryCta: LandingCta;
  secondaryCta: LandingCta;
};

export type LandingFooterLink = {
  label: string;
  href: string;
};

export type LandingFooterColumn = {
  title: string;
  links: LandingFooterLink[];
};

export type LandingFooterSocialLink = {
  label: string;
  href: string;
  iconName: string;
};

export type LandingFooterContent = {
  brandName: string;
  description: string;
  columns: LandingFooterColumn[];
  copyright: string;
  socialLinks: LandingFooterSocialLink[];
};
