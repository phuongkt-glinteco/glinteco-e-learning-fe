'use client';

import { useRef, useCallback, useState } from 'react';
import { Icon } from '@iconify/react';
import type { TrackSummaryDto } from '@/services/api-client';
import { useTranslations } from 'next-intl';

interface TrackBrowserProps {
  allTracks: TrackSummaryDto[];
  selectedIds: string[];
  selectedIds2: string[];
  swapMode: boolean;
  onToggle: (id: string) => void;
  onRangeSelect: (id: string) => void;
  onCtrlToggle: (id: string) => void;
  onReorder: (ordered: TrackSummaryDto[]) => void;
}

export default function TrackBrowser({
  allTracks,
  selectedIds,
  selectedIds2,
  swapMode,
  onToggle,
  onRangeSelect,
  onCtrlToggle,
  onReorder,
}: TrackBrowserProps) {
  const t = useTranslations('ReorderTracksPage');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(true);
  const dragRef = useRef<string | null>(null);
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);

  const filtered = allTracks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (e.shiftKey) {
        onRangeSelect(id);
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        onCtrlToggle(id);
        return;
      }
      onToggle(id);
    },
    [onToggle, onRangeSelect, onCtrlToggle],
  );

  function handleDragStart(e: React.DragEvent, id: string) {
    dragRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).classList.add('opacity-40');
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (dragRef.current !== null && dragRef.current !== id) {
      setDraggedOverId(id);
    }
  }

  function handleDragLeave() {
    setDraggedOverId(null);
  }

  function handleDrop(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDraggedOverId(null);
    if (dragRef.current === null || dragRef.current === id) return;

    const from = dragRef.current;
    const fromIdx = allTracks.findIndex((t) => t.id === from);
    const toIdx = allTracks.findIndex((t) => t.id === id);
    if (fromIdx < 0 || toIdx < 0) return;

    const next = [...allTracks];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onReorder(next);
  }

  function handleDragEnd(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).classList.remove('opacity-40');
    dragRef.current = null;
    setDraggedOverId(null);
  }

  return (
    <div
      className={`flex flex-col border-r border-outline-variant bg-surface-container-lowest transition-all duration-300 flex-shrink-0 ${
        expanded ? 'w-[360px]' : 'w-12'
      }`}
    >
      <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant bg-surface-container-low flex-shrink-0">
        {expanded ? (
          <>
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-[0.1em] text-[11px] font-bold">
              {t('tracks')}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-label-sm text-on-surface-variant/60">{t('totalCount', { count: allTracks.length })}</span>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 rounded hover:bg-surface-container text-on-surface-variant cursor-pointer transition-colors"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            className="p-2 rounded hover:bg-surface-container text-on-surface-variant cursor-pointer transition-colors mx-auto"
          >
            <Icon icon="lucide:chevron-right" className="w-4 h-4" />
          </button>
        )}
      </div>

      {expanded && (
        <>
          <div className="px-md py-sm border-b border-outline-variant/30 flex-shrink-0">
            <div className="relative">
              <Icon
                icon="lucide:search"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-outline-variant/50 bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-xl gap-md">
                <Icon icon="lucide:search-x" className="text-3xl text-on-surface-variant/30" />
                <p className="text-body-sm text-on-surface-variant">{t('noResults')}</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {filtered.map((track) => {
                  const isSel1 = selectedIds.includes(track.id);
                  const isSel2 = selectedIds2.includes(track.id);
                  const isDraggedOver = draggedOverId === track.id;

                  let itemClasses = 'border-l-4 border-l-transparent hover:bg-surface-container-low';
                  let textClasses = 'text-on-surface';
                  let badge = null;

                  if (isSel1) {
                    itemClasses = 'bg-primary/5 border-l-4 border-l-primary';
                    textClasses = 'font-semibold text-primary';
                    badge = (
                      <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-2">
                        <span className="text-[10px] font-black text-on-primary">1</span>
                      </span>
                    );
                  } else if (isSel2) {
                    itemClasses = 'bg-teal-50 border-l-4 border-l-teal-600';
                    textClasses = 'font-semibold text-teal-700';
                    badge = (
                      <span className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 ml-2">
                        <span className="text-[10px] font-black text-on-primary">2</span>
                      </span>
                    );
                  }

                  if (isDraggedOver) {
                    itemClasses += ' bg-primary/10 border-t border-b border-primary/50';
                  }

                  return (
                    <div
                      key={track.id}
                      draggable={!swapMode}
                      onDragStart={(e) => handleDragStart(e, track.id)}
                      onDragOver={(e) => handleDragOver(e, track.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, track.id)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => handleClick(e, track.id)}
                      className={`flex items-center gap-md px-md py-[10px] border-b border-outline-variant/30 text-left transition-all duration-150 cursor-pointer select-none ${itemClasses}`}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            track.status === 'completed'
                              ? '#22c55e'
                              : track.status === 'in_progress'
                              ? '#f59e0b'
                              : '#94a3b8',
                        }}
                      />
                      <span className={`flex-1 text-body-sm truncate ${textClasses}`}>{track.title}</span>
                      {!swapMode && (
                        <span className="text-[11px] text-on-surface-variant/50 flex-shrink-0 tabular-nums">
                          {t('lessonsCount', { count: track.lessonCount })}
                        </span>
                      )}
                      {badge}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
