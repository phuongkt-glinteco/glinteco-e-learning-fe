'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { tracksControllerCreate } from '@/services/api-client';
import type { TrackDetailDto, TrackSummaryDto } from '@/services/api-client';
import { queryCache } from '@/lib/queryCache';
import { useTrackDraftStore } from '@/stores/trackDraftStore';
import { UiShowError } from '@/services/errors';
import { BasicInfoCard } from './components/BasicInfoCard';
import { InstructionCard } from './components/InstructionCard';
import { TrackPicker } from './components/TrackPicker';
import { CreateTrackSummaryCard } from './components/CreateTrackSummaryCard';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import { DynamicBreadcrumbs } from '@/components/ui/containers/DynamicBreadcrumbs';

export default function CreateTrackPage() {
  const t = useTranslations('CreateTrackPage');
  const router = useRouter();
  const resetDraft = useTrackDraftStore((state) => state.reset);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previousTrack, setPreviousTrack] = useState<TrackSummaryDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pushNode, setTree, tree } = useBreadcrumbStore();

  useEffect(() => {
    if (tree.length === 0) {
      setTree([{ label: t('breadcrumbTracks', { defaultValue: 'Tracks' }), href: '/admin/tracks' }]);
    }
    pushNode({ label: t('title', { defaultValue: 'Create Track' }), href: window.location.pathname });
  }, [setTree, pushNode, tree.length]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const res = await tracksControllerCreate({
        body: {
          title: title.trim(),
          description: description.trim(),
          estimatedTime: '0m',
          lessonCount: 0,
          afterTrackId: previousTrack?.id || undefined,
        },
        throwOnError: true,
      });

      const created = res.data as Partial<TrackDetailDto> | undefined;
      if (!created?.id) {
        setError('Unexpected response: missing track ID');
        setSaving(false);
        return;
      }

      queryCache.set(`track-detail-${created.id}`, {
        track: {
          id: created.id,
          title: created.title ?? title.trim(),
          description: created.description ?? description.trim(),
          estimatedTime: created.estimatedTime ?? '0m',
          order: created.order ?? 0,
          icon: created.icon ?? 'school',
          status: created.status ?? 'in_progress',
          lessonsCompleted: created.lessonsCompleted ?? 0,
          lessons: created.lessons ?? [],
          level: created.level ?? '',
          thumbnail: created.thumbnail ?? null,
          accessStatus: created.accessStatus ?? 'unlocked',
          lockedReason: created.lockedReason ?? null,
          currentLessonId: created.currentLessonId ?? null,
          prevTrack: created.prevTrack ?? null,
          nextTrack: created.nextTrack ?? null,
        },
        exercises: [],
      });
      resetDraft();
      router.push(`/admin/tracks/${created.id}`);
    } catch (e) {
      setError(e instanceof UiShowError ? e.errorCode : t('createFailed'));
      setSaving(false);
    }
  }

  function handleCancel() {
    resetDraft();
    router.push('/admin/tracks');
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background px-2 pt-4 pb-24 lg:px-8 lg:pt-8 xl:pt-12 2xl:px-16">
      <div className=" mx-auto px-gutter py-stack-lg">
        <div className="mb-4">
          <DynamicBreadcrumbs />
        </div>
        <header className="mb-stack-lg mb-6">
          <h2 className="headline-lg text-on-surface mb-2">{t('title')}</h2>
          <p className="text-body-base text-secondary">{t('subtitle')}</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg border border-error flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <p className="text-body-sm">{error}</p>
          </div>
        )}

        <div className="m-0 space-y-6 lg:max-w-[800px] xl:max-w-[960px] 2xl:max-w-[calc(100%-32px)] 2xl:grid-cols-2 grid grid-cols-1  gap-6">
          <BasicInfoCard
            title={title}
            description={description}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
          />
          <TrackPicker
            selectedTrackId={previousTrack?.id ?? ''}
            onSelectTrack={setPreviousTrack}
          />
          <div className="flex flex-col 2xl:col-span-2 gap-6">
            <CreateTrackSummaryCard
              title={title}
              description={description}
              previousTrackTitle={previousTrack?.title}
            />
            <InstructionCard ready={title.trim().length > 0} />
          </div>
        </div>

        <footer className="fixed bottom-0 left-0 md:left-[256px] right-0 bg-surface-container-lowest border-t border-outline-variant px-gutter py-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-[760px] mx-auto flex justify-between items-center">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-outline-variant rounded-lg label-md text-secondary hover:bg-surface-variant transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="px-8 py-2 bg-primary text-on-primary rounded-lg label-md hover:opacity-95 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {saving ? t('saving') : t('createTrack')}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
