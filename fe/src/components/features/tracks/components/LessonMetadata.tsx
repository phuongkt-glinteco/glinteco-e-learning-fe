'use client';

import type { Metadata } from '@/lib/md-renderer';
import { formatEstimatedTime } from '@/lib/time-utils';
type TuFn = (key: string) => string;

interface LessonMetadataProps {
  title: string;
  estimatedTime?: string;
  bodyMeta?: Metadata | null;
  tu: TuFn;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]',
  intermediate: 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]',
  advanced: 'bg-[#FEE2E2] border-[#FECACA] text-[#991B1B]',
};

export function LessonMetadata({ title, estimatedTime, bodyMeta, tu }: LessonMetadataProps) {
  const badges: { label: string; className: string }[] = [];

  if (estimatedTime && estimatedTime !== '0m') {
    badges.push({
      label: formatEstimatedTime(estimatedTime, tu),
      className: DIFFICULTY_STYLES['beginner'],
    });
  }

  if (bodyMeta?.duration) {
    badges.push({
      label: bodyMeta.duration,
      className: DIFFICULTY_STYLES['beginner'],
    });
  }

  if (bodyMeta?.difficulty) {
    const key = bodyMeta.difficulty.toLowerCase();
    badges.push({
      label: bodyMeta.difficulty,
      className: DIFFICULTY_STYLES[key] || DIFFICULTY_STYLES['beginner'],
    });
  }

  if (bodyMeta?.xp) {
    badges.push({
      label: bodyMeta.xp,
      className: 'bg-secondary-fixed text-secondary border-secondary/20',
    });
  }

  return (
    <header>
      {badges.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {badges.map((b, i) => (
            <span
              key={i}
              className={`px-3 py-1 border rounded-full text-[12px] font-bold uppercase tracking-wider ${b.className}`}
            >
              {b.label}
            </span>
          ))}
        </div>
      )}

      {title && (
        <h1 className="text-xl font-bold text-on-surface leading-snug mb-6 pb-4 border-b border-outline-variant">
          {title}
        </h1>
      )}
    </header>
  );
}
