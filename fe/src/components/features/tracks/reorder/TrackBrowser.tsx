'use client';

import React, { useCallback, useState } from 'react';
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

interface SortableBrowserTrackRowProps {
  track: TrackSummaryDto;
  isSel1: boolean;
  isSel2: boolean;
  swapMode: boolean;
  onClick: (e: React.MouseEvent, id: string) => void;
  lessonsCountLabel: string;
}

function SortableBrowserTrackRow({
  track,
  isSel1,
  isSel2,
  swapMode,
  onClick,
  lessonsCountLabel,
}: SortableBrowserTrackRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id, disabled: swapMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => onClick(e, track.id)}
      className={`relative flex items-center gap-md px-md py-[10px] border-b border-outline-variant/30 text-left transition-all duration-150 cursor-pointer select-none ${itemClasses} ${
        isDragging ? 'opacity-30 bg-primary/10 border-2 border-dashed border-primary scale-[0.98]' : ''
      }`}
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
          {lessonsCountLabel}
        </span>
      )}
      {badge}
    </div>
  );
}

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

  function handleDragStart(event: DragStartEvent) {
    if (swapMode) return;
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id || swapMode) return;

    const oldIndex = allTracks.findIndex((t) => t.id === active.id);
    const newIndex = allTracks.findIndex((t) => t.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(allTracks, oldIndex, newIndex));
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const activeTrack = activeId ? allTracks.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
                <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col">
                    {filtered.map((track) => {
                      const isSel1 = selectedIds.includes(track.id);
                      const isSel2 = selectedIds2.includes(track.id);
                      return (
                        <SortableBrowserTrackRow
                          key={track.id}
                          track={track}
                          isSel1={isSel1}
                          isSel2={isSel2}
                          swapMode={swapMode}
                          onClick={handleClick}
                          lessonsCountLabel={t('lessonsCount', { count: track.lessonCount })}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              )}
            </div>
          </>
        )}
      </div>

      <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTrack ? (
          <div className="flex items-center gap-md px-md py-[10px] bg-surface-container-lowest border-2 border-primary rounded-lg shadow-2xl scale-[1.03] cursor-grabbing select-none ring-4 ring-primary/20">
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
            <span className="flex-1 font-bold text-primary text-body-sm truncate">{activeTrack.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
