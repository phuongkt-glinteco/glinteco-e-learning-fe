'use client';

import { useTranslations } from 'next-intl';



interface PrerequisitesCardProps {
  prerequisites?: String[];
}

export function PrerequisitesCard({
  prerequisites,
}: PrerequisitesCardProps) {
  const t = useTranslations('TrackPreview');

  const list = prerequisites || [];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-primary">verified</span>
        <h3 className="font-headline-sm text-[18px] text-on-surface">{t('prerequisitesTitle')}</h3>
      </div>
      {list.length < 1 && (
        <p className="text-on-surface-variant text-[14px]">{t('noPrerequisites')}</p>
      ) }
      <ul className="flex flex-col gap-3">
        {list.map((prereq, index) => (
          <li
            key={index}
            className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">
              { 'terminal'}
            </span>
            <div className="flex-1">
              <p className="font-label-md text-label-md text-on-surface">
                {prereq}
              </p>
              {/* {prereq.isCompleted && (
                <p className="text-[10px] text-tertiary flex items-center gap-1 font-bold">
                  <span
                    className="material-symbols-outlined text-[12px]"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    check_circle
                  </span>
                  {t('verifiedCompleted')}
                </p>
              )} */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
