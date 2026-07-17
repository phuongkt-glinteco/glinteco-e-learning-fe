'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import {
  lessonsControllerFindLessons,
  lessonsControllerDeleteLesson,
} from '@/services/api-client';
import type { LessonProgressItemDto } from '@/services/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/default/dialog';
import { Button } from '@/components/ui/default/button';

interface TrackLessonsManagerCardProps {
  trackId: string;
  onDeleteLesson?: (lessonId: string) => void;
}

export function TrackLessonsManagerCard({ trackId, onDeleteLesson }: TrackLessonsManagerCardProps) {
  const t = useTranslations('EditTrackPage');
  const [lessons, setLessons] = useState<LessonProgressItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingLesson, setDeletingLesson] = useState<LessonProgressItemDto | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteConfirm = async () => {
    if (!deletingLesson) return;
    setDeleting(true);
    try {
      await lessonsControllerDeleteLesson({
        path: { id: deletingLesson.id },
        throwOnError: true,
      });
    } catch {
      // Continue to update local UI state or trigger parent onDeleteLesson
    } finally {
      setLessons((prev) => prev.filter((item) => item.id !== deletingLesson.id));
      onDeleteLesson?.(deletingLesson.id);
      setDeleting(false);
      setDeletingLesson(null);
    }
  };

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
          href={`/admin/tracks/${trackId}/lessons/new`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-primary/10 hover:text-primary text-xs font-bold transition-all border border-outline-variant/60"
        >
          <Icon icon="lucide:plus" className="w-4 h-4" />
          <span>{t('addLesson')}</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] bg-surface-container/10 rounded-xl border border-dashed border-outline-variant">
          <div className="flex flex-col items-center gap-3">
            <Icon icon="lucide:loader-2" className="w-7 h-7 text-primary animate-spin" />
            <span className="text-xs text-on-surface-variant font-medium">{t('loading')}</span>
          </div>
        </div>
      ) : lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-4 bg-surface-container/10 rounded-xl border border-dashed border-outline-variant">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
            <Icon icon="lucide:book-open" className="w-7 h-7 text-on-surface-variant" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-on-surface">{t('noLessonsYet')}</p>
            <p className="text-xs text-on-surface-variant">Thêm bài học đầu tiên để bắt đầu xây dựng lộ trình học tập.</p>
          </div>
          <Link
            href={`/admin/tracks/${trackId}/lessons/new`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            <span>{t('addLesson')}</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5 min-h-[300px] overflow-y-auto">
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

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/tracks/${trackId}/lessons/${lesson.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:text-primary hover:bg-primary/10 text-xs font-semibold transition-colors"
                >
                  <Icon icon="lucide:edit-3" className="w-3.5 h-3.5" />
                  <span>{t('manageLessonAction')}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setDeletingLesson(lesson)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs font-semibold transition-colors"
                >
                  <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                  <span>{t('deleteLessonAction')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deletingLesson)} onOpenChange={(open) => !open && !deleting && setDeletingLesson(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border-outline-variant p-6 shadow-xl">
          <DialogHeader className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Icon icon="lucide:trash-2" className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {t('confirmDeleteLessonTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {t('confirmDeleteLessonDesc')}
            </DialogDescription>
          </DialogHeader>

          {deletingLesson && (
            <div className="font-bold text-base text-on-surface bg-surface-container/50 p-3 rounded-lg border border-outline-variant text-center">
              &quot;{deletingLesson.title}&quot;
            </div>
          )}

          <DialogFooter className="gap-2 pt-4 border-t border-outline-variant">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingLesson(null)}
              disabled={deleting}
              className="rounded-xl h-10 px-4 font-medium"
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="rounded-xl h-10 px-4 font-medium gap-2"
            >
              <Icon icon="lucide:trash-2" className="w-4 h-4" />
              <span>{t('deleteLessonConfirmBtn')}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
