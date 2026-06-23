'use client';

import { useTranslations } from 'next-intl';

interface PreviewFooterProps {
  onBackToEdit: () => void;
  onSaveTrack?: () => void;
  isSaveDisabled?: boolean;
}

export function PreviewFooter({
  onBackToEdit,
  onSaveTrack,
  isSaveDisabled = true,
}: PreviewFooterProps) {
  const t = useTranslations('TrackPreview');

  return (
    <footer className="fixed bottom-0 left-0 md:left-[256px] right-0 bg-surface-container-lowest border-t border-outline-variant h-20 px-gutter flex items-center justify-between z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button
        onClick={onBackToEdit}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-primary text-primary label-md hover:bg-primary/5 transition-all group cursor-pointer"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-[20px]">
          arrow_back
        </span>
        {t('backToEdit')}
      </button>

      <div className="flex items-center gap-4">
        <span className="text-body-sm text-outline-variant hidden sm:block italic">
          {t('draftSaved')}
        </span>
        <button
          onClick={onSaveTrack}
          disabled={isSaveDisabled}
          className={`px-8 py-2.5 rounded-lg label-md transition-all ${
            isSaveDisabled
              ? 'bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed'
              : 'bg-primary text-on-primary hover:opacity-95 shadow-sm active:scale-95 cursor-pointer'
          }`}
        >
          {t('saveTrack')}
        </button>
      </div>
    </footer>
  );
}
