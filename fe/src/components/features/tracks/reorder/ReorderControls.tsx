'use client';

import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';

interface ReorderControlsProps {
  selectedIds: string[];
  selectedIds2: string[];
  sortMode: boolean;
  swapMode: boolean;
  onStartSwap: () => void;
  onCancelSwap: () => void;
  onExecuteSwap: () => void;
  onSort: () => void;
  onRevert: () => void;
  onClear: () => void;
}

export default function ReorderControls({
  selectedIds,
  selectedIds2,
  sortMode,
  swapMode,
  onStartSwap,
  onCancelSwap,
  onExecuteSwap,
  onSort,
  onRevert,
  onClear,
}: ReorderControlsProps) {
  const t = useTranslations('ReorderTracksPage');
  const hasSelection = selectedIds.length > 0 || selectedIds2.length > 0;

  return (
    <div className="border-t border-outline-variant bg-surface-container-lowest p-sm flex-shrink-0">
      {!swapMode ? (
        // Normal Mode Bottom Toolbar
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={onStartSwap}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest hover:border-primary hover:bg-primary/5 text-primary text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title={t('swapTitle')}
            >
              <Icon icon="lucide:arrow-up-down" className="w-3.5 h-3.5" />
              <span>{t('swap')}</span>
            </button>

            {sortMode ? (
              <button
                onClick={onRevert}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:border-orange-400 text-orange-600 text-xs font-semibold transition-all cursor-pointer animate-in fade-in"
                title={t('revertTitle')}
              >
                <Icon icon="lucide:history" className="w-3.5 h-3.5" />
                <span>{t('revert')}</span>
              </button>
            ) : (
              <button
                onClick={onSort}
                disabled={selectedIds.length < 2}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest hover:border-primary hover:bg-primary/5 text-primary text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title={t('sortTitle')}
              >
                <Icon icon="lucide:sort-alpha-down" className="w-3.5 h-3.5" />
                <span>{t('sortAZ')}</span>
              </button>
            )}
          </div>

          <button
            onClick={onClear}
            disabled={!hasSelection}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-error/20 hover:border-error hover:bg-error/5 text-error text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title={t('clearTitle')}
          >
            <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
            <span>{t('clear')}</span>
          </button>
        </div>
      ) : (
        // Swap Mode Bottom Toolbar
        <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            onClick={onExecuteSwap}
            disabled={selectedIds.length === 0 || selectedIds2.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-on-primary font-semibold text-xs shadow-sm hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <Icon icon="lucide:check" className="w-3.5 h-3.5" />
            <span>{t('executeSwap')}</span>
          </button>

          <button
            onClick={onCancelSwap}
            className="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low font-semibold text-xs cursor-pointer transition-all"
          >
            <Icon icon="lucide:x" className="w-3.5 h-3.5" />
            <span>{t('cancel')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
