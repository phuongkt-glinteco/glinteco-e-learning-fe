'use client';

import { useTranslations } from 'next-intl';

export default function LoadingPage() {
  const t = useTranslations('LoadingPage');

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background p-gutter min-h-[50vh]">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-surface-container-highest border-t-primary loading-spinner" />
          <div className="absolute w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl">
              rocket_launch
            </span>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-headline-sm font-bold text-on-surface">
            {t('title')}
          </h2>
          <p className="text-body-md text-on-surface-variant animate-pulse">
            {t('description')}
          </p>
        </div>
        <div className="flex gap-2">
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: '0.2s' }}
          />
        </div>
      </div>
    </div>
  );
}
