import Link from 'next/link';
import type { DashboardPreview, LandingHeroContent } from '../types';
import { HeroDashboardMockup } from './hero-dashboard-mockup';

type LandingHeroProps = {
  hero: LandingHeroContent;
  dashboardPreview: DashboardPreview;
};

export function LandingHero({ hero, dashboardPreview }: LandingHeroProps) {
  return (
    <section
      id="product"
      className="landing-hero-section mx-auto grid min-h-[calc(100svh-64px)] w-full max-w-[1280px] min-w-0 items-center gap-10 overflow-hidden px-4 py-12 md:px-10 md:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-24"
    >
      <div className="landing-hero-copy min-w-0">
        <h1 className="landing-balanced-title max-w-full break-words text-[30px] font-bold leading-[38px] tracking-[0] text-[#131b2e] md:text-[44px] md:leading-[52px] xl:text-[48px] xl:leading-[56px]">
          {hero.headline}
        </h1>
        <p className="landing-pretty-copy mt-5 max-w-[560px] break-words text-[16px] leading-7 tracking-[0] text-[#434655] md:text-[18px]">
          {hero.description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={hero.primaryCta.href}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#2563eb] px-6 py-3 text-[14px] font-semibold leading-5 text-white shadow-sm transition-colors hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] sm:w-auto sm:min-w-[166px]"
          >
            {hero.primaryCta.label}
            <span aria-hidden="true" className="material-symbols-outlined text-[18px] leading-none">
              arrow_forward
            </span>
          </Link>
          {hero.secondaryCta ? (
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[8px] border border-[#dbe3ef] bg-white px-6 py-3 text-[14px] font-medium leading-5 text-[#0b1c30] transition-colors hover:border-[#bfdbfe] hover:text-[#2563eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] sm:w-auto sm:min-w-[114px]"
            >
              {hero.secondaryCta.label}
            </Link>
          ) : null}
        </div>
      </div>

      <HeroDashboardMockup preview={dashboardPreview} />
    </section>
  );
}
