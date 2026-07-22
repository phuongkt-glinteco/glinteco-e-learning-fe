'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/default/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/default/avatar';
import { Badge } from '@/components/ui/default/badge';
import { Card } from '@/components/ui/default/card';
import { CohortUserProgressTimeline } from './CohortUserProgressTimeline';
import type { CohortUserProgressItemDto } from '@/services/api-client';
import { getLearnerProgressMetrics } from '@/lib/cohort-progress';

interface UserProgressDetailModalProps {
  learner: CohortUserProgressItemDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProgressDetailModal({
  learner,
  isOpen,
  onClose,
}: UserProgressDetailModalProps) {
  const t = useTranslations('CohortDetailPage');

  if (!learner) return null;

  const hue = typeof learner.avatarHue === 'number' ? learner.avatarHue : 210;
  const initial = (learner.name || 'U').charAt(0).toUpperCase();

  const { totalLessonsCount, completedLessonsCount, overallProgressPct } = getLearnerProgressMetrics(learner);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-outline-variant bg-surface">
        <DialogHeader className="p-6 border-b border-outline-variant bg-gradient-to-r from-surface-container/60 via-surface to-surface-container/30 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-6">
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="w-14 h-14 ring-2 ring-primary/20 shadow-md">
                <AvatarFallback
                  className="text-white font-black text-lg"
                  style={{ backgroundColor: `hsl(${hue}, 65%, 50%)` }}
                >
                  {initial}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <DialogTitle className="text-xl font-black text-on-surface">
                    {learner.name}
                  </DialogTitle>
                  <Badge variant="outline" className="text-xs font-semibold bg-surface">
                    {(learner as Record<string, any>).title || (learner as Record<string, any>).role || t('learnerRole')}
                  </Badge>
                </div>
                <div className="text-xs text-on-surface-variant font-medium">
                  {learner.email}
                </div>
              </div>
            </div>

            {/* Level & Streak Pills */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs">
                <Icon icon="lucide:award" className="w-4 h-4" />
                <span>Lv. {learner.level} ({learner.xp.toLocaleString()} XP)</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 border-outline-variant bg-surface-container/20 space-y-1">
              <div className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">
                {t('modalOverallPct')}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-primary">
                  {Math.round(overallProgressPct)}%
                </span>
                <span className="text-xs font-semibold text-on-surface-variant">
                  {completedLessonsCount} / {totalLessonsCount} bài
                </span>
              </div>
            </Card>

            <Card className="p-4 border-outline-variant bg-surface-container/20 space-y-1">
              <div className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">
                {t('modalCompletedLessons')}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-on-surface">
                  {completedLessonsCount}
                </span>
                <span className="text-xs font-semibold text-on-surface-variant">
                  tổng {totalLessonsCount} bài
                </span>
              </div>
            </Card>
          </div>

          {/* Timeline Section */}
          <div className="space-y-3">
            <CohortUserProgressTimeline tracks={learner.tracks || []} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
