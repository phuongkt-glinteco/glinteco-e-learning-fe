'use client';

import { useTranslations } from 'next-intl';
import { sumEstimatedTimes } from '@/lib/time-utils';
import type { ExerciseSummaryDto, TrackDetail } from '@/services/api-client';
import { TrackHero } from './TrackHero';
import { CourseRoadmap } from './CourseRoadmap';
import { TrackExercisesCard } from './TrackExercisesCard';
import { PrerequisitesCard } from './PrerequisitesCard';
import { PotentialRewardsCard } from './PotentialRewardsCard';

interface AdminTrackPreviewProps {
  track: TrackDetail;
  exercises: ExerciseSummaryDto[];
  onBack: () => void;
}

function getAdjacentTrackTitle(track: TrackDetail['prevTrack'] | TrackDetail['nextTrack']) {
  if (track && typeof track === 'object' && 'title' in track && typeof track.title === 'string') {
    return track.title;
  }
  return '';
}

export default function AdminTrackPreview({ track, exercises, onBack }: AdminTrackPreviewProps) {
  const t = useTranslations('TrackPreview');
  const td = useTranslations('TrackDetailPage');
  const lessons = [...(track.lessons ?? [])].sort((a, b) => a.order - b.order);

  const estimatedTime = track.estimatedTime || sumEstimatedTimes(lessons.map((l) => l.estimatedTime || '0m'));
  const totalXP = lessons.length * 800;

  const prevTrackMapped = track.prevTrack
    ? {
        title: getAdjacentTrackTitle(track.prevTrack),
        status: 'completed' as const,
      }
    : undefined;

  const nextTrackMapped = track.nextTrack
    ? {
        title: getAdjacentTrackTitle(track.nextTrack),
        status: 'locked' as const,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans">
      {/* Admin Sticky Header */}
      <div className="sticky top-0 z-40 bg-primary text-on-primary border-b border-primary px-gutter py-3 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-label-md">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            {td('previewMode')}
          </div>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-on-primary text-primary rounded-lg font-label-md hover:opacity-90 transition-opacity cursor-pointer border-0"
          >
            {td('backToManage')}
          </button>
        </div>
      </div>


      {/* Main Content Area */}
      <main className="flex-1 p-margin-mobile md:p-gutter max-w-[1200px] mx-auto w-full pb-32">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 font-label-md text-label-md text-on-surface-variant">
          <span className="hover:text-primary transition-colors cursor-pointer">{t('breadcrumbsTracks') || 'Tracks'}</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">{track.title || t('untitledTrack')}</span>
        </nav>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 flex flex-col gap-xl">
            {/* Hero Section */}
            <TrackHero
              title={track.title}
              description={track.description}
              estimatedTime={estimatedTime}
              onStartTrack={() => alert(t('startTrackDisabled'))}
            />

            {/* Course Roadmap */}
            <CourseRoadmap lessons={lessons} />
          </div>

          {/* Right Column (Sidebar Cards) */}
          <div className="lg:col-span-4 flex flex-col gap-md">
            <TrackExercisesCard exercises={exercises} />
            <PrerequisitesCard
              prevTrack={prevTrackMapped}
              nextTrack={nextTrackMapped}
              currentTitle={track.title || t('untitledTrack')}
              progress={0}
              totalXP={totalXP || 2400}
            />
            <PotentialRewardsCard xp={totalXP || 2400} />
          </div>
        </div>
      </main>
    </div>
  );
}
