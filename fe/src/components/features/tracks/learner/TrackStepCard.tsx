import { Icon } from '@iconify/react';
import HPBar from '@/components/ui/HPBar';
import { StatusBadge, TimeBadge } from '@/components/ui/Badge';
import type { LearnerTrack } from './types';

interface TrackStepCardProps {
  track: LearnerTrack;
  index: number;
  isLast: boolean;
  isOpening: boolean;
  onOpenTrack: (track: LearnerTrack) => void;
}

export function TrackStepCard({
  track,
  index,
  isLast,
  isOpening,
  onOpenTrack,
}: TrackStepCardProps) {
  const isLocked = track.status === 'locked';
  const isInProgress = track.status === 'in_progress';
  const isCompleted = track.status === 'completed';
  const progressPercent = track.lessonCount > 0
    ? Math.round((track.lessonsCompleted / track.lessonCount) * 100)
    : 0;

  return (
    <div className="flex gap-4 relative">
      {/* Rail and Status Icon Indicator */}
      <div className="flex flex-col items-center w-14 shrink-0">
        <div
          className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all shadow-sm ${
            isLocked
              ? 'bg-slate-100 border-slate-300 text-slate-400'
              : isInProgress
                ? 'bg-white border-amber-500 text-amber-600 ring-4 ring-amber-100 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'bg-white border-green-500 text-green-600'
          }`}
        >
          <Icon
            icon={
              isLocked
                ? 'lucide:lock'
                : isCompleted
                  ? 'lucide:check-circle-2'
                  : 'lucide:play-circle'
            }
            className="w-6 h-6"
          />
        </div>
        {/* Stepper rail line between milestones */}
        {isLast ? (
          <div className="w-1 flex-1 bg-slate-200 border-dashed border-l border-slate-300 min-h-[32px] my-1" />
        ) : (
          <div
            className={`w-1 flex-1 min-h-[40px] my-1 ${
              isCompleted ? 'bg-green-300' : 'bg-slate-200 border-dashed border-l border-slate-300'
            }`}
          />
        )}
      </div>

      {/* Track Content Card */}
      <div
        className={`flex-1 bg-surface border border-outline-variant rounded-lg p-5 mb-6 transition-all ${
          isLocked ? 'opacity-70' : 'hover:shadow-md'
        }`}
      >
        <div className="flex justify-between items-start gap-3 flex-wrap">
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
              Milestone {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-lg font-bold text-on-surface mt-0.5">{track.title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <TimeBadge time={track.estimatedTime} />
            <StatusBadge status={track.status} />
          </div>
        </div>

        <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
          {track.description}
        </p>

        {isInProgress && track.lessonCount > 0 && (
          <div className="mt-4 max-w-[380px]">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-on-surface-variant">
                Lesson {track.lessonsCompleted}/{track.lessonCount}
              </span>
              <span className="text-amber-700">{progressPercent}%</span>
            </div>
            <HPBar value={progressPercent} segments={track.lessonCount * 3} warn />
          </div>
        )}

        <div className="flex justify-between items-center gap-4 mt-5 pt-4 border-t border-slate-100 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
            <Icon icon="lucide:book-open" className="w-3.5 h-3.5 text-primary" />
            {track.lessonCount} lessons
          </span>

          <button
            type="button"
            onClick={() => onOpenTrack(track)}
            disabled={isLocked || isOpening}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer select-none ${
              isLocked
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                : isCompleted
                  ? 'bg-white border border-outline text-primary hover:bg-slate-50'
                  : 'bg-primary text-white hover:bg-blue-700 shadow-sm'
            } disabled:opacity-60`}
          >
            {isOpening ? (
              <Icon icon="lucide:loader-2" className="w-3.5 h-3.5 animate-spin" />
            ) : isCompleted ? (
              <>
                <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
                Review
              </>
            ) : isInProgress ? (
              <>
                <Icon icon="lucide:play" className="w-3.5 h-3.5 fill-current" />
                Continue
              </>
            ) : (
              <>
                <Icon icon="lucide:lock" className="w-3.5 h-3.5" />
                Locked
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
