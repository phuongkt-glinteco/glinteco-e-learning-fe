'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/default/card';
import LanguageToggle from '@/components/ui/buttons/LanguageToggle';

export default function LogoutPage() {
  const t = useTranslations('LogoutPage');
  const { logout } = useAuth();

  useEffect(() => {
    async function performLogout() {
      await logout();
    }
    performLogout();
  }, [logout]);

  return (
    <Card className="w-full max-w-[440px] border-outline-variant shadow-sm rounded-xl relative overflow-hidden">
      <LanguageToggle size="sm" className="lg:hidden absolute top-4 right-4 z-20 border-outline-variant/60 shadow-xs" />
      <CardContent className="p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[40px] text-primary">
            logout
          </span>
        </div>
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-on-surface">
            {t('signingOut')}
          </h2>
          <p className="text-sm text-on-surface-variant max-w-[300px]">
            {t('description')}
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="spinner border-primary border-t-transparent" />
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">
            {t('processing')}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            {t('redirecting')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
