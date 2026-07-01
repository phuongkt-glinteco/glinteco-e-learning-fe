import Link from 'next/link';
import type { FinalCtaContent } from '../types';

type FinalCtaProps = {
  cta: FinalCtaContent;
};

export function FinalCta({ cta }: FinalCtaProps) {
  return (
    <section id="mentors" className="border-y border-[#dbe3ef] bg-[#eef0ff] px-4 py-20 md:px-10">
      <div className="mx-auto max-w-[760px] text-center">
        <h2 className="text-[16px] font-medium leading-6 tracking-[0] text-[#0b1c30]">
          {cta.title}
        </h2>
        <p className="mx-auto mt-5 max-w-[620px] text-[14px] leading-6 tracking-[0] text-[#334155]">
          {cta.description}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={cta.primaryCta.href}
            className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[#2563eb] px-7 py-3 text-[14px] font-semibold leading-5 text-white shadow-sm transition-colors hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
          >
            {cta.primaryCta.label}
          </Link>
          <Link
            href={cta.secondaryCta.href}
            className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#dbe3ef] bg-white px-7 py-3 text-[14px] font-medium leading-5 text-[#0b1c30] transition-colors hover:border-[#bfdbfe] hover:text-[#2563eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
          >
            {cta.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
