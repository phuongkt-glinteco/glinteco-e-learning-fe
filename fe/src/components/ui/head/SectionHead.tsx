import type { ReactNode } from 'react';

interface SectionHeadProps {
  kicker?: string;
  title: string;
  children?: ReactNode;
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-['Inter'] text-[30px] font-semibold leading-9 tracking-[-0.02em] text-on-surface">
      {children}
    </h1>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="headline-md text-on-surface">
      {children}
    </h2>
  );
}

export function SectionHeadingBig({ children }: { children: ReactNode }) {
  return (
    <h3 className="headline-sm text-on-surface">
      {children}
    </h3>
  );
}

export function SectionHeadingSmall({ children }: { children: ReactNode }) {
  return (
    <h4 className="font-['Inter'] text-[16px] font-semibold leading-6 text-on-surface">
      {children}
    </h4>
  );
}

export default function SectionHead({ kicker, title, children }: SectionHeadProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4 flex-wrap w-full">
      <div>
        {kicker && (
          <div className="label-sm text-primary uppercase tracking-wider mb-1">
            {kicker}
          </div>
        )}
        <h2 className="headline-md text-on-surface">{title}</h2>
      </div>
      {children && (
        <div className="flex gap-2.5 items-center flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
