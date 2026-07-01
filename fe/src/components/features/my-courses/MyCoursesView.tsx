import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { LearnerTrack } from '@/components/features/tracks/learner/types';
import { MyCourseCard } from './MyCourseCard';
import type { MyCourseTab } from './types';
import { Button } from '@/components/ui/default/button';

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
          <h1 className="text-[32px] font-bold text-primary">{t('title')}</h1>
          <p className="mt-2 text-[16px] text-on-surface-variant">{t('subtitle')}</p>
        </header>
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline">school</span>
          <h2 className="mt-2 text-[20px] font-semibold text-on-surface">{t('emptyTitle')}</h2>
          <p className="mt-1 text-[14px] text-on-surface-variant">{t('emptyDescription')}</p>
          <Button asChild className="mt-4 gap-2">
            <Link href="/tracks">
              <span className="material-symbols-outlined text-[16px]">route</span>
              {t('exploreTracks')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const countForTab = activeTab === 'in_progress' ? inProgressCount : completedCount;

  return (
    <div className="mx-auto max-w-container-max px-gutter py-8">
      <header className="mb-6">
        <h1 className="text-[32px] font-bold text-primary">{t('title')}</h1>
        <p className="mt-2 text-[16px] text-on-surface-variant">{t('subtitle')}</p>
      </header>

      <div className="mb-6 flex gap-2 rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-2 shadow-sm w-fit">
        {tabs.map((tab) => {
          const active = activeTab === tab.value;
          const count = tab.value === 'in_progress' ? inProgressCount : completedCount;
          return (
            <Button
              key={tab.value}
              variant={active ? "default" : "ghost"}
              onClick={() => onTabChange(tab.value)}
              className={`rounded-full px-4 py-1.5 h-8 text-[14px] ${active ? 'bg-white text-primary shadow-sm ring-1 ring-primary/20 hover:bg-white hover:text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              {t(tab.labelKey)}
              <span
                className={`ml-1 rounded-full px-1.5 text-[11px] font-bold ${
                  active ? 'bg-primary/10 text-primary' : 'bg-surface-container-low'
                }`}
              >
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline">
            {activeTab === 'in_progress' ? 'play_circle' : 'workspace_premium'}
          </span>
          <h2 className="mt-2 text-[20px] font-semibold text-on-surface">
            {activeTab === 'in_progress'
              ? t('emptyInProgressTitle')
              : t('emptyCompletedTitle')}
          </h2>
          <p className="mt-1 text-[14px] text-on-surface-variant">
            {activeTab === 'in_progress'
              ? t('emptyInProgressDescription')
              : t('emptyCompletedDescription')}
          </p>
          {activeTab === 'in_progress' && (
            <Button asChild variant="outline" className="mt-4 gap-2">
              <Link href="/tracks">
                <span className="material-symbols-outlined text-[16px]">route</span>
                {t('exploreTracks')}
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-[14px] font-medium text-on-surface-variant">
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
