'use client';

import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/ui/buttons';

interface FallbackUiSimpleProps {
  mainContentLabel: string;
  guidLabel?: string;
}

export function FallbackUiSimple({ mainContentLabel, guidLabel }: FallbackUiSimpleProps) {
  const t = useTranslations('fall back');

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-full max-w-xl bg-surface border border-outline-variant rounded-lg p-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-stack-md">
            <span className="material-symbols-outlined text-[32px] text-on-surface">info</span>
          </div>
          <p className="font-body-base text-on-surface-variant leading-relaxed mb-stack-sm">
            {mainContentLabel}
          </p>
          {guidLabel && (
            <p className="font-body-sm text-on-surface-variant mb-stack-md">
              {guidLabel}
            </p>
          )}
          <AppButton onClick={() => window.location.reload()}>
            {t('retry')}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
