'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui';
import { exercisesControllerRemove } from '@/services/api-client';
import { UiShowError } from '@/services/errors';
import type { ExerciseSummaryDto } from '@/services/api-client';

interface LinkedExercisesCardProps {
  trackId: string;
  exercises: ExerciseSummaryDto[];
  onDeleteExercise: (exerciseId: string) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'text-tertiary bg-tertiary-fixed/20',
  Intermediate: 'text-warning bg-warning/20',
  Advanced: 'text-error bg-error-container',
};

export default function LinkedExercisesCard({ trackId, exercises, onDeleteExercise }: LinkedExercisesCardProps) {
  const t = useTranslations('TrackDetailPage');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
        <div className="mb-4">
          <h3 className="font-headline-sm text-on-surface">{t('linkedExercises')}</h3>
        </div>

        {exercises.length === 0 ? (
          <div className="py-8 text-center text-outline font-label-sm border border-dashed border-outline-variant rounded-lg">
            <span className="material-symbols-outlined text-[32px] block mb-2">fitness_center</span>
            {t('noExercises')}
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.slice(0, 5).map((ex) => (
              <div
                key={ex.id}
                className="p-3 border border-outline-variant rounded-lg hover:border-primary hover:bg-primary-container/[0.02] transition-all flex gap-3 group"
              >
                <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-label-md text-on-surface truncate">{ex.title}</h5>
                  <p className="text-label-sm text-outline truncate">{ex.brief || t('noExerciseDescription')}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {ex.difficulty && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${DIFFICULTY_COLORS[ex.difficulty] || ''}`}>
                        {ex.difficulty}
                      </span>
                    )}
                    {ex.xp != null && (
                      <span className="flex items-center gap-0.5 text-outline text-label-sm">
                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                        {t('xpValue', { count: ex.xp })}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setDeletingId(ex.id!)}
                  className="p-1.5 text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shrink-0 self-center"
                  title={t('deleteExercise')}
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {exercises.length > 5 && (
          <Link
            href={`/admin/exercises?trackId=${trackId}`}
            className="w-full mt-4 py-2 text-primary font-label-md border-t border-outline-variant pt-4 hover:underline block text-center"
          >
            {t('viewAll', { count: exercises.length })}
          </Link>
        )}
      </section>

      <Modal
        open={!!deletingId}
        onClose={() => { setDeletingId(null); setDeleteError(null); }}
        title={t('deleteExerciseModalTitle')}
        width={440}
      >
        <div className="flex flex-col gap-6">
          <p className="text-on-surface-variant text-body-md">
            {t('deleteExerciseModalBody')}
          </p>

          {deleteError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{t(deleteError)}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setDeletingId(null); setDeleteError(null); }}
              className="px-4 py-2 border border-outline-variant text-secondary font-label-md rounded-lg hover:bg-surface-variant transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              onClick={async () => {
                if (!deletingId) return;
                setDeleting(true);
                setDeleteError(null);
                try {
                  await exercisesControllerRemove({
                    path: { id: deletingId },
                    throwOnError: true,
                  });
                  onDeleteExercise(deletingId);
                  setDeletingId(null);
                } catch (err) {
                  if (err instanceof UiShowError) {
                    setDeleteError(err.errorCode);
                  } else {
                    setDeleteError('UNKNOWN_ERROR');
                  }
                } finally {
                  setDeleting(false);
                }
              }}
              disabled={deleting}
              className="px-4 py-2 bg-error text-on-error font-label-md rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deleting && <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>}
              {t('delete')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
