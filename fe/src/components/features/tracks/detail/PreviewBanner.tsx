'use client';

import { useTranslations } from 'next-intl';

interface PreviewBannerProps {
  message?: string;
}

export function PreviewBanner({ message }: PreviewBannerProps) {
  const t = useTranslations('TrackPreview');
  const bannerMessage = message || t('previewMessage');

  return (
    <div className="bg-primary-container text-on-primary-container py-2.5 px-6 flex items-center justify-center gap-2 sticky top-16 z-30 shadow-sm border-b border-primary/20">
      <span className="material-symbols-outlined text-[18px]">visibility</span>
      <span className="font-label-md text-label-md">
        {bannerMessage}
      </span>
    </div>
  );
}
