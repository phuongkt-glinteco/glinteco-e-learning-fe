'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/utils/api';
import SectionHead from '@/components/ui/head/SectionHead';
import HPBar from '@/components/ui/HPBar';
import { StatusBadge, TimeBadge } from '@/components/ui/Badge';
import { Icon } from '@iconify/react';

interface TrackProgress {
  lessonsCompleted: number;
  status: 'locked' | 'in_progress' | 'completed';
}

interface Track {
  id: string;
  name: string;
  order: number;
  lessonsCount: number;
  progress: TrackProgress;
}

export default function CoursesPage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const res = await apiClient.get<{ data: Track[] }>('/tracks');
        setTracks(res.data || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch tracks');
      } finally {
        setLoading(false);
      }
    }
    fetchTracks();
  }, []);

  const handleStartTrack = async (trackId: string) => {
    try {
      const response = await apiClient.get<{ data: any[] }>(`/tracks/${trackId}/lessons`);
      const lessons = response.data || [];
      if (lessons.length > 0) {
        // Find first incomplete lesson, or default to the first one
        const nextLesson = lessons.find((l) => !l.isCompleted) || lessons[0];
        router.push(`/tracks/${trackId}/lessons/${nextLesson.id}`);
      } else {
        alert('This track has no lessons yet.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load track lessons.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary" />
        <p className="text-on-surface-variant text-sm mt-2 font-medium">Loading tracks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-lg bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-2xl mx-auto my-8">
        <h3 className="font-bold flex items-center gap-2">
          <Icon icon="lucide:alert-circle" /> Error loading tracks
        </h3>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const completedTracksCount = tracks.filter((t) => t.progress.status === 'completed').length;
  const progressPercent = tracks.length > 0 ? Math.round((completedTracksCount / tracks.length) * 100) : 0;

  return (
    <div className="max-w-[720px] mx-auto py-4">
      <SectionHead kicker="Core Knowledge" title="Learning Tracks">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary border border-secondary/20 shadow-sm">
          <Icon icon="lucide:trophy" className="w-3.5 h-3.5" />
          {completedTracksCount}/{tracks.length} cleared
        </span>
      </SectionHead>

      {/* overview bar */}
      <div className="bg-surface border border-outline-variant shadow-sm rounded-lg p-md mb-lg flex items-center gap-md flex-wrap">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Icon icon="lucide:map" className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="text-xs font-semibold text-on-surface-variant mb-1.5">Track Path Progress</div>
          <HPBar value={progressPercent} segments={Math.max(tracks.length * 4, 12)} />
        </div>
        <div className="text-xs font-black text-primary uppercase select-none">{progressPercent}% COMPLETE</div>
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
        {tracks.map((track, idx) => {
          const status = track.progress.status;
          const isLocked = status === 'locked';
          const isInProgress = status === 'in_progress';
          const isCompleted = status === 'completed';

          // Est time fallback or calculation (e.g. 1h per lesson)
          const estTime = `${track.lessonsCount * 1}h`;

          return (
            <div key={track.id} className="flex gap-4 relative">
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
                {idx < tracks.length - 1 && (
                  <div
                    className={`w-1 flex-1 min-h-[40px] my-1 ${
                      isCompleted ? 'bg-green-300' : 'bg-slate-200 border-dashed border-l border-slate-300'
                    }`}
                  />
                )}
                {idx === tracks.length - 1 && (
                  <div className="w-1 flex-1 bg-slate-200 border-dashed border-l border-slate-300 min-h-[32px] my-1" />
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
                      Milestone {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg font-bold text-on-surface mt-0.5">{track.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <TimeBadge time={estTime} />
                    <StatusBadge status={status} />
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Track covers essential materials and practical exercises for {track.name}.
                </p>

                {/* HP Progress bar inside the active track card */}
                {isInProgress && track.lessonsCount > 0 && (
                  <div className="mt-4 max-w-[380px]">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-on-surface-variant">
                        Lesson {track.progress.lessonsCompleted}/{track.lessonsCount}
                      </span>
                      <span className="text-amber-700">
                        {Math.round((track.progress.lessonsCompleted / track.lessonsCount) * 100)}%
                      </span>
                    </div>
                    <HPBar
                      value={(track.progress.lessonsCompleted / track.lessonsCount) * 100}
                      segments={track.lessonsCount * 3}
                      warn
                    />
                  </div>
                )}

                <div className="flex justify-between items-center gap-4 mt-5 pt-4 border-t border-slate-100 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
                    <Icon icon="lucide:book-open" className="w-3.5 h-3.5 text-primary" />
                    {track.lessonsCount} lessons
                  </span>

                  <button
                    onClick={() => handleStartTrack(track.id)}
                    disabled={isLocked}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer select-none ${
                      isLocked
                        ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                        : isCompleted
                        ? 'bg-white border border-outline text-primary hover:bg-slate-50'
                        : 'bg-primary text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    {isCompleted ? (
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
        })}

        {/* Finish Node */}
        <div className="flex gap-4 items-start pt-2">
          <div className="flex items-center justify-center w-14 h-14 shrink-0 rounded-xl bg-slate-100 border-2 border-slate-300 text-slate-400">
            <Icon icon="lucide:award" className="w-6 h-6" />
          </div>
          <div className="pt-2">
            <h4 className="font-bold text-on-surface">Production Ready</h4>
            <p className="text-xs font-semibold text-on-surface-variant mt-0.5">
              Ship your first feature to main 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}