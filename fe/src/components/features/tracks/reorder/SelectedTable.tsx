'use client';

import { useRef, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import type { TrackSummaryDto } from '@/services/api-client';
import { useTranslations } from 'next-intl';

interface SelectedTableProps {
  swapMode: boolean;
  selectedIds1: string[];
  selectedIds2: string[];
  focusedGroup: 1 | 2;
  allTracks: TrackSummaryDto[];
  onFocusGroup: (group: 1 | 2) => void;
  onRemove1: (id: string) => void;
  onRemove2: (id: string) => void;
  onReorder1: (ids: string[]) => void;
  onReorder2: (ids: string[]) => void;
  onClear1: () => void;
  onClear2: () => void;
}

export default function SelectedTable({
  swapMode,
  selectedIds1,
  selectedIds2,
  focusedGroup,
  allTracks,
  onFocusGroup,
  onRemove1,
  onRemove2,
  onReorder1,
  onReorder2,
  onClear1,
  onClear2,
}: SelectedTableProps) {
  const t = useTranslations('ReorderTracksPage');
  const dragRef = useRef<string | null>(null);
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);

  const trackMap = useMemo(() => {
    const m = new Map<string, TrackSummaryDto>();
    for (const t of allTracks) m.set(t.id, t);
    return m;
  }, [allTracks]);

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

    if (selectedIds1.includes(from) && selectedIds1.includes(id)) {
      const ordered = [...selectedIds1];
      const fromIdx = ordered.indexOf(from);
      const toIdx = ordered.indexOf(id);
      if (fromIdx >= 0 && toIdx >= 0) {
        ordered.splice(fromIdx, 1);
        ordered.splice(toIdx, 0, from);
        onReorder1(ordered);
      }
    } else if (selectedIds2.includes(from) && selectedIds2.includes(id)) {
      const ordered = [...selectedIds2];
      const fromIdx = ordered.indexOf(from);
      const toIdx = ordered.indexOf(id);
      if (fromIdx >= 0 && toIdx >= 0) {
        ordered.splice(fromIdx, 1);
        ordered.splice(toIdx, 0, from);
        onReorder2(ordered);
      }
    }
  }

  function handleDragEnd(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).classList.remove('opacity-40');
    dragRef.current = null;
    setDraggedOverId(null);
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-container-low overflow-hidden border-r border-outline-variant">
      {!swapMode ? (
        // Normal Mode - Single selection list
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-md">
              <h2 className="font-label-md text-on-surface-variant uppercase tracking-[0.1em] text-[11px] font-bold">{t('selected')}</h2>
              <span className="text-[10px] text-on-surface-variant/60 font-mono">{t('selectedCount', { count: selectedIds1.length })}</span>
            </div>
            {selectedIds1.length > 0 && (
              <button
                onClick={onClear1}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-outline-variant/50 hover:border-error/30 hover:text-error text-label-sm text-on-surface-variant transition-all cursor-pointer"
              >
                <Icon icon="lucide:eraser" className="w-3.5 h-3.5" />
                {t('clearSelection')}
              </button>
            )}
          </div>

          <div
            className="flex-1 overflow-y-auto px-lg py-md space-y-2"
          >
            {selectedIds1.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-md py-2xl">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-outline-variant/30 flex items-center justify-center">
                  <Icon icon="lucide:list-plus" className="text-3xl text-on-surface-variant/20" />
                </div>
                <p className="text-body-sm text-on-surface-variant">{t('emptyResultListHint')}</p>
              </div>
            ) : (
              selectedIds1.map((id, index) => {
                const track = trackMap.get(id);
                if (!track) return null;
                const isDraggedOver = draggedOverId === track.id;
                return (
                  <div
                    key={track.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, track.id)}
                    onDragOver={(e) => handleDragOver(e, track.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, track.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 px-md py-2.5 bg-surface-container-lowest border rounded-lg hover:border-primary/40 transition-all shadow-sm cursor-grab active:cursor-grabbing select-none animate-in fade-in duration-150 ${
                      isDraggedOver
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20 scale-[0.98]'
                        : 'border-outline-variant/50'
                    }`}
                  >
                    <Icon icon="lucide:grip-vertical" className="w-4 h-4 text-on-surface-variant/30 flex-shrink-0" />
                    <span className="w-6 h-6 rounded-md bg-surface-container text-[11px] font-bold text-on-surface-variant flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{
                      backgroundColor: track.status === 'completed' ? '#22c55e' :
                        track.status === 'in_progress' ? '#f59e0b' : '#94a3b8',
                    }} />
                    <span className="flex-1 font-medium text-on-surface text-body-sm truncate">{track.title}</span>
                    <button
                      onClick={() => onRemove1(track.id)}
                      className="p-1 rounded hover:bg-error/10 text-on-surface-variant hover:text-error cursor-pointer transition-colors flex-shrink-0"
                    >
                      <Icon icon="lucide:x" className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        // Swap Mode - Two selection lists stacked
        <div className="flex flex-col flex-1 overflow-hidden h-full">
          {/* Box 1: Selection Group 1 */}
          <div
            onClick={() => onFocusGroup(1)}
            className={`flex flex-col h-[50%] border-b border-outline-variant transition-all duration-200 cursor-pointer ${
              focusedGroup === 1
                ? 'bg-surface-container-lowest border-l-4 border-l-primary shadow-sm'
                : 'bg-surface-container-low hover:bg-surface-container border-l-4 border-l-transparent'
            }`}
          >
            <div className="px-lg py-sm border-b border-outline-variant/20 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-md">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  focusedGroup === 1 ? 'bg-primary text-on-primary' : 'bg-outline text-on-surface-variant'
                }`}>
                  1
                </span>
                <h3 className={`font-label-md text-[11px] uppercase tracking-[0.1em] font-bold ${
                  focusedGroup === 1 ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {t('selectionGroup1')}
                </h3>
                <span className="text-[10px] text-on-surface-variant/60 font-mono">{t('selectedCount', { count: selectedIds1.length })}</span>
              </div>
              {selectedIds1.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear1();
                  }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-outline-variant/50 hover:border-error/30 hover:text-error text-[10px] text-on-surface-variant transition-all cursor-pointer"
                >
                  {t('clear')}
                </button>
              )}
            </div>

            <div
              className="flex-1 overflow-y-auto px-lg py-sm space-y-1.5 no-scrollbar"
            >
              {selectedIds1.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-sm">
                  <p className="text-[12px] text-on-surface-variant/40">
                    {focusedGroup === 1 ? t('group1Hint') : t('group1FocusHint')}
                  </p>
                </div>
              ) : (
                selectedIds1.map((id, index) => {
                  const track = trackMap.get(id);
                  if (!track) return null;
                  const isDraggedOver = draggedOverId === track.id;
                  return (
                    <div
                      key={track.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, track.id)}
                      onDragOver={(e) => handleDragOver(e, track.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, track.id)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2.5 px-sm py-1.5 bg-surface-container-lowest border rounded hover:border-primary/40 transition-all shadow-sm cursor-grab active:cursor-grabbing select-none ${
                        isDraggedOver
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20 scale-[0.98]'
                          : 'border-outline-variant/30'
                      }`}
                    >
                      <Icon icon="lucide:grip-vertical" className="w-3.5 h-3.5 text-on-surface-variant/20 flex-shrink-0" />
                      <span className="w-5 h-5 rounded bg-surface-container text-[10px] font-bold text-on-surface-variant flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="flex-1 font-medium text-on-surface text-[12px] truncate">{track.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove1(track.id);
                        }}
                        className="p-0.5 rounded hover:bg-error/10 text-on-surface-variant hover:text-error cursor-pointer transition-colors flex-shrink-0"
                      >
                        <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Box 2: Selection Group 2 */}
          <div
            onClick={() => onFocusGroup(2)}
            className={`flex flex-col h-[50%] transition-all duration-200 cursor-pointer ${
              focusedGroup === 2
                ? 'bg-surface-container-lowest border-l-4 border-l-primary shadow-sm'
                : 'bg-surface-container-low hover:bg-surface-container border-l-4 border-l-transparent'
            }`}
          >
            <div className="px-lg py-sm border-b border-outline-variant/20 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-md">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  focusedGroup === 2 ? 'bg-primary text-on-primary' : 'bg-outline text-on-surface-variant'
                }`}>
                  2
                </span>
                <h3 className={`font-label-md text-[11px] uppercase tracking-[0.1em] font-bold ${
                  focusedGroup === 2 ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {t('selectionGroup2')}
                </h3>
                <span className="text-[10px] text-on-surface-variant/60 font-mono">{t('selectedCount', { count: selectedIds2.length })}</span>
              </div>
              {selectedIds2.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear2();
                  }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-outline-variant/50 hover:border-error/30 hover:text-error text-[10px] text-on-surface-variant transition-all cursor-pointer"
                >
                  {t('clear')}
                </button>
              )}
            </div>

            <div
              className="flex-1 overflow-y-auto px-lg py-sm space-y-1.5 no-scrollbar"
            >
              {selectedIds2.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-sm">
                  <p className="text-[12px] text-on-surface-variant/40">
                    {focusedGroup === 2 ? t('group2Hint') : t('group2FocusHint')}
                  </p>
                </div>
              ) : (
                selectedIds2.map((id, index) => {
                  const track = trackMap.get(id);
                  if (!track) return null;
                  const isDraggedOver = draggedOverId === track.id;
                  return (
                    <div
                      key={track.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, track.id)}
                      onDragOver={(e) => handleDragOver(e, track.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, track.id)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2.5 px-sm py-1.5 bg-surface-container-lowest border rounded hover:border-primary/40 transition-all shadow-sm cursor-grab active:cursor-grabbing select-none ${
                        isDraggedOver
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20 scale-[0.98]'
                          : 'border-outline-variant/30'
                      }`}
                    >
                      <Icon icon="lucide:grip-vertical" className="w-3.5 h-3.5 text-on-surface-variant/20 flex-shrink-0" />
                      <span className="w-5 h-5 rounded bg-surface-container text-[10px] font-bold text-on-surface-variant flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="flex-1 font-medium text-on-surface text-[12px] truncate">{track.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove2(track.id);
                        }}
                        className="p-0.5 rounded hover:bg-error/10 text-on-surface-variant hover:text-error cursor-pointer transition-colors flex-shrink-0"
                      >
                        <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
