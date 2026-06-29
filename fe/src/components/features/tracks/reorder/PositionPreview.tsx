'use client';

import { useRef, useEffect } from 'react';
import type { TrackSummaryDto } from '@/services/api-client';
import { useTranslations } from 'next-intl';

interface PositionPreviewProps {
  previewOrder: TrackSummaryDto[];
  selectedIds: string[];
}

export default function PositionPreview({ previewOrder, selectedIds }: PositionPreviewProps) {
  const t = useTranslations('ReorderTracksPage');
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const selSet = new Set(selectedIds);
  const blockStart = previewOrder.findIndex((t) => selSet.has(t.id));

  useEffect(() => {
    if (containerRef.current && activeItemRef.current) {
      const container = containerRef.current;
      const activeItem = activeItemRef.current;
      const targetScrollTop =
        activeItem.offsetTop - container.clientHeight / 2 + activeItem.clientHeight / 2;
      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      });
    }
  }, [previewOrder, selectedIds]);

  if (blockStart < 0 || selectedIds.length === 0) {
    return (
      <div className="bg-surface-container-lowest flex-1 flex flex-col">
        <div className="px-lg py-sm border-b border-outline-variant/30 flex items-center justify-between">
          <h2 className="font-label-md text-on-surface-variant uppercase tracking-[0.1em] text-[11px] font-bold">
            {t('positionPreview')}
          </h2>
        </div>
        <div className="flex items-center justify-center flex-1 text-body-sm text-on-surface-variant/40 min-h-[200px]">
          {t('noItemsSelected')}
        </div>
      </div>
    );
  }

  const blockEnd = blockStart + selectedIds.length - 1;

  return (
    <div className="bg-surface-container-lowest flex-1 flex flex-col overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `
      }} />

      <div className="px-lg py-sm border-b border-outline-variant/30 flex items-center justify-between flex-shrink-0">
        <h2 className="font-label-md text-on-surface-variant uppercase tracking-[0.1em] text-[11px] font-bold">
          {t('positionPreview')}
        </h2>
        <span className="text-[10px] text-on-surface-variant/40 font-mono">
          {t('posPreviewRange', { start: blockStart + 1, end: blockEnd + 1 })}
        </span>
      </div>

      <div
        ref={containerRef}
        className="no-scrollbar overflow-y-auto relative flex-1 w-full flex flex-col items-center"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-3 py-lg w-full">
          {previewOrder.map((track, idx) => {
            const isInBlock = idx >= blockStart && idx <= blockEnd;
            const isFirst = idx === blockStart;
            const distance = isInBlock
              ? 0
              : Math.min(Math.abs(idx - blockStart), Math.abs(idx - blockEnd));
            const opacity = isFirst ? 1 : isInBlock ? 0.85 : Math.max(0.12, 1 - distance * 0.25);
            const scale = isFirst ? 1 : isInBlock ? 0.95 : Math.max(0.82, 1 - distance * 0.06);

            return (
              <div
                key={track.id}
                ref={isFirst ? activeItemRef : undefined}
                style={{ opacity, transform: `scale(${scale})` }}
                className="transition-all duration-300 flex-shrink-0"
              >
                {isFirst ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md" />
                    <div className="relative z-10 px-lg py-md bg-primary text-on-primary border-2 border-primary rounded-xl shadow-lg flex flex-col items-center min-w-[200px]">
                      <span className="text-[9px] font-black tracking-widest uppercase text-on-primary/70">
                        {t('blockStart')}
                      </span>
                      <span className="text-body-md font-bold text-center max-w-[180px] truncate">{track.title}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="px-md py-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-sm text-on-surface-variant truncate max-w-[220px] text-center"
                    style={{
                      borderColor: isInBlock ? 'var(--color-primary, #6366f1)' : undefined,
                      backgroundColor: isInBlock ? 'var(--color-primary-container, #eef2ff)' : undefined,
                    }}
                  >
                    {track.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
