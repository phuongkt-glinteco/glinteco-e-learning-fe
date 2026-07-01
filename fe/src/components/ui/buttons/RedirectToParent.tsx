'use client';

import Link from 'next/link';

interface RedirectToParentProps {
  href: string;
  label: string;
  className?: string;
}

export function RedirectToParent({ href, label, className = '' }: RedirectToParentProps) {
  const truncatedLabel = label.length > 25 ? `${label.substring(0, 25)}...` : label;

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 label-sm text-on-surface hover:bg-surface-container-low transition-colors w-fit ${className}`}
    >
      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
      <span>{truncatedLabel}</span>
    </Link>
  );
}
