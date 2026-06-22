'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const t = useTranslations('LogoutPage');
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function performLogout() {
      await logout();
      router.push('/login');
    }
    performLogout();
  }, [logout, router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-gutter">
      <div className="w-full max-w-[440px] flex flex-col items-center gap-xl fade-in">
        <div className="flex items-center gap-sm mb-base">
          <span className="material-symbols-outlined text-primary text-[32px]">
            rocket_launch
          </span>
          <h1 className="font-headline-md text-headline-md font-black text-primary tracking-tight">
            RAMP UP
          </h1>
        </div>
        <section className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-xl card-shadow flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-lg">
            <span className="material-symbols-outlined text-[48px] text-primary">
              logout
            </span>
          </div>
          <div className="space-y-sm mb-xl">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {t('signingOut')}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[300px]">
              {t('description')}
            </p>
          </div>
          <div className="flex flex-col items-center gap-md">
            <div className="spinner" />
            <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
              {t('processing')}
            </p>
          </div>
        </section>
        <footer className="flex flex-col items-center gap-xs">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {t('redirecting')}
          </p>
        </footer>
      </div>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-40">
        <div className="absolute -top-[10%] -right-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px]" />
        <div className="absolute -bottom-[10%] -left-[5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px]" />
      </div>
    </main>
  );
}
