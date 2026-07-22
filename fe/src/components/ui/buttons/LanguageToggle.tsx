'use client';

import React from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { Button } from '@/components/ui/default/button';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  size?: 'sm' | 'md';
  className?: string;
}

export default function LanguageToggle({ size = 'sm', className = '' }: LanguageToggleProps) {
  const { locale, changeLanguage } = useLanguage();

  const isSmall = size === 'sm';

  return (
    <div
      className={cn(
        "flex items-center select-none font-semibold border border-outline-variant shadow-sm",
        isSmall
          ? 'bg-surface-container-low rounded-full p-0.5 text-xs'
          : 'bg-surface/85 backdrop-blur-md rounded-lg p-0.5 text-[13px]',
        className
      )}
    >
      <Button
        variant="ghost"
        onClick={() => changeLanguage('vi')}
        className={cn(
          "transition-all font-semibold h-auto",
          isSmall ? 'px-2.5 py-1 rounded-full' : 'px-3 py-1 rounded-md',
          locale === 'vi'
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-transparent'
        )}
      >
        VI
      </Button>
      <Button
        variant="ghost"
        onClick={() => changeLanguage('en')}
        className={cn(
          "transition-all font-semibold h-auto",
          isSmall ? 'px-2.5 py-1 rounded-full' : 'px-3 py-1 rounded-md',
          locale === 'en'
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-transparent'
        )}
      >
        EN
      </Button>
    </div>
  );
}
