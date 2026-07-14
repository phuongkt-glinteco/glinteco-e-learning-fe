'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/default/badge';
import { formatDateTimeByZone } from '@/lib/timezone';
import type { CohortUserLessonProgressDto } from '@/services/api-client';

interface CohortUserLessonBreakdownProps {
  lessons: CohortUserLessonProgressDto[];
}

export function CohortUserLessonBreakdown({ lessons }: CohortUserLessonBreakdownProps) {
  const t = useTranslations('CohortDetailPage');

  if (!lessons || lessons.length === 0) {
    return null;
  }

  const completedCount = lessons.filter((l) => l.status === 'completed').length;

  const getLessonTypeIcon = (type: CohortUserLessonProgressDto['type']) => {
    switch (type) {
      case 'video':
        return 'lucide:play-circle';
      case 'coding':
        return 'lucide:code-2';
      case 'quiz':
        return 'lucide:help-circle';
      case 'assignment':
        return 'lucide:file-check';
      default:
        return 'lucide:book-open';
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-outline-variant/60 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
        <span>{t('lessonsBreakdownTitle', { completed: completedCount, total: lessons.length })}</span>
      </div>

      <div className="space-y-2">
        {lessons.map((lesson) => {
          const isCompleted = lesson.status === 'completed';
          const isInProgress = lesson.status === 'in_progress';
          const isLocked = lesson.status === 'locked';

          return (
            <div
              key={lesson.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-xs transition-all ${
                isCompleted
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-on-surface'
                  : isInProgress
                  ? 'bg-primary/5 border-primary/30 text-on-surface font-semibold shadow-sm'
                  : 'bg-surface-container/30 border-outline-variant/50 text-on-surface-variant/70'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Status Indicator Icon */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : isInProgress
                      ? 'bg-primary/20 text-primary animate-pulse'
                      : 'bg-surface-container-highest text-on-surface-variant/60'
                  }`}
                >
                  {isCompleted ? (
                    <Icon icon="lucide:check" className="w-4 h-4 stroke-[2.5]" />
                  ) : isInProgress ? (
                    <Icon icon="lucide:play" className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Icon icon="lucide:lock" className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">
                      {lesson.order}. {lesson.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                    <Icon icon={getLessonTypeIcon(lesson.type)} className="w-3.5 h-3.5" />
                    <span className="capitalize">{lesson.type}</span>
                    {lesson.completedAt && (
                      <>
                        <span>•</span>
                        <span>{formatDateTimeByZone(lesson.completedAt)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isCompleted ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold"
                  >
                    {t('lessonStatusCompleted')}
                  </Badge>
                ) : isInProgress ? (
                  <Badge
                    variant="default"
                    className="bg-primary text-primary-foreground text-[10px] font-bold"
                  >
                    {t('lessonStatusInProgress')}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-on-surface-variant/60 border-outline-variant text-[10px] font-medium"
                  >
                    {t('lessonStatusLocked')}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
