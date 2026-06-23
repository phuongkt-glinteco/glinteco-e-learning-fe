import { getTranslations } from 'next-intl/server';
import { ActivityFlow } from '../components/activity-flow';
import { CurriculumPreview } from '../components/curriculum-preview';
import { FinalCta } from '../components/final-cta';
import { LandingFooter } from '../components/landing-footer';
import { LandingHeader } from '../components/landing-header';
import { LandingHero } from '../components/landing-hero';
import type {
  ActivityFlowStep,
  CurriculumStage,
  DashboardPreview,
  FinalCtaContent,
  LandingFooterContent,
  LandingHeroContent,
  LandingNavLink,
  SectionIntro,
} from '../types';
import {
  activityFlowItems,
  curriculumStageItems,
  dashboardPreviewMeta,
  landingFooterColumnItems,
  landingFooterSocialItems,
  landingNavLinkItems,
} from '@/mocks/landing';

export default async function LandingPageContainer() {
  const t = await getTranslations('LandingPage');
  const primaryCta = { label: t('cta.primary'), href: '/login' };
  const secondaryCta = { label: t('cta.secondary'), href: '#product' };

  const navLinks: LandingNavLink[] = landingNavLinkItems.map((link) => ({
    label: t(`nav.links.${link.key}`),
    href: link.href,
    isActive: 'isActive' in link ? link.isActive : undefined,
  }));

  const landingHero: LandingHeroContent = {
    headline: t('hero.headline'),
    description: t('hero.description'),
    primaryCta,
    secondaryCta,
  };

  const dashboardPreview: DashboardPreview = {
    ariaLabel: t('dashboardPreview.ariaLabel'),
    learnerName: t('dashboardPreview.learnerName'),
    learnerInitials: dashboardPreviewMeta.learnerInitials,
    learnerRole: t('dashboardPreview.learnerRole'),
    activeTrack: t('dashboardPreview.activeTrack'),
    activeTrackLabel: t('dashboardPreview.activeTrackLabel'),
    progressPercent: dashboardPreviewMeta.progressPercent,
    xpLabel: t('dashboardPreview.xpLabel'),
    xpTitle: t('dashboardPreview.xpTitle'),
    levelTitle: t('dashboardPreview.levelTitle'),
    levelLabel: t('dashboardPreview.levelLabel'),
    streakTitle: t('dashboardPreview.streakTitle'),
    streakLabel: t('dashboardPreview.streakLabel'),
    reviewItem: {
      title: t('dashboardPreview.reviewItem.title'),
      subtitle: t('dashboardPreview.reviewItem.subtitle'),
      tag: dashboardPreviewMeta.tag,
      statusLabel: t('dashboardPreview.reviewItem.statusLabel'),
    },
  };

  const curriculumIntro: SectionIntro = {
    eyebrow: t('curriculum.eyebrow'),
    title: t('curriculum.title'),
    description: t('curriculum.description'),
  };

  const curriculumStages: CurriculumStage[] = curriculumStageItems.map((stage) => ({
    id: stage.id,
    eyebrow: t(`curriculum.stages.${stage.key}.eyebrow`),
    title: t(`curriculum.stages.${stage.key}.title`),
    description: t(`curriculum.stages.${stage.key}.description`),
    iconName: stage.iconName,
    duration: t(`curriculum.stages.${stage.key}.duration`),
    progressPercent: stage.progressPercent,
    modules: stage.moduleKeys.map((moduleKey) =>
      t(`curriculum.stages.${stage.key}.modules.${moduleKey}`),
    ),
    statusLabel: t(`curriculum.stages.${stage.key}.statusLabel`),
  }));

  const activityIntro: SectionIntro = {
    eyebrow: t('activity.eyebrow'),
    title: t('activity.title'),
  };

  const activitySteps: ActivityFlowStep[] = activityFlowItems.map((step) => ({
    id: step.id,
    title: t(`activity.steps.${step.key}.title`),
    description: t(`activity.steps.${step.key}.description`),
    iconName: step.iconName,
  }));

  const finalCta: FinalCtaContent = {
    title: t('finalCta.title'),
    description: t('finalCta.description'),
    primaryCta,
    secondaryCta: {
      label: t('finalCta.secondaryCta'),
      href: '#product',
    },
  };

  const landingFooter: LandingFooterContent = {
    brandName: t('brandName'),
    description: t('footer.description'),
    columns: landingFooterColumnItems.map((column) => ({
      title: t(`footer.columns.${column.key}.title`),
      links: column.linkKeys.map((link) => ({
        label: t(`footer.columns.${column.key}.links.${link.key}`),
        href: link.href,
      })),
    })),
    copyright: t('footer.copyright'),
    socialLinks: landingFooterSocialItems.map((link) => ({
      label: t(`footer.socialLinks.${link.key}`),
      href: link.href,
      iconName: link.iconName,
    })),
  };

  return (
    <main className="landing-shell relative min-h-screen overflow-x-hidden font-sans text-[#131b2e]">
      <div aria-hidden="true" className="landing-crt-overlay" />
      <LandingHeader
        brandName={t('brandName')}
        navLinks={navLinks}
        signInCta={{ label: t('header.signIn'), href: '/login' }}
        primaryCta={landingHero.primaryCta}
        navigationLabel={t('nav.ariaLabel')}
        mobileNavigationLabel={t('nav.mobileAriaLabel')}
        openMenuLabel={t('nav.openMenuLabel')}
      />
      <LandingHero hero={landingHero} dashboardPreview={dashboardPreview} />
      <CurriculumPreview intro={curriculumIntro} stages={curriculumStages} />
      <ActivityFlow
        intro={activityIntro}
        stepLabel={(stepNumber) => t('activity.stepLabel', { stepNumber })}
        steps={activitySteps}
      />
      <FinalCta cta={finalCta} />
      <LandingFooter footer={landingFooter} />
    </main>
  );
}
