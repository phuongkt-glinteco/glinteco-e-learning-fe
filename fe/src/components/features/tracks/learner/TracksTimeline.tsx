import { Icon } from '@iconify/react';
import HPBar from '@/components/ui/HPBar';
import SectionHead from '@/components/ui/head/SectionHead';
import type { LearnerTrack } from './types';
import { TrackStepCard } from './TrackStepCard';

interface TracksTimelineProps {
  tracks: LearnerTrack[];
  openingTrackId: string | null;
  isUsingMockData: boolean;
  fallbackMessage: string | null;
  onOpenTrack: (track: LearnerTrack) => void;
}

export function TracksTimeline({
  tracks,
  openingTrackId,
  isUsingMockData,
  fallbackMessage,
  onOpenTrack,
}: TracksTimelineProps) {
  const completedTracksCount = tracks.filter((t) => t.status === 'completed').length;
  const progressPercent = tracks.length > 0
    ? Math.round((completedTracksCount / tracks.length) * 100)
    : 0;

  return (
    <div className="max-w-[720px] mx-auto py-4">
      <SectionHead kicker="Core Knowledge" title="Learning Tracks">
        <div className="flex items-center gap-2 flex-wrap">
          {isUsingMockData && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Icon icon="lucide:flask-conical" className="w-3.5 h-3.5" />
              Sample data
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary border border-secondary/20 shadow-sm">
            <Icon icon="lucide:trophy" className="w-3.5 h-3.5" />
            {completedTracksCount}/{tracks.length} cleared
          </span>
        </div>
      </SectionHead>

      {fallbackMessage && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
          {fallbackMessage}
        </div>
      )}

      <div className="bg-surface border border-outline-variant shadow-sm rounded-lg p-md mb-lg flex items-center gap-md flex-wrap">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Icon icon="lucide:map" className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="text-xs font-semibold text-on-surface-variant mb-1.5">
            Track Path Progress
          </div>
          <HPBar value={progressPercent} segments={Math.max(tracks.length * 4, 12)} />
        </div>
        <div className="text-xs font-black text-primary uppercase select-none">
          {progressPercent}% COMPLETE
        </div>
      </div>

      <div className="space-y-0 relative">
        {/* Start Node */}
        <div className="flex gap-4 items-start relative pb-6">
          <div className="flex flex-col items-center w-14 shrink-0">
            <span className="px-2.5 py-1 text-[10px] font-black tracking-wider bg-secondary text-white rounded shadow-sm">
              START
            </span>
            <div className="w-1 flex-1 bg-slate-200 border-dashed border-l border-slate-300 min-h-[24px] mt-2" />
          </div>
          <div className="pt-0.5">
            <p className="text-sm font-semibold text-on-surface-variant">
              Your journey to production-ready, one milestone at a time.
            </p>
          </div>
        </div>

        {/* Track Nodes */}
        {tracks.map((track, idx) => (
          <TrackStepCard
            key={track.id}
            track={track}
            index={idx}
            isLast={idx === tracks.length - 1}
            isOpening={openingTrackId === track.id}
            onOpenTrack={onOpenTrack}
          />
        ))}

        {/* Finish Node */}
        <div className="flex gap-4 items-start pt-2">
          <div className="flex items-center justify-center w-14 h-14 shrink-0 rounded-xl bg-slate-100 border-2 border-slate-300 text-slate-400">
            <Icon icon="lucide:award" className="w-6 h-6" />
          </div>
          <div className="pt-2">
            <h4 className="font-bold text-on-surface">Production Ready</h4>
            <p className="text-xs font-semibold text-on-surface-variant mt-0.5">
              Ship your first feature to main
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
