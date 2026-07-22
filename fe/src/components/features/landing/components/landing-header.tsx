import Link from 'next/link';
import type { LandingCta, LandingNavLink } from '../types';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';

type LandingHeaderProps = {
  brandName: string;
  navLinks: LandingNavLink[];
  signInCta: LandingCta;
  primaryCta: LandingCta;
  navigationLabel: string;
  mobileNavigationLabel: string;
  openMenuLabel: string;
};

export function LandingHeader({
  brandName,
  navLinks,
  signInCta,
  primaryCta,
  navigationLabel,
  mobileNavigationLabel,
  openMenuLabel,
}: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-[#e2e8f0] bg-white">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[#0b1c30]">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[26px] leading-none text-[#2563eb]"
          >
            rocket_launch
          </span>
          <span className="text-[22px] font-bold leading-7 tracking-[0]">{brandName}</span>
        </Link>

        <nav aria-label={navigationLabel} className="hidden h-full min-w-0 items-center gap-5 lg:flex xl:gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={[
                'flex h-full items-center whitespace-nowrap border-b-2 px-0.5 text-[14px] font-medium leading-5 transition-colors',
                link.isActive
                  ? 'border-[#2563eb] text-[#2563eb]'
                  : 'border-transparent text-[#334155] hover:text-[#0b1c30]',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Link
            href={signInCta.href}
            className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-[8px] px-2 text-[14px] font-medium leading-5 text-[#0b1c30] transition-colors hover:text-[#2563eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
          >
            {signInCta.label}
          </Link>
          <Link
            href={primaryCta.href}
            className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-[8px] bg-[#2563eb] px-4 py-2 text-[14px] font-semibold leading-5 text-white shadow-sm transition-colors hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
          >
            {primaryCta.label}
          </Link>
        </div>

        <details className="group relative lg:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-[8px] text-[#0b1c30] transition-colors hover:bg-[#f8fafc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="material-symbols-outlined text-[26px] leading-none">
              menu
            </span>
            <span className="sr-only">{openMenuLabel}</span>
          </summary>

          <nav
            aria-label={mobileNavigationLabel}
            className="absolute right-0 top-12 w-[260px] rounded-[12px] border border-[#dbe3ef] bg-white p-3 shadow-[0_20px_25px_-12px_rgba(15,23,42,0.22)]"
          >
            <div className="grid gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={[
                    'rounded-[8px] px-3 py-2 text-[14px] font-medium leading-5 transition-colors',
                    link.isActive
                      ? 'bg-[#eff6ff] text-[#2563eb]'
                      : 'text-[#334155] hover:bg-[#f8fafc] hover:text-[#0b1c30]',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-3 grid gap-2 border-t border-[#e2e8f0] pt-3">
              <LanguageSwitcher className="justify-center" />
              <Link
                href={signInCta.href}
                className="inline-flex min-h-10 items-center justify-center rounded-[8px] border border-[#dbe3ef] bg-white px-4 py-2 text-[14px] font-medium leading-5 text-[#0b1c30] transition-colors hover:border-[#bfdbfe] hover:text-[#2563eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
              >
                {signInCta.label}
              </Link>
              <Link
                href={primaryCta.href}
                className="inline-flex min-h-10 items-center justify-center rounded-[8px] bg-[#2563eb] px-4 py-2 text-[14px] font-semibold leading-5 text-white shadow-sm transition-colors hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
              >
                {primaryCta.label}
              </Link>
            </div>
          </nav>
        </details>

      </div>
    </header>
  );
}
