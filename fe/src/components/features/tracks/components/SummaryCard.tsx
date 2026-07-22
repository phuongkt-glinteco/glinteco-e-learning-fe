'use client';

import { useTranslations } from 'next-intl';
import { useTrackDraftStore } from '@/stores/trackDraftStore';
import { formatMinutes, parseTimeToMinutes } from '@/lib/time-utils';

export function SummaryCard({ ns = 'CreateTrackPage', exerciseCount = 0 }: { ns?: string; exerciseCount?: number }) {
  const t = useTranslations(ns);
  const tu = useTranslations('TimeUnit');
  const { title, lessons } = useTrackDraftStore();
  const totalMin = lessons.reduce((sum, l) => sum + parseTimeToMinutes(l.estimatedTime), 0);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      <div className="h-24 bg-gradient-to-br from-primary to-secondary relative flex items-end p-6">
        <span className="relative z-10 px-2 py-0.5 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded text-[10px] uppercase font-bold tracking-widest">
          {t('liveSummary')}
        </span>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="label-sm text-secondary uppercase tracking-wider mb-1">{t('trackSummary')}</p>
            <p className="headline-sm text-on-surface" id="summary-title">
              {title || t('untitledTrack')}
            </p>
          </div>
          <span className="px-2 py-1 bg-surface-container-low text-on-surface-variant rounded text-label-sm font-medium">
            {t('draft')}
          </span>
        </div>

        <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center mt-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
            </div>
            <div>
              <p className="label-md text-label-md">{t('details')}</p>
              <p className="text-body-sm text-secondary">
                {title || t('basicInfoPending')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${lessons.length > 0 ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'}`}>
              <span className="material-symbols-outlined text-[14px]">list</span>
            </div>
            <div>
              <p className={`label-md text-label-md ${lessons.length === 0 ? 'text-secondary' : ''}`}>{t('curriculum')}</p>
              <p className="text-body-sm text-secondary/60">
                {lessons.length} {lessons.length === 1 ? t('lesson_one') : t('lesson_other')} {t('included')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${lessons.length > 0 || exerciseCount > 0 ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'}`}>
              <span className="material-symbols-outlined text-[14px]">list_alt</span>
            </div>
            <div>
              <p className={`label-md text-label-md ${lessons.length === 0 && exerciseCount === 0 ? 'text-secondary' : ''}`}>{t('exercises')}</p>
              <p className="text-body-sm text-secondary/60">
                {lessons.length} {t(lessons.length === 1 ? 'lesson_one' : 'lesson_other')} & {exerciseCount} {t(exerciseCount === 1 ? 'exercise_one' : 'exercise_other')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-outline-variant space-y-4">
          <div className="flex justify-between items-center text-body-sm">
            <span className="text-secondary">{t('totalDuration')}</span>
            <span className="font-medium">{formatMinutes(totalMin, tu)}</span>
          </div>
          <div className="flex justify-between items-center text-body-sm">
            <span className="text-secondary">{t('lessonCount')}</span>
            <span className="font-medium">{lessons.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
