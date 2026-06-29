import type { LearnerTrack } from './types';
import { TrackStepCard } from './TrackStepCard';

interface TracksTimelineProps {
  tracks: LearnerTrack[];
  openingTrackId: string | null;
  onOpenTrack: (track: LearnerTrack) => void;
}

function getOverallProgress(tracks: LearnerTrack[]) {
  if (tracks.length === 0) return 0;
  const completed = tracks.filter((track) => track.status === 'completed').length;
  return Math.round((completed / tracks.length) * 100);
}

export function TracksTimeline({
  tracks,
  openingTrackId,
  onOpenTrack,
}: TracksTimelineProps) {
  const completedTracks = tracks.filter((track) => track.status === 'completed').length;
  const progress = getOverallProgress(tracks);

  return (
    <section className="mx-auto flex max-w-[920px] flex-col gap-6 px-gutter py-8">
      <header>
        <h1 className="headline-lg text-primary">Learning Tracks</h1>
        <p className="mt-2 body-md text-on-surface-variant">
          Follow each milestone in order, continue active lessons, and unlock the next track as you progress.
        </p>
      </header>

      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label-sm uppercase text-on-surface-variant">
              Track Path Progress
            </p>
            <p className="mt-1 headline-sm text-on-surface">
              {completedTracks}/{tracks.length} milestones cleared
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary-fixed px-3 py-1 label-sm text-primary">
            <span className="material-symbols-outlined text-[16px]">trophy</span>
            {progress}% complete
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <h2 className="headline-sm text-on-surface">No learning tracks found</h2>
          <p className="mt-2 body-sm text-on-surface-variant">
            Your learning path has not been published yet.
          </p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-[56px_1fr] gap-4 pb-5">
            <div className="flex flex-col items-center">
              <span className="rounded bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                Start
              </span>
              <div className="mt-2 min-h-8 w-1 flex-1 rounded-full bg-outline-variant" />
            </div>
            <p className="body-sm text-on-surface-variant">
              Begin with the first available milestone and keep moving through the track sequence.
            </p>
          </div>

          {tracks.map((track, index) => (
            <TrackStepCard
              key={track.id}
              track={track}
              index={index}
              isLast={index === tracks.length - 1}
              isOpening={openingTrackId === track.id}
              onOpenTrack={onOpenTrack}
            />
          ))}

          <div className="grid grid-cols-[56px_1fr] gap-4 pt-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-outline-variant bg-surface-container text-outline">
              <span className="material-symbols-outlined text-[26px]">workspace_premium</span>
            </div>
            <div className="pt-2">
              <h2 className="headline-sm text-on-surface">Production Ready</h2>
              <p className="mt-1 body-sm text-on-surface-variant">
                Complete all milestones to finish this onboarding path.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
