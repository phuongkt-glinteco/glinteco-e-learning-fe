'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface AppLogoProps {
  className?: string;
}

export default function AppLogo({ className = '' }: AppLogoProps) {
  const t = useTranslations('AppShell');
  return (
    <div className={`flex items-center justify-start gap-sm ${className}`}>
      <div className="w-10 h-10 bg-primary rounded flex items-center justify-center shrink-0 text-on-primary">
        {/* <span className="material-symbols-outlined">rocket_launch</span> */}
        <Image
          src="/logo.png"
          alt="RAMP UP Logo"
          width={40}
          height={40}
        />
      </div>
      <div>
        <h1 className="text-xl font-black text-secondary">RAMP UP</h1>
        <p className="text-xs font-semibold text-on-surface-variant font-label-sm">{t('subLogoTitle')}</p>
      </div>
    </div>
  );
}
