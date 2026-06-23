import type { LearnerTrack } from './types';

interface TrackCardProps {
  track: LearnerTrack;
  isOpening: boolean;
  onOpenTrack: (track: LearnerTrack) => void;
}

const statusCopy: Record<LearnerTrack['status'], string> = {
  completed: 'Completed',
  in_progress: 'In Progress',
  locked: 'Locked',
};

const iconByStatus: Record<LearnerTrack['status'], string> = {
  completed: 'rocket_launch',
  in_progress: 'integration_instructions',
  locked: 'lock',
};

function getProgress(track: LearnerTrack) {
  if (track.lessonCount <= 0) return 0;
  return Math.round((track.lessonsCompleted / track.lessonCount) * 100);
}

export function TrackCard({ track, isOpening, onOpenTrack }: TrackCardProps) {
  const isLocked = track.status === 'locked';
  const isCompleted = track.status === 'completed';
  const progress = isCompleted ? 100 : getProgress(track);

  return (
    <article
      className={`relative min-h-[292px] rounded-lg border bg-surface-container-lowest p-6 shadow-sm transition-all ${
        isLocked
          ? 'border-dashed border-outline-variant opacity-70'
          : 'border-outline-variant hover:shadow-md'
      }`}
    >
      {!isLocked && (
        <div
          className="absolute left-0 top-0 h-1 rounded-tl-lg bg-primary"
          style={{ width: `${Math.max(progress, track.status === 'in_progress' ? 36 : 100)}%` }}
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
          isLocked ? 'bg-surface-container text-outline' : 'bg-primary-fixed text-primary'
        }`}>
          <span className="material-symbols-outlined text-[26px]">
            {track.icon || iconByStatus[track.status]}
          </span>
        </div>

        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 label-sm ${
          isLocked
            ? 'bg-surface-container text-outline'
            : isCompleted
              ? 'bg-green-50 text-green-700'
              : 'bg-primary-fixed text-primary'
        }`}>
          <span className="material-symbols-outlined text-[15px]">
            {isLocked ? 'lock' : isCompleted ? 'check_circle' : 'sync'}
          </span>
          {isCompleted ? `${progress}%` : statusCopy[track.status]}
        </span>
      </div>

      <div className="mt-6">
        <h2 className={`headline-sm ${isLocked ? 'text-on-surface-variant' : 'text-primary'}`}>
          {track.title}
        </h2>
        <p className="mt-3 body-sm text-on-surface-variant">
          {track.description}
        </p>
      </div>

      <div className="mt-8 border-t border-outline-variant pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 label-sm text-on-surface-variant">
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              {track.estimatedTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              {track.lessonCount} lessons
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenTrack(track)}
            disabled={isLocked || isOpening}
            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 label-sm transition-colors ${
              isLocked
                ? 'cursor-not-allowed bg-surface-container text-outline'
                : track.status === 'in_progress'
                  ? 'cursor-pointer bg-primary text-on-primary hover:opacity-90'
                  : 'cursor-pointer bg-primary-fixed text-primary hover:bg-primary-fixed-dim'
            } disabled:opacity-60`}
          >
            {isOpening ? (
              <span className="material-symbols-outlined text-[18px]">progress_activity</span>
            ) : track.status === 'in_progress' ? (
              'Continue'
            ) : (
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
