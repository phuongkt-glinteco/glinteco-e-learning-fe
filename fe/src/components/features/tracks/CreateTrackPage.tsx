'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { postTracks, postTracksByIdLessons } from '@/services/api-client';
import { useTrackDraftStore } from '@/stores/trackDraftStore';
import { sumEstimatedTimes } from '@/lib/time-utils';
import { BasicInfoCard } from './components/BasicInfoCard';
import { CurriculumSection } from './components/CurriculumSection';
import { SummaryCard } from './components/SummaryCard';
import { InstructionCard } from './components/InstructionCard';

export default function CreateTrackPage() {
  const t = useTranslations('CreateTrackPage');
  const router = useRouter();
  const { title, description, lessons, reset } = useTrackDraftStore();
  const [saving, setSaving] = useState(false);

  const estimatedTime = sumEstimatedTimes(lessons.map((l) => l.estimatedTime));

  async function handleSave() {
    if (!title.trim() || lessons.length === 0) return;
    setSaving(true);

    try {
      const res = await postTracks({
        body: {
          title: title.trim(),
          description: description.trim(),
          estimatedTime,
          lessonCount: lessons.length,
        },
        throwOnError: true,
      });

      const trackId = res.data?.id;
      if (!trackId) {
        router.push('/admin/tracks');
        return;
      }

      await Promise.all(
        lessons.map((lesson, i) =>
          postTracksByIdLessons({
            path: { id: trackId },
            body: {
              title: lesson.title,
              order: i + 1,
              estimatedTime: lesson.estimatedTime,
              body: '',
            },
            throwOnError: true,
          })
        )
      );

      reset();
      router.push(`/admin/tracks/${trackId}`);
    } catch {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background p-16 pb-32">
      <div className="max-w-[1200px] mx-auto px-gutter py-stack-lg">
        <header className="mb-stack-lg flex justify-between items-end">
          <div>
            <h2 className="headline-lg text-on-surface mb-2">{t('title')}</h2>
            <p className="text-body-base text-secondary">{t('subtitle')}</p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <BasicInfoCard />
            <CurriculumSection />
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
              <SummaryCard />
              <InstructionCard />
          </div>
        </div>

        <footer className="fixed bottom-0 left-0 md:left-[256px] right-0 bg-surface-container-lowest border-t border-outline-variant px-gutter py-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1200px] mx-auto flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 border border-outline-variant rounded-lg label-md text-secondary hover:bg-surface-variant transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-2 border border-primary/20 text-primary rounded-lg label-md hover:bg-primary/10 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                {t('previewTrack')}
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || lessons.length === 0 || saving}
                className="px-8 py-2 bg-primary text-on-primary rounded-lg label-md hover:opacity-95 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {saving ? t('saving') : t('createTrack')}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
