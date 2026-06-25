import type { LearnerTrack } from './types';

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
    <article className="grid grid-cols-[56px_1fr] gap-4">
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

      <div
        className={`mb-5 rounded-lg border bg-surface-container-lowest p-5 shadow-sm transition-all ${
          isLocked
            ? 'border-dashed border-outline-variant opacity-70'
            : isInProgress
              ? 'border-primary ring-1 ring-primary/20'
              : 'border-outline-variant hover:border-primary/40'
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="label-sm uppercase text-on-surface-variant">
              Milestone {String(index + 1).padStart(2, '0')}
            </span>
            <h2 className="mt-1 headline-sm text-on-surface">{track.title}</h2>
            <p className="mt-2 body-sm text-on-surface-variant">{track.description}</p>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 label-sm ${
              isLocked
                ? 'bg-surface-container text-outline'
                : isCompleted
                  ? 'bg-green-50 text-green-700'
                  : 'bg-primary-fixed text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {statusIcon[track.status]}
            </span>
            {statusCopy[track.status]}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-3 label-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {track.estimatedTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                {track.lessonCount} lessons
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                {track.lessonsCompleted}/{track.lessonCount} done
              </span>
            </div>

            <div className="mt-4 max-w-md">
              <div className="mb-1.5 flex items-center justify-between label-sm text-on-surface-variant">
                <span>Progress</span>
                <span className="text-on-surface">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                <div
                  className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenTrack(track)}
            disabled={isLocked || isOpening}
            className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-lg px-4 label-sm transition-colors ${
              isLocked
                ? 'cursor-not-allowed bg-surface-container text-outline'
                : isInProgress
                  ? 'cursor-pointer bg-primary text-on-primary hover:opacity-90'
                  : 'cursor-pointer border border-outline-variant text-on-surface hover:bg-surface-container-low'
            } disabled:opacity-60`}
          >
            {isOpening ? (
              <>
                <span className="material-symbols-outlined text-[18px]">progress_activity</span>
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
          </button>
        </div>
      </div>
    </article>
  );
}
