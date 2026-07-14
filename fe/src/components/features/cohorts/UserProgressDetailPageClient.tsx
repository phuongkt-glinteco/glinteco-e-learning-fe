'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/default/breadcrumb';
import { Avatar, AvatarFallback } from '@/components/ui/default/avatar';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';
import { Card } from '@/components/ui/default/card';
import Skeleton from '@/components/ui/loading/Skeleton';
import { CohortUserProgressTimeline } from './CohortUserProgressTimeline';
import {
  cohortControllerGetUsersProgress,
  type CohortUserProgressItemDto,
} from '@/services/api-client';
import { getLearnerProgressMetrics } from '@/lib/cohort-progress';

interface UserProgressDetailPageClientProps {
  userId: string;
}

export function UserProgressDetailPageClient({ userId }: UserProgressDetailPageClientProps) {
  const t = useTranslations('CohortDetailPage');
  const searchParams = useSearchParams();
  const cohortId = searchParams.get('cohortId') || 'cohort-1';

  const [learner, setLearner] = useState<CohortUserProgressItemDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchLearnerDetail() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await cohortControllerGetUsersProgress({
          path: { id: cohortId },
        });
        const found = response.data?.data?.find(
          (u) => u.userId === userId || u.userId.toLowerCase() === userId.toLowerCase()
        );
        if (isMounted) {
          setLearner(found || response.data?.data?.[0] || null);
        }
      } catch {
        if (isMounted) setError(t('errorLearnersTitle'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchLearnerDetail();
    return () => {
      isMounted = false;
    };
  }, [cohortId, userId, t]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64 rounded" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !learner) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
        <Icon icon="lucide:alert-circle" className="w-10 h-10 text-amber-500 mb-3" />
        <h3 className="text-lg font-bold text-on-surface mb-1">
          {error || t('errorLearnerNotFound')}
        </h3>
        <Link href="/admin/progress" className="mt-4">
          <Button variant="default" className="gap-2 text-xs">
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
            <span>{t('backToList')}</span>
          </Button>
        </Link>
      </div>
    );
  }

  const hue = typeof learner.avatarHue === 'number' ? learner.avatarHue : 210;
  const initial = (learner.name || 'U').charAt(0).toUpperCase();
  const { totalLessonsCount, completedLessonsCount, overallProgressPct } = getLearnerProgressMetrics(learner);

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/progress" className="hover:text-primary font-medium">
                  {t('viewProgressAction')}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold text-on-surface">
                {learner.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* 2. Learner Profile Hero Banner */}
      <Card className="relative overflow-hidden border-outline-variant bg-gradient-to-r from-surface-container/80 via-surface to-surface-container/40 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500" />
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar size="lg" className="w-16 h-16 ring-4 ring-primary/20 shadow-lg">
              <AvatarFallback
                className="text-white font-black text-xl"
                style={{ backgroundColor: `hsl(${hue}, 65%, 50%)` }}
              >
                {initial}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-on-surface tracking-tight">
                  {learner.name}
                </h1>
                <Badge variant="outline" className="text-xs font-bold bg-surface px-2.5 py-0.5">
                  {(learner as Record<string, any>).title || (learner as Record<string, any>).role || t('learnerRole')}
                </Badge>
              </div>
              <p className="text-sm text-on-surface-variant font-medium">
                {learner.email}
              </p>
            </div>
          </div>

          {/* Level & Streak Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
              <Icon icon="lucide:award" className="w-5 h-5" />
              <span>Lv. {learner.level} ({learner.xp.toLocaleString()} XP)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 border-outline-variant bg-surface space-y-1.5 shadow-sm">
          <div className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">
            {t('modalOverallPct')}
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-primary">
              {Math.round(overallProgressPct)}%
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">
              {completedLessonsCount} / {totalLessonsCount}
            </span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, overallProgressPct))}%` }}
            />
          </div>
        </Card>

        <Card className="p-5 border-outline-variant bg-surface space-y-1.5 shadow-sm">
          <div className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">
            {t('modalCompletedLessons')}
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-on-surface">
              {completedLessonsCount}
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">
              {t('outOfTotalLessons', { total: totalLessonsCount })}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant/80 pt-1">
            {t('completedLessonsSubtext')}
          </p>
        </Card>
      </div>

      {/* 4. Tracks & Lessons Stepper Timeline */}
      <div className="space-y-4">
        <CohortUserProgressTimeline tracks={learner.tracks || []} />
      </div>
    </div>
  );
}
