'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import LanguageToggle from '@/components/ui/buttons/LanguageToggle';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const t = useTranslations('LoginPage'); // or use a generic 'Auth' translation namespace

  return (
    <div className="min-h-screen bg-background text-on-surface flex overflow-hidden w-full font-sans relative">
      <LanguageToggle size="md" className="hidden md:block absolute top-6 right-6 z-20 border-outline" />

      <div className="flex w-full h-full min-h-screen">
        {/* Left: Branding Panel */}
        <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gradient-to-br from-primary to-secondary p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, #ffffff 0%, transparent 50%)' }}></div>
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-secondary opacity-20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="RAMP UP Logo"
              width={40}
              height={40}
              className="rounded-lg shadow-lg border border-white/10"
              priority
            />
            <h1 className="text-[32px] font-bold text-white tracking-tight">RAMP UP</h1>
          </div>
          <div className="relative z-10 max-w-md">
            <h2 className="text-[48px] font-extrabold text-white mb-4 leading-tight">
              {t('brandSubtitle')}
            </h2>
            <p className="text-[16px] text-white/80 max-w-md">
              {t('brandTagline')}
            </p>
          </div>
          <div className="relative z-10">
            <p className="text-[12px] text-white/60">
              {t('trustedBy')}
            </p>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface-container-low">
          {children}
        </div>
      </div>
    </div>
  );
}
