'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/default/button';

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
      <Button
        variant="outline"
        onClick={onBackToEdit}
        className="gap-2 text-primary border-primary hover:bg-primary/5 group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-[20px]">
          arrow_back
        </span>
        {t('backToEdit')}
      </Button>

      <div className="flex items-center gap-4">
        <span className="text-[14px] text-outline-variant hidden sm:block italic">
          {t('draftSaved')}
        </span>
        <Button
          onClick={onSaveTrack}
          disabled={isSaveDisabled}
          className="px-8"
        >
          {t('saveTrack')}
        </Button>
      </div>
    </footer>
  );
}
