'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export interface NavItem {
  label: string;
  translationKey: string;
  icon: string;
  href: string;
}

interface NavMenuProps {
  items: NavItem[];
  variant?: 'desktop' | 'mobile';
  onItemClick?: () => void;
  className?: string;
}

export default function NavMenu({ items, variant = 'desktop', onItemClick, className, }: NavMenuProps) {
  const pathname = usePathname();
  const t = useTranslations('AppShell');

  const isDesktop = variant === 'desktop';

  return (
    <nav className={`flex flex-col gap-xs w-full ${className}`}>
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const translatedLabel = t(item.translationKey) || item.label;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center gap-3 rounded-lg transition-all font-semibold ${
              isDesktop
                ? `px-4 py-2 text-sm ${
                    active
                      ? 'bg-primary/10 text-primary border-r-4 border-primary'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`
                : `p-md text-base ${
                    active
                      ? 'bg-primary-container/10 text-primary'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className={isDesktop ? '' : 'font-label-md'}>{translatedLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
