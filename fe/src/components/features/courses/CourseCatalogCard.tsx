import { useTranslations } from 'next-intl';
import { TimeBadge } from '@/components/ui';
import type { LearnerTrack } from '@/components/features/tracks/learner/types';
import { getProgressPercent } from './types';
import { Card, CardContent, CardFooter } from '@/components/ui/default/card';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';

interface CourseCatalogCardProps {
  track: LearnerTrack;
  onOpen: (trackId: string) => void;
}

const statusIcon: Record<LearnerTrack['status'], string> = {
  completed: 'check_circle',
  in_progress: 'play_circle',
  locked: 'lock',
};

export function CourseCatalogCard({ track, onOpen }: CourseCatalogCardProps) {
  const t = useTranslations('CoursesPage');
  const isLocked = track.status === 'locked';
  const isCompleted = track.status === 'completed';
  const isInProgress = track.status === 'in_progress';
  const progress = getProgressPercent(track);

  const statusLabel = t(`status_${track.status}`);

  return (
    <Card
      className={`flex min-w-0 flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md ${
        isLocked
          ? 'border-dashed border-outline-variant/80 opacity-70'
          : isInProgress
            ? 'border-primary/60 ring-1 ring-primary/15 hover:border-primary/60'
            : 'border-outline-variant/70 hover:border-primary/40'
      }`}
    >
      <CardContent className="p-5 flex-1 flex flex-col gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${
                isLocked
                  ? 'border-outline-variant bg-surface-container text-outline'
                  : isCompleted
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-primary/20 bg-primary-container/10 text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {track.icon || statusIcon[track.status]}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[12px] font-medium uppercase text-on-surface-variant">
                {t('milestone', { order: String(track.order).padStart(2, '0') })}
              </span>
              <h3 className="text-[20px] font-semibold text-on-surface line-clamp-2 break-words">{track.title}</h3>
            </div>
          </div>
        </div>

        <p className="text-[14px] min-w-0 line-clamp-3 break-words text-on-surface-variant">
          {track.description || t('noDescription')}
        </p>

        <div className="flex min-w-0 flex-wrap gap-3 text-[14px] font-medium text-on-surface-variant">
          <TimeBadge time={track.estimatedTime} />
          <span className="inline-flex min-w-0 max-w-full items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">menu_book</span>
            <span className="min-w-0 truncate">{t('lessonCount', { count: track.lessonCount })}</span>
          </span>
          <Badge
            variant="outline"
            className={`gap-1 px-2.5 py-1 ${
              isLocked
                ? 'bg-surface-container text-outline border-outline-variant'
                : isCompleted
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-primary/10 text-primary border-primary/20'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {statusIcon[track.status]}
            </span>
            <span className="min-w-0 truncate">{statusLabel}</span>
          </Badge>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[14px] font-medium text-on-surface-variant">
            <span>{t('progress')}</span>
            <span className="text-on-surface">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-container">
            <div
              className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {track.lockedReason && isLocked && (
          <p className="text-[14px] line-clamp-3 break-words text-on-surface-variant italic">
            {track.lockedReason}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-5 mt-auto">
        {isLocked ? (
          <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant px-4 py-2 text-[14px] font-medium text-outline cursor-not-allowed">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            {t('locked')}
          </span>
        ) : (
          <Button
            variant={isInProgress ? 'default' : 'outline'}
            onClick={() => onOpen(track.id)}
            className="w-full gap-1.5"
          >
            {isCompleted ? t('review') : t('continue')}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
