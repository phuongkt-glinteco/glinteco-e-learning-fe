'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui';
import { deleteLessonsById } from '@/services/api-client';

type LessonStatus = 'completed' | 'in_progress' | 'locked';

interface LessonItem {
  id: string;
  title: string;
  order: number;
  status: LessonStatus;
}

interface AdminCurriculumRoadmapProps {
  trackId: string;
  lessons: LessonItem[];
  onDeleteLesson: (lessonId: string) => void;
}

function StatusBadge({ status, t }: { status: LessonStatus; t: (key: string) => string }) {
  if (status === 'completed') {
    return (
      <span className="text-tertiary font-label-sm px-2 py-1 bg-tertiary-fixed/30 rounded">
        {t('completed')}
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="text-primary font-label-sm px-2 py-1 bg-primary-fixed/50 rounded">
        {t('inProgress')}
      </span>
    );
  }
  return (
    <span className="text-outline font-label-sm px-2 py-1 bg-surface-container-high rounded">
      {t('locked')}
    </span>
  );
}

export default function AdminCurriculumRoadmap({
  trackId,
  lessons,
  onDeleteLesson,
}: AdminCurriculumRoadmapProps) {
  const t = useTranslations('TrackDetailPage');
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (lessons.length === 0) {
    return (
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-sm text-on-surface">{t('curriculumTitle')}</h3>
            <span className="font-label-sm text-outline">{t('zeroLessons')}</span>
          </div>
          <div className="p-lg text-center text-outline font-label-sm">
            {t('noLessons')}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-lg pb-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-sm text-on-surface">{t('curriculumTitle')}</h3>
            <span className="font-label-sm text-outline">
              {t('totalLessons', { count: lessons.length })}
            </span>
          </div>
        </div>

        <div className="divide-y divide-outline-variant">
          {lessons.map((lesson) => {
            const isCompleted = lesson.status === 'completed';
            const isInProgress = lesson.status === 'in_progress';
            const isLocked = lesson.status === 'locked';

            return (
              <div
                key={lesson.id}
                className={`p-lg flex items-center gap-4 transition-colors group ${
                  isInProgress ? 'bg-primary-container/[0.03] border-l-4 border-primary' : ''
                } ${isLocked ? 'opacity-60 grayscale' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : isInProgress
                        ? 'bg-primary-fixed text-primary animate-pulse'
                        : 'bg-surface-container-highest text-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isCompleted ? 'check_circle' : isInProgress ? 'play_circle' : 'lock'}
                  </span>
                </div>

                <div className="flex-grow min-w-0">
                  <h4
                    className={`font-label-md truncate ${
                      isInProgress ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    {lesson.order}. {lesson.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={lesson.status} t={t} />
                  <button
                    onClick={() =>
                      router.push(`/admin/tracks/${trackId}/lessons/${lesson.id}/edit`)
                    }
                    className="p-2 text-outline opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-primary"
                    title={t('editLesson')}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => setDeletingId(lesson.id)}
                    className="p-2 text-outline opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-error"
                    title={t('deleteLesson')}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Modal
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        title={t('deleteModalTitle')}
        width={440}
      >
        <div className="flex flex-col gap-6">
          <p className="text-on-surface-variant text-body-md">
            {t('deleteModalBody')}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeletingId(null)}
              className="px-4 py-2 border border-outline-variant text-secondary font-label-md rounded-lg hover:bg-surface-variant transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              onClick={async () => {
                if (!deletingId) return;
                try {
                  await deleteLessonsById({
                    path: { id: deletingId },
                    throwOnError: true,
                  });
                  onDeleteLesson(deletingId);
                } catch {
                  // error handled by interceptor
                }
                setDeletingId(null);
              }}
              className="px-4 py-2 bg-error text-on-error font-label-md rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              {t('delete')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
