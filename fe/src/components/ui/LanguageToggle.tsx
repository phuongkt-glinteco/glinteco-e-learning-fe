'use client';

import React from 'react';
import { useLanguage } from '@/providers/LanguageProvider';

interface LanguageToggleProps {
  size?: 'sm' | 'md';
  className?: string;
}

export default function LanguageToggle({ size = 'sm', className = '' }: LanguageToggleProps) {
  const { locale, changeLanguage } = useLanguage();

  const isSmall = size === 'sm';

  return (
    <div
      className={`flex items-center select-none font-semibold border border-outline-variant shadow-sm ${
        isSmall
          ? 'bg-surface-container-low rounded-full p-0.5 text-xs'
          : 'bg-surface/85 backdrop-blur-md rounded-lg p-0.5 text-[13px]'
      } ${className}`}
    >
      <button
        onClick={() => changeLanguage('vi')}
        className={`transition-all cursor-pointer font-semibold ${
          isSmall ? 'px-2.5 py-1 rounded-full' : 'px-3 py-1 rounded-md'
        } ${
          locale === 'vi'
            ? 'bg-primary text-white shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        VI
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`transition-all cursor-pointer font-semibold ${
          isSmall ? 'px-2.5 py-1 rounded-full' : 'px-3 py-1 rounded-md'
        } ${
          locale === 'en'
            ? 'bg-primary text-white shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        EN
      </button>
    </div>
  );
}
