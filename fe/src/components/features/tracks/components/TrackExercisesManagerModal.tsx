'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/default/dialog';
import { Modal } from '@/components/ui';
import { exercisesControllerRemove } from '@/services/api-client';
import { UiShowError } from '@/services/errors';
import type { ExerciseSummaryDto } from '@/services/api-client';
import { isTrackDirectExercise } from '../utils';
import { TrackExercisesActionsDropdown } from './TrackExercisesActionsDropdown';

interface TrackExercisesManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackId: string;
  exercises: ExerciseSummaryDto[];
  onDeleteExercise: (exerciseId: string) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'text-tertiary bg-tertiary-fixed/20 dark:bg-tertiary/10',
  Intermediate: 'text-warning bg-warning/20 dark:bg-warning/10',
  Advanced: 'text-error bg-error-container dark:bg-error/10',
};

const ICON_MAP: Record<string, string> = {
  quiz: 'lucide:help-circle',
  assignment: 'lucide:file-text',
  code: 'lucide:code',
  lab: 'lucide:flask',
  default: 'lucide:terminal',
};

function exerciseIcon(tag?: string): string {
  if (!tag) return ICON_MAP.default;
  return ICON_MAP[tag.toLowerCase()] ?? ICON_MAP.default;
}

export function TrackExercisesManagerModal({
  open,
  onOpenChange,
  trackId,
  exercises = [],
  onDeleteExercise,
}: TrackExercisesManagerModalProps) {
  const t = useTranslations('LinkedExercisesCard');
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter track-direct exercises and apply search & difficulty filters
  const filteredExercises = useMemo(() => {
    return exercises
      .filter(isTrackDirectExercise)
      .filter((ex) => {
        const matchesSearch =
          !searchQuery.trim() ||
          ex.title?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          ex.brief?.toLowerCase().includes(searchQuery.toLowerCase().trim());
        const matchesDifficulty =
          selectedDifficulty === 'all' ||
          ex.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();
        return matchesSearch && matchesDifficulty;
      });
  }, [exercises, searchQuery, selectedDifficulty]);

  const deletingExercise = useMemo(
    () => exercises.find((ex) => ex.id === deletingId),
    [exercises, deletingId]
  );

  const handleConfirmDelete = async () => {
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
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-surface-container-lowest border border-outline-variant shadow-xl rounded-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-outline-variant bg-surface flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon icon="lucide:terminal" className="w-4 h-4" />
                </div>
                <DialogTitle className="headline-sm text-on-surface">
                  {t('managerModalTitle', { defaultValue: 'Quản lý bài tập trực tiếp của Track' })}
                </DialogTitle>
                <span className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant font-label-sm text-xs rounded-full font-bold">
                  {exercises.filter(isTrackDirectExercise).length}
                </span>
              </div>
              <DialogDescription className="body-sm text-secondary">
                {t('managerModalDesc', {
                  defaultValue: 'Quản lý danh sách các bài tập tổng hợp không thuộc riêng bài học nào trong Track.',
                })}
              </DialogDescription>
            </div>

            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                router.push(`/admin/tracks/${trackId}/exercises/new`);
              }}
              className="px-3.5 py-2 bg-primary text-on-primary rounded-xl font-label-sm text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity shrink-0 cursor-pointer shadow-sm"
            >
              <Icon icon="lucide:plus" className="w-4 h-4" />
              <span>{t('addExercise', { defaultValue: 'Thêm bài tập' })}</span>
            </button>
          </DialogHeader>

          {/* Toolbar: Search and Filter */}
          <div className="px-6 py-3.5 bg-surface-container-low border-b border-outline-variant flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Icon
                icon="lucide:search"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder', { defaultValue: 'Tìm kiếm theo tên bài tập...' })}
                className="w-full pl-9 pr-4 py-1.5 bg-surface rounded-lg border border-outline-variant text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-outline-variant">
              {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => {
                const isActive = selectedDifficulty.toLowerCase() === diff.toLowerCase();
                const label =
                  diff === 'all'
                    ? t('filterAll', { defaultValue: 'Tất cả' })
                    : diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Exercise List */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-3">
            {filteredExercises.length === 0 ? (
              <div className="py-12 text-center text-outline font-label-sm border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center bg-surface-container-low/30">
                <Icon icon="lucide:fitness-center" className="w-10 h-10 text-outline/60 mb-2" />
                <span className="text-on-surface font-medium">
                  {searchQuery || selectedDifficulty !== 'all'
                    ? t('noFilterResults', { defaultValue: 'Không tìm thấy bài tập nào phù hợp với bộ lọc.' })
                    : t('noExercises', { defaultValue: 'Chưa có bài tập trực tiếp nào trong Track này.' })}
                </span>
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="p-4 border border-outline-variant rounded-xl bg-surface hover:border-primary/50 hover:bg-primary-container/[0.01] transition-all flex items-center justify-between gap-4 group shadow-2xs"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0 mt-0.5">
                      <Icon
                        icon={exerciseIcon(ex.tag)}
                        className="text-primary text-[20px]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-bold text-sm text-on-surface truncate">
                          {ex.title}
                        </h5>
                        {ex.difficulty && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              DIFFICULTY_COLORS[ex.difficulty] || ''
                            }`}
                          >
                            {ex.difficulty}
                          </span>
                        )}
                        {ex.xp != null && (
                          <span className="flex items-center gap-0.5 text-secondary text-xs font-semibold">
                            <Icon icon="lucide:zap" className="w-3.5 h-3.5 text-amber-500" />
                            <span>{ex.xp} XP</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-secondary truncate mt-1">
                        {ex.brief || t('noExerciseDescription', { defaultValue: 'Không có mô tả chi tiết' })}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 self-center">
                    <TrackExercisesActionsDropdown
                      trackId={trackId}
                      exerciseId={ex.id!}
                      onDelete={() => setDeletingId(ex.id!)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Modal
        open={!!deletingId}
        onClose={() => {
          setDeletingId(null);
          setDeleteError(null);
        }}
        title={t('deleteExerciseModalTitle', { defaultValue: 'Xác nhận xóa bài tập' })}
        width={440}
      >
        <div className="flex flex-col gap-5">
          <p className="text-on-surface-variant text-body-md">
            {t('deleteExerciseModalBody', {
              defaultValue: `Bạn có chắc chắn muốn xóa bài tập "${deletingExercise?.title || ''}"? Thao tác này sẽ xóa vĩnh viễn và không thể hoàn tác.`,
            })}
          </p>

          {deleteError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={() => {
                setDeletingId(null);
                setDeleteError(null);
              }}
              className="px-4 py-2 border border-outline-variant text-secondary font-label-md rounded-lg hover:bg-surface-variant transition-colors cursor-pointer"
            >
              {t('cancel', { defaultValue: 'Hủy' })}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-error text-on-error font-label-md rounded-lg hover:bg-error/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {deleting ? (
                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon icon="lucide:trash-2" className="w-4 h-4" />
              )}
              <span>{t('delete', { defaultValue: 'Xóa bài tập' })}</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
