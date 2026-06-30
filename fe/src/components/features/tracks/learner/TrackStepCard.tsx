import type { LearnerTrack } from './types';
import { Card, CardContent } from '@/components/ui/default/card';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';

interface TrackStepCardProps {
  track: LearnerTrack;
  index: number;
  isLast: boolean;
  isOpening: boolean;
  onOpenTrack: (track: LearnerTrack) => void;
}

const statusCopy: Record<LearnerTrack['status'], string> = {
  completed: 'Completed',
  in_progress: 'In Progress',
  locked: 'Locked',
};

const statusIcon: Record<LearnerTrack['status'], string> = {
  completed: 'check_circle',
  in_progress: 'play_circle',
  locked: 'lock',
};

function getProgress(track: LearnerTrack) {
  if (track.status === 'completed') return 100;
  if (track.lessonCount <= 0) return 0;
  return Math.round((track.lessonsCompleted / track.lessonCount) * 100);
}

export function TrackStepCard({
  track,
  index,
  isLast,
  isOpening,
  onOpenTrack,
}: TrackStepCardProps) {
  const isLocked = track.status === 'locked';
  const isCompleted = track.status === 'completed';
  const isInProgress = track.status === 'in_progress';
  const progress = getProgress(track);

  return (
    <article className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`z-10 flex h-14 w-14 items-center justify-center rounded-lg border-2 shadow-sm ${
            isLocked
              ? 'border-outline-variant bg-surface-container text-outline'
              : isCompleted
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-primary bg-primary text-on-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[26px]">
            {statusIcon[track.status]}
          </span>
        </div>
        {!isLast && (
          <div
            className={`my-1 min-h-12 w-1 flex-1 rounded-full ${
              isCompleted ? 'bg-green-300' : 'bg-outline-variant'
            }`}
          />
        )}
      </div>

      <Card
        className={`mb-5 min-w-0 overflow-hidden shadow-sm transition-all ${
          isLocked
            ? 'border-dashed border-outline-variant opacity-70 bg-surface-container-lowest'
            : isInProgress
              ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
              : 'border-outline-variant hover:border-primary/40 bg-surface-container-lowest'
        }`}
      >
        <CardContent className="p-5">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <span className="label-sm uppercase text-on-surface-variant font-bold text-xs tracking-wider">
                Milestone {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="mt-1 text-xl font-bold line-clamp-2 break-words text-on-surface">{track.title}</h2>
              <p className="mt-2 text-sm line-clamp-3 break-words text-on-surface-variant">
                {track.description}
              </p>
            </div>

            <Badge
              variant={isLocked ? 'outline' : isCompleted ? 'secondary' : 'default'}
              className={`flex items-center gap-1 ${
                isLocked
                  ? 'bg-surface-container text-outline border-outline-variant'
                  : isCompleted
                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    : 'bg-primary text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {statusIcon[track.status]}
              </span>
              <span className="min-w-0 truncate">{statusCopy[track.status]}</span>
            </Badge>
          </div>

          <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap gap-3 text-sm text-on-surface-variant font-medium">
                <span className="inline-flex min-w-0 max-w-full items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span className="min-w-0 truncate">{track.estimatedTime}</span>
                </span>
                <span className="inline-flex min-w-0 max-w-full items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">menu_book</span>
                  <span className="min-w-0 truncate">{track.lessonCount} lessons</span>
                </span>
                <span className="inline-flex min-w-0 max-w-full items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  <span className="min-w-0 truncate">{track.lessonsCompleted}/{track.lessonCount} done</span>
                </span>
              </div>

              <div className="mt-4 max-w-md">
                <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                  <span>Progress</span>
                  <span className="text-on-surface">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className={`h-full rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => onOpenTrack(track)}
              disabled={isLocked || isOpening}
              variant={isLocked ? 'outline' : isInProgress ? 'default' : 'outline'}
              className={`flex items-center gap-1.5 w-full sm:w-auto h-11 ${
                isInProgress ? 'shadow-md' : ''
              }`}
            >
              {isOpening ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Opening
                </>
              ) : isCompleted ? (
                <>
                  Review
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              ) : isInProgress ? (
                <>
                  Continue
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              ) : (
                <>
                  Locked
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
