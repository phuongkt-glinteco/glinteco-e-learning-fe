import type { ReactNode } from 'react';

interface SectionHeadProps {
  kicker?: string;
  title: string;
  children?: ReactNode;
}

export default function SectionHead({ kicker, title, children }: SectionHeadProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4 flex-wrap w-full">
      <div>
        {kicker && (
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            {kicker}
          </div>
        )}
        <h2 className="text-xl font-bold text-on-surface">{title}</h2>
      </div>
      {children && (
        <div className="flex gap-2.5 items-center flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
