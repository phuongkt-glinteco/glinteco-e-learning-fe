'use client';

import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import type { TrackSummaryDto } from '@/services/api-client';
import { useTranslations } from 'next-intl';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTrackRowProps {
  track: TrackSummaryDto;
  onRemove: (id: string) => void;
  compact?: boolean;
}

function SortableTrackRow({ track, onRemove, compact }: SortableTrackRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`flex items-center gap-2.5 px-sm py-1.5 bg-surface-container-lowest border rounded hover:border-primary/40 transition-all shadow-sm cursor-grab active:cursor-grabbing select-none ${
          isDragging
            ? 'opacity-30 bg-primary/10 border-2 border-dashed border-primary scale-[0.98]'
            : 'border-outline-variant/30'
        }`}
      >
        <Icon icon="lucide:grip-vertical" className="w-3.5 h-3.5 text-on-surface-variant/20 flex-shrink-0" />
        <span className="flex-1 font-medium text-on-surface text-[12px] truncate">{track.title}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(track.id);
          }}
          className="p-0.5 rounded hover:bg-error/10 text-on-surface-variant hover:text-error cursor-pointer transition-colors flex-shrink-0"
        >
          <Icon icon="lucide:x" className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 px-md py-2.5 bg-surface-container-lowest border rounded-lg hover:border-primary/40 transition-all shadow-sm cursor-grab active:cursor-grabbing select-none ${
        isDragging
          ? 'opacity-30 bg-primary/10 border-2 border-dashed border-primary scale-[0.98]'
          : 'border-outline-variant/50'
      }`}
    >
      <Icon icon="lucide:grip-vertical" className="w-4 h-4 text-on-surface-variant/30 flex-shrink-0" />
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
      <span className="flex-1 font-medium text-on-surface text-body-sm truncate">{track.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(track.id);
        }}
        className="p-1 rounded hover:bg-error/10 text-on-surface-variant hover:text-error cursor-pointer transition-colors flex-shrink-0"
      >
        <Icon icon="lucide:x" className="w-4 h-4" />
      </button>
    </div>
  );
}

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const trackMap = useMemo(() => {
    const m = new Map<string, TrackSummaryDto>();
    for (const t of allTracks) m.set(t.id, t);
    return m;
  }, [allTracks]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    if (selectedIds1.includes(active.id as string) && selectedIds1.includes(over.id as string)) {
      const oldIndex = selectedIds1.indexOf(active.id as string);
      const newIndex = selectedIds1.indexOf(over.id as string);
      onReorder1(arrayMove(selectedIds1, oldIndex, newIndex));
    } else if (selectedIds2.includes(active.id as string) && selectedIds2.includes(over.id as string)) {
      const oldIndex = selectedIds2.indexOf(active.id as string);
      const newIndex = selectedIds2.indexOf(over.id as string);
      onReorder2(arrayMove(selectedIds2, oldIndex, newIndex));
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const activeTrack = activeId ? trackMap.get(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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

            <div className="flex-1 overflow-y-auto px-lg py-md space-y-2">
              {selectedIds1.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-md py-2xl">
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-outline-variant/30 flex items-center justify-center">
                    <Icon icon="lucide:list-plus" className="text-3xl text-on-surface-variant/20" />
                  </div>
                  <p className="text-body-sm text-on-surface-variant">{t('emptyResultListHint')}</p>
                </div>
              ) : (
                <SortableContext items={selectedIds1} strategy={verticalListSortingStrategy}>
                  {selectedIds1.map((id) => {
                    const track = trackMap.get(id);
                    if (!track) return null;
                    return (
                      <SortableTrackRow
                        key={track.id}
                        track={track}
                        onRemove={onRemove1}
                      />
                    );
                  })}
                </SortableContext>
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

              <div className="flex-1 overflow-y-auto px-lg py-sm space-y-1.5 no-scrollbar">
                {selectedIds1.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-sm">
                    <p className="text-[12px] text-on-surface-variant/40">
                      {focusedGroup === 1 ? t('group1Hint') : t('group1FocusHint')}
                    </p>
                  </div>
                ) : (
                  <SortableContext items={selectedIds1} strategy={verticalListSortingStrategy}>
                    {selectedIds1.map((id) => {
                      const track = trackMap.get(id);
                      if (!track) return null;
                      return (
                        <SortableTrackRow
                          key={track.id}
                          track={track}
                          onRemove={onRemove1}
                          compact
                        />
                      );
                    })}
                  </SortableContext>
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

              <div className="flex-1 overflow-y-auto px-lg py-sm space-y-1.5 no-scrollbar">
                {selectedIds2.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-sm">
                    <p className="text-[12px] text-on-surface-variant/40">
                      {focusedGroup === 2 ? t('group2Hint') : t('group2FocusHint')}
                    </p>
                  </div>
                ) : (
                  <SortableContext items={selectedIds2} strategy={verticalListSortingStrategy}>
                    {selectedIds2.map((id) => {
                      const track = trackMap.get(id);
                      if (!track) return null;
                      return (
                        <SortableTrackRow
                          key={track.id}
                          track={track}
                          onRemove={onRemove2}
                          compact
                        />
                      );
                    })}
                  </SortableContext>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTrack ? (
          <div className={`flex items-center gap-3 px-md py-2.5 bg-surface-container-lowest border-2 border-primary rounded-lg shadow-2xl scale-[1.03] cursor-grabbing select-none ring-4 ring-primary/20 ${
            swapMode ? 'py-1.5 px-sm gap-2.5 text-[12px]' : ''
          }`}>
            <Icon icon="lucide:grip-vertical" className={`w-4 h-4 text-primary flex-shrink-0 ${swapMode ? 'w-3.5 h-3.5' : ''}`} />
            {!swapMode && (
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    activeTrack.status === 'completed'
                      ? '#22c55e'
                      : activeTrack.status === 'in_progress'
                      ? '#f59e0b'
                      : '#94a3b8',
                }}
              />
            )}
            <span className="flex-1 font-bold text-primary truncate">{activeTrack.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
