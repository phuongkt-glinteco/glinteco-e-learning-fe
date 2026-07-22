import { useTranslations } from 'next-intl';
import type { LearnerTrack } from './types';
import { TrackStepCard } from './TrackStepCard';
import { Card, CardContent } from '@/components/ui/default/card';
import { Badge } from '@/components/ui/default/badge';

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
  const t = useTranslations('TracksTimeline');
  const completedTracks = tracks.filter((track) => track.status === 'completed').length;
  const progress = getOverallProgress(tracks);

  return (
    <section className="mx-auto flex max-w-[920px] flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold text-primary">{t('title', { defaultValue: 'Learning Tracks' })}</h1>
        <p className="mt-2 text-base text-on-surface-variant">
          {t('description', { defaultValue: 'Follow each milestone in order, continue active lessons, and unlock the next track as you progress.' })}
        </p>
      </header>

      <Card className="bg-surface-container-lowest shadow-sm border-outline-variant">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('progressTitle', { defaultValue: 'Track Path Progress' })}
              </p>
              <p className="mt-1 text-xl font-bold text-on-surface">
                {t('milestonesCleared', { completed: completedTracks, total: tracks.length, defaultValue: `${completedTracks}/${tracks.length} milestones cleared` })}
              </p>
            </div>
            <Badge variant="secondary" className="flex w-fit items-center gap-1 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/20 border-none text-sm font-semibold">
              <span className="material-symbols-outlined text-[16px]">trophy</span>
              {t('percentComplete', { progress, defaultValue: `${progress}% complete` })}
            </Badge>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      {tracks.length === 0 ? (
        <Card className="border-dashed border-outline-variant bg-surface-container-lowest shadow-sm">
          <CardContent className="p-10 text-center">
            <h2 className="text-xl font-bold text-on-surface">{t('noTracksTitle', { defaultValue: 'No learning tracks found' })}</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              {t('noTracksDesc', { defaultValue: 'Your learning path has not been published yet.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="grid grid-cols-[56px_1fr] gap-4 pb-5">
            <div className="flex flex-col items-center">
              <span className="rounded bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-sm">
                {t('start', { defaultValue: 'Start' })}
              </span>
              <div className="mt-2 min-h-8 w-1 flex-1 rounded-full bg-outline-variant" />
            </div>
            <p className="text-sm font-medium text-on-surface-variant pt-1">
              {t('startDesc', { defaultValue: 'Begin with the first available milestone and keep moving through the track sequence.' })}
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
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-outline-variant bg-surface-container text-outline shadow-sm">
              <span className="material-symbols-outlined text-[26px]">workspace_premium</span>
            </div>
            <div className="pt-2">
              <h2 className="text-xl font-bold text-on-surface">{t('readyTitle', { defaultValue: 'Production Ready' })}</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {t('readyDesc', { defaultValue: 'Complete all milestones to finish this onboarding path.' })}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
