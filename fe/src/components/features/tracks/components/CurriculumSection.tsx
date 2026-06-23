'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTrackDraftStore } from '@/stores/trackDraftStore';
import { formatEstimatedTime } from '@/lib/time-utils';

export function CurriculumSection() {
  const t = useTranslations('CreateTrackPage');
  const tu = useTranslations('TimeUnit');
  const router = useRouter();
  const { lessons, removeLesson, reorderLessons } = useTrackDraftStore();
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    const updated = [...lessons];
    const dragged = updated.splice(dragItem.current, 1)[0];
    updated.splice(dragOverItem.current, 0, dragged);
    reorderLessons(updated);
    dragItem.current = null;
    dragOverItem.current = null;
  }

  function handleEdit(index: number) {
    router.push(`/admin/tracks/create/lessons/${index}`);
  }

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h3 className="headline-sm text-on-surface">{t('curriculum')}</h3>
          <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-label-sm font-bold">
            {lessons.length} {lessons.length === 1 ? t('lesson') : t('lessons')}
          </span>
        </div>
        <button
          onClick={() => router.push('/admin/tracks/create/lessons/new')}
          className="flex items-center gap-2 text-primary hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors label-md border border-primary cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {t('addLesson')}
        </button>
      </div>

      {lessons.length === 0 && (
        <>
          <div className="border-2 border-dashed border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-secondary text-3xl">auto_stories</span>
            </div>
            <h4 className="label-md text-on-surface mb-1">{t('noLessonsYet')}</h4>
            <p className="text-body-sm text-secondary max-w-xs">{t('noLessonsHint')}</p>
          </div>
          <div className="mt-6 opacity-40 select-none pointer-events-none">
            <div className="flex items-center gap-4 p-4 border border-outline-variant rounded-lg bg-surface">
              <span className="material-symbols-outlined text-secondary">drag_indicator</span>
              <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-bold text-label-sm">
                1
              </div>
              <div className="flex-1">
                <div className="h-4 w-48 bg-surface-container-highest rounded mb-2" />
                <div className="h-3 w-24 bg-surface-container-high rounded" />
              </div>
              <span className="material-symbols-outlined text-secondary">edit</span>
            </div>
          </div>
        </>
      )}

      {lessons.length > 0 && (
        <div className="flex flex-col gap-3">
          {lessons.map((lesson, index) => (
            <div
              key={`lesson-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="flex items-center gap-4 p-4 border border-outline-variant rounded-lg bg-surface-container-low hover:bg-surface-container-lowest hover:shadow-md transition-all group cursor-default"
            >
              <span className="material-symbols-outlined text-secondary cursor-grab active:cursor-grabbing text-[20px]">drag_indicator</span>
              <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-bold text-label-sm shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="label-md text-on-surface font-semibold truncate">{lesson.title}</p>
                <p className="text-body-sm text-secondary">{formatEstimatedTime(lesson.estimatedTime, tu)}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(index)}
                  className="p-2 hover:bg-surface-variant rounded-lg text-secondary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => removeLesson(index)}
                  className="p-2 hover:bg-error-container hover:text-error rounded-lg text-secondary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
