import Link from 'next/link';
import type { LandingFooterContent } from '../types';

type LandingFooterProps = {
  footer: LandingFooterContent;
};

export function LandingFooter({ footer }: LandingFooterProps) {
  return (
    <footer className="bg-white px-4 py-14 md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
          <div className="max-w-[300px]">
            <Link href="/" className="flex items-center gap-2 text-[#0b1c30]">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[26px] leading-none text-[#2563eb]"
              >
                rocket_launch
              </span>
              <span className="text-[22px] font-bold leading-7 tracking-[0]">
                {footer.brandName}
              </span>
            </Link>

            <p className="mt-5 text-[14px] leading-6 tracking-[0] text-[#334155]">
              {footer.description}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-[14px] font-medium leading-5 tracking-[0] text-[#0b1c30]">
                  {column.title}
                </h2>

                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] leading-5 tracking-[0] text-[#334155] transition-colors hover:text-[#2563eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-[#dbe3ef] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] leading-5 tracking-[0] text-[#334155]">{footer.copyright}</p>

          <div className="flex items-center gap-4">
            {footer.socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className="text-[#0b1c30] transition-colors hover:text-[#2563eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[22px]">
                  {link.iconName}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
