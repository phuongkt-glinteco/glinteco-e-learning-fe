'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { lessonsControllerFindLessons } from '@/services/api-client';
import type { LessonProgressItemDto } from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';

interface TrackLessonsManagerCardProps {
  trackId: string;
}

export function TrackLessonsManagerCard({ trackId }: TrackLessonsManagerCardProps) {
  const t = useTranslations('EditTrackPage');
  const [lessons, setLessons] = useState<LessonProgressItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await lessonsControllerFindLessons({
        path: { id: trackId },
      });
      const data = res.data;
      const items = Array.isArray(data)
        ? data
        : data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)
        ? data.data
        : [];
      setLessons(items as LessonProgressItemDto[]);
    } catch {
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-outline-variant/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon icon="lucide:book-open" className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-base text-on-surface">
            {t('lessonListHeading', { count: lessons.length })}
          </h3>
        </div>

        <Link
          href={`/admin/tracks/${trackId}`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-primary/10 hover:text-primary text-xs font-bold transition-all border border-outline-variant/60"
        >
          <Icon icon="lucide:plus" className="w-4 h-4" />
          <span>{t('addLesson')}</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="py-10 text-center bg-surface-container/20 rounded-xl border border-dashed border-outline-variant text-xs text-on-surface-variant">
          {t('noLessonsYet')}
        </div>
      ) : (
        <div className="space-y-2.5">
          {lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-outline-variant/80 bg-surface hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-container text-on-surface font-bold text-xs flex items-center justify-center shrink-0">
                  #{lesson.order || idx + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-on-surface line-clamp-1">
                    {lesson.title}
                  </h4>
                  <span className="text-xs text-on-surface-variant/70">
                    ID: {lesson.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/admin/tracks/${trackId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:text-primary hover:bg-primary/10 text-xs font-semibold transition-colors"
                >
                  <Icon icon="lucide:edit-3" className="w-3.5 h-3.5" />
                  <span>{t('manageLessonAction')}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
