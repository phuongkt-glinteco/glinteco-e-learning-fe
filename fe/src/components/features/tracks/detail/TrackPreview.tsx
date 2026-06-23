'use client';

import { useTranslations } from 'next-intl';
import { sumEstimatedTimes } from '@/lib/time-utils';
import type { LessonDetail, ExerciseSummary } from '@/services/api-client';
import { PreviewBanner } from './PreviewBanner';
import { TrackHero } from './TrackHero';
import { CourseRoadmap } from './CourseRoadmap';
import { TrackExercisesCard } from './TrackExercisesCard';
import { PrerequisitesCard } from './PrerequisitesCard';
import { PotentialRewardsCard } from './PotentialRewardsCard';
import { PreviewFooter } from './PreviewFooter';

interface TrackPreviewProps {
  title: string;
  description: string;
  lessons: LessonDetail[];
  exercises?: ExerciseSummary[];
  onBackToEdit: () => void;
  onSaveTrack?: () => void;
  isSaveDisabled?: boolean;
  prerequisites?: string[];
}



export function TrackPreview({
  title,
  description,
  lessons = [],
  exercises,
  prerequisites,
  onBackToEdit,
  onSaveTrack,
  isSaveDisabled = true,
}: TrackPreviewProps) {
  const t = useTranslations('TrackPreview');
  const estimatedTime = sumEstimatedTimes(lessons.map((l) => l.estimatedTime || '0m'));
  const totalXP = lessons.length * 800; // 800 XP per lesson, matching the static UI example (3 lessons * 800 = 2400)

  // Use passed exercises if provided (e.g. from existing track detail), otherwise fallback to default mock ones for draft preview
  const displayExercises = exercises;

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* PREVIEW MODE BANNER */}
      <PreviewBanner />

      {/* Main Content Area */}
      <main className="flex-1 p-margin-mobile md:p-gutter max-w-[1200px] mx-auto w-full pb-32">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 font-label-md text-label-md text-on-surface-variant">
          <span className="hover:text-primary transition-colors cursor-pointer">Tracks</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">{title || 'Untitled Track'}</span>
        </nav>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 flex flex-col gap-xl">
            {/* Hero Section */}
            <TrackHero
              title={title}
              description={description}
              estimatedTime={estimatedTime}
              onStartTrack={() => alert(t('startTrackDisabled'))}
            />

            {/* Course Roadmap */}
            <CourseRoadmap lessons={lessons} />
          </div>

          {/* Right Column (Sidebar Cards) */}
          <div className="lg:col-span-4 flex flex-col gap-md">
            <TrackExercisesCard exercises={displayExercises} />
            <PrerequisitesCard prerequisites={prerequisites} />
            <PotentialRewardsCard xp={totalXP || 2400} />
          </div>
        </div>
      </main>

      {/* FIXED BOTTOM ACTION BAR */}
      <PreviewFooter
        onBackToEdit={onBackToEdit}
        onSaveTrack={onSaveTrack}
        isSaveDisabled={isSaveDisabled}
      />
    </div>
  );
}
