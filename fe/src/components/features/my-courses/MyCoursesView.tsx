import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { LearnerTrack } from '@/components/features/tracks/learner/types';
import { MyCourseCard } from './MyCourseCard';
import type { MyCourseTab } from './types';

interface MyCoursesViewProps {
  tracks: LearnerTrack[];
  activeTab: MyCourseTab;
  inProgressCount: number;
  completedCount: number;
  hasAnyActiveCourse: boolean;
  onTabChange: (tab: MyCourseTab) => void;
  onOpen: (trackId: string, currentLessonId: string | null) => void;
}

const tabs: { value: MyCourseTab; labelKey: string; icon: string }[] = [
  { value: 'in_progress', labelKey: 'tab_in_progress', icon: 'play_circle' },
  { value: 'completed', labelKey: 'tab_completed', icon: 'check_circle' },
];

export function MyCoursesView({
  tracks,
  activeTab,
  inProgressCount,
  completedCount,
  hasAnyActiveCourse: hasActive,
  onTabChange,
  onOpen,
}: MyCoursesViewProps) {
  const t = useTranslations('MyCoursesPage');

  if (!hasActive) {
    return (
      <div className="mx-auto max-w-container-max px-gutter py-8">
        <header className="mb-6">
          <h1 className="headline-lg text-primary">{t('title')}</h1>
          <p className="mt-2 body-md text-on-surface-variant">{t('subtitle')}</p>
        </header>
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline">school</span>
          <h2 className="mt-2 headline-sm text-on-surface">{t('emptyTitle')}</h2>
          <p className="mt-1 body-sm text-on-surface-variant">{t('emptyDescription')}</p>
          <Link
            href="/tracks"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 label-sm text-on-primary hover:opacity-90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">route</span>
            {t('exploreTracks')}
          </Link>
        </div>
      </div>
    );
  }

  const countForTab = activeTab === 'in_progress' ? inProgressCount : completedCount;

  return (
    <div className="mx-auto max-w-container-max px-gutter py-8">
      <header className="mb-6">
        <h1 className="headline-lg text-primary">{t('title')}</h1>
        <p className="mt-2 body-md text-on-surface-variant">{t('subtitle')}</p>
      </header>

      <div className="mb-6 flex gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-2 shadow-sm w-fit">
        {tabs.map((tab) => {
          const active = activeTab === tab.value;
          const count = tab.value === 'in_progress' ? inProgressCount : completedCount;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 label-sm transition-colors cursor-pointer ${
                active
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              {t(tab.labelKey)}
              <span
                className={`ml-1 rounded-full px-1.5 text-[11px] font-bold ${
                  active ? 'bg-on-primary/20' : 'bg-surface-container-low'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline">
            {activeTab === 'in_progress' ? 'play_circle' : 'workspace_premium'}
          </span>
          <h2 className="mt-2 headline-sm text-on-surface">
            {activeTab === 'in_progress'
              ? t('emptyInProgressTitle')
              : t('emptyCompletedTitle')}
          </h2>
          <p className="mt-1 body-sm text-on-surface-variant">
            {activeTab === 'in_progress'
              ? t('emptyInProgressDescription')
              : t('emptyCompletedDescription')}
          </p>
          {activeTab === 'in_progress' && (
            <Link
              href="/tracks"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 label-sm text-on-surface hover:bg-surface-container-low cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">route</span>
              {t('exploreTracks')}
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 label-sm text-on-surface-variant">
            {t('resultCount', { count: countForTab })}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tracks.map((track) => (
              <MyCourseCard key={track.id} track={track} onOpen={onOpen} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
