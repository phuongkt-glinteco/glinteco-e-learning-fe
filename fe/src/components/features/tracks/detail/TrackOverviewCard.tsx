'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter } from '@/components/ui/default/card';
import { Button } from '@/components/ui/default/button';

interface TrackOverviewCardProps {
  trackId: string;
  title: string;
  estimatedTime?: string;
  description?: string;
  onPreview: () => void;
}

export default function TrackOverviewCard({
  trackId,
  title,
  estimatedTime,
  description,
  onPreview,
}: TrackOverviewCardProps) {
  const t = useTranslations('TrackDetailPage');

  return (
    <Card className="border-outline-variant shadow-sm">
      <CardContent className="p-lg flex flex-col gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[32px] font-bold text-on-surface flex-grow line-clamp-3">
              {title}
            </h2>
            <div className="flex items-center gap-1 text-outline text-[14px] font-medium shrink-0 pt-2">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>{estimatedTime ? t('duration', { time: estimatedTime }) : 'N/A'}</span>
            </div>
          </div>
          <p className="text-[16px] text-on-surface-variant max-w-2xl mt-4 min-h-[40px]">
            {description || t('noDescription')}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-lg pt-6 flex flex-wrap items-center gap-3 border-t border-outline-variant">
        <Button asChild variant="outline" className="gap-2 text-primary border-primary hover:bg-primary/5">
          <Link href={`/admin/tracks/${trackId}/edit`}>
            <span className="material-symbols-outlined text-[18px]">edit</span>
            {t('editTrack')}
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={onPreview}
          className="gap-2 text-primary border-primary hover:bg-primary/5"
        >
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          {t('previewTrack')}
        </Button>
        <Button asChild variant="outline" className="gap-2 text-primary border-primary hover:bg-primary/5">
          <Link href={`/admin/tracks/${trackId}/lessons/new`}>
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            {t('addLesson')}
          </Link>
        </Button>
        <Button asChild className="gap-2 ml-auto shadow-md">
          <Link href={`/admin/tracks/${trackId}/exercises/new`}>
            <span className="material-symbols-outlined text-[18px]">fitness_center</span>
            {t('addExercise')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
