'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  tracksControllerFindOne,
  lessonsControllerFindLessons,
  tracksControllerUpdate,
  lessonsControllerCreateLesson,
  lessonsControllerDeleteLesson,
} from '@/services/api-client';
import type { LessonProgressItemDto, TrackDetailDto } from '@/services/api-client';
import { useTrackDraftStore } from '@/stores/trackDraftStore';
import { sumEstimatedTimes } from '@/lib/time-utils';
import Skeleton from '@/components/ui/loading/Skeleton';
import { BasicInfoCard } from '../components/BasicInfoCard';
import { CurriculumSection } from '../components/CurriculumSection';
import { SummaryCard } from '../components/SummaryCard';
import { InstructionCard } from '../components/InstructionCard';
import { TrackPreview } from '../detail/TrackPreview';

interface TrackEditorPageProps {
  trackId: string;
}

type LessonSummaryDto = LessonProgressItemDto & {
  estimatedTime?: string | null;
  body?: string | null;
};

interface ExistingLesson extends LessonSummaryDto {
  _id: string;
  _body: string;
}

export default function TrackEditorPage({ trackId }: TrackEditorPageProps) {
  const t = useTranslations('CreateTrackPage');
  const router = useRouter();
  const { title, description, lessons, reset } = useTrackDraftStore();
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingLessons, setExistingLessons] = useState<ExistingLesson[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadTrack() {
      try {
        const [trackRes, lessonsRes] = await Promise.all([
          tracksControllerFindOne({ path: { id: trackId }, throwOnError: true }),
          lessonsControllerFindLessons({ path: { id: trackId }, throwOnError: true }),
        ]);

        if (cancelled) return;

        const track = trackRes.data as TrackDetailDto | undefined;
        const lessonList = (lessonsRes.data?.data ?? []) as LessonSummaryDto[];

        const store = useTrackDraftStore.getState();
        store.setTitle(track?.title?.trim() ?? '');
        store.setDescription(track?.description?.trim() ?? '');
        store.reorderLessons(
          lessonList
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((lesson) => ({
              title: lesson.title?.trim() ?? '',
              estimatedTime: lesson.estimatedTime?.trim() ?? '30m',
              body: '',
            }))
        );
        setExistingLessons(
          lessonList.map((lesson) => ({
            ...lesson,
            _id: lesson.id ?? '',
            _body: '',
          }))
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load track.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadTrack();
    return () => {
      cancelled = true;
    };
  }, [trackId]);

  const estimatedTime = sumEstimatedTimes(lessons.map((l) => l.estimatedTime));

  async function handleSave() {
    if (!title.trim() || lessons.length === 0) return;
    setSaving(true);

    try {
      await tracksControllerUpdate({
        path: { id: trackId },
        body: {
          title: title.trim(),
          description: description.trim(),
          estimatedTime,
        },
        throwOnError: true,
      });

      const previousLessonIds = existingLessons.map((l) => l._id).filter(Boolean);
      await Promise.all(previousLessonIds.map((id) => lessonsControllerDeleteLesson({ path: { id } })));

      await Promise.all(
        lessons.map((lesson, i) =>
          lessonsControllerCreateLesson({
            path: { id: trackId },
            body: {
              title: lesson.title,
              order: i + 1,
              estimatedTime: lesson.estimatedTime,
              body: lesson.body || '',
            },
            throwOnError: true,
          })
        )
      );

      reset();
      router.push('/admin/tracks');
    } catch {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton width={240} height={32} className="mb-6" />
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-7 space-y-6">
            <Skeleton height={200} />
            <Skeleton height={300} />
          </div>
          <div className="col-span-12 xl:col-span-5 space-y-6">
            <Skeleton height={160} />
            <Skeleton height={120} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-error-container bg-error-container/40 p-6 text-error">
          <h2 className="headline-sm">{t('loadError')}</h2>
          <p className="body-sm mt-2">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/admin/tracks')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 label-sm text-on-surface hover:bg-surface-container-low cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t('backToTracks')}
          </button>
        </div>
      </div>
    );
  }

  if (isPreview) {
    return (
      <TrackPreview
        title={title}
        description={description}
        lessons={lessons.map((l, i) => ({
          id: `draft-${i}`,
          trackId,
          title: l.title,
          order: i + 1,
          estimatedTime: l.estimatedTime,
          body: l.body,
          completed: false,
          type: 'reading',
          description: l.body || null,
        }))}
        onBackToEdit={() => setIsPreview(false)}
        onSaveTrack={handleSave}
        isSaveDisabled={!title.trim() || lessons.length === 0 || saving}
      />
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background px-2 pt-4 pb-24 lg:px-8 lg:pt-8 xl:pt-12 2xl:px-16">
      <div className="lg:max-w-[1200px] mx-auto px-gutter py-stack-lg">
        <header className="mb-stack-lg flex justify-between items-end">
          <div>
            <h2 className="headline-lg text-on-surface mb-2">{t('editTitle')}</h2>
            <p className="text-body-base text-secondary">{t('subtitle')}</p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 mx-auto">
          <div className="col-span-12 xl:col-span-7 2xl:col-span-8 space-y-6">
            <BasicInfoCard
              title={title}
              description={description}
              onTitleChange={useTrackDraftStore.getState().setTitle}
              onDescriptionChange={useTrackDraftStore.getState().setDescription}
            />
            <CurriculumSection />
          </div>

          <div className="col-span-12 xl:col-span-5 2xl:col-span-4 space-y-6">
            <SummaryCard />
            <InstructionCard ready={Boolean(title.trim())} />
          </div>
        </div>

        <footer className="fixed bottom-0 left-0 md:left-[256px] right-0 bg-surface-container-lowest border-t border-outline-variant px-gutter py-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1200px] mx-auto flex justify-between items-center">
            <button
              onClick={() => {
                reset();
                router.push('/admin/tracks');
              }}
              className="px-6 py-2 border border-outline-variant rounded-lg label-md text-secondary hover:bg-surface-variant transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPreview(true)}
                className="flex items-center gap-2 px-6 py-2 border border-primary/20 text-primary rounded-lg label-md hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                {t('previewTrack')}
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || lessons.length === 0 || saving}
                className="px-8 py-2 bg-primary text-on-primary rounded-lg label-md hover:opacity-95 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {saving ? t('saving') : t('saveTrack')}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
