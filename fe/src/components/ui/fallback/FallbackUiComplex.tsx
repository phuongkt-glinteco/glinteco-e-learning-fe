'use client';

import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/ui/buttons';

interface FallbackUiComplexProps {
  title: string;
  content: string;
  timestamp?: string;
  retryLabel?: string;
  redirectLabel?: string;
  redirectHref?: string;
}

export function FallbackUiComplex({
  title,
  content,
  timestamp,
  redirectLabel,
  redirectHref,
}: FallbackUiComplexProps) {
  const t = useTranslations('fall back');

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-full max-w-xl bg-surface border border-outline-variant rounded-lg p-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-stack-md">
            <span className="material-symbols-outlined text-[32px] text-on-surface">info</span>
          </div>
          <h3 className="font-h2 text-h2 text-on-surface mb-stack-sm">{title}</h3>
          {timestamp && (
            <div className="flex items-center gap-3 mb-stack-md">
              <span className="font-label-sm px-2 py-1 bg-surface-container-highest text-on-surface-variant rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {timestamp}
              </span>
            </div>
          )}
          <div className="w-full h-px bg-outline-variant mb-stack-md" />
          <p className="font-body-base text-on-surface-variant leading-relaxed mb-stack-lg px-4">
            {content}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <AppButton onClick={() => window.location.reload()}>
              {t('retry')}
            </AppButton>
            {redirectLabel && redirectHref && (
              <AppButton
                variant="outline"
                onClick={() => window.location.href = redirectHref}
              >
                {redirectLabel}
              </AppButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
