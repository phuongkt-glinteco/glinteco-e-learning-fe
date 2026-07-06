'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/default/button';
import { Badge } from '@/components/ui/default/badge';
import { Avatar, AvatarFallback } from '@/components/ui/default/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/default/table';
import Skeleton from '@/components/ui/loading/Skeleton';
import type { UserProfileDto } from '@/services/api-client';

export type CohortLearnerItem = Partial<UserProfileDto> & {
  id: string;
  name: string;
  email: string;
};

interface CohortLearnersTableProps {
  learners: CohortLearnerItem[];
  isLoading: boolean;
  error?: string | null;
  onReload?: () => void;
}

export function CohortLearnersTable({
  learners,
  isLoading,
  error,
  onReload,
}: CohortLearnersTableProps) {
  const t = useTranslations('CohortDetailPage');

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface-container/30">
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant/50 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/80" />
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-3">
          <Icon icon="lucide:alert-triangle" className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-base text-on-surface mb-1">{t('errorLearnersTitle')}</h4>
        <p className="text-xs text-on-surface-variant max-w-sm mb-5">{error}</p>
        {onReload && (
          <Button onClick={onReload} variant="default" className="flex items-center gap-2 px-4 py-2 text-xs shadow-sm">
            <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
            {t('errorLearnersAction')}
          </Button>
        )}
      </div>
    );
  }

  if (learners.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[260px]">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
          <Icon icon="lucide:users" className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-base text-on-surface mb-1">{t('learnerEmptyTitle')}</h4>
        <p className="text-xs text-on-surface-variant max-w-sm">{t('learnerEmptyDesc')}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container/50 hover:bg-surface-container/50">
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5 pl-6">
                {t('learnerColLearner')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                {t('learnerColTitle')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                {t('learnerColLevel')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                {t('learnerColStreak')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5 pr-6 text-right">
                {t('learnerColAction')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-outline-variant text-sm text-on-surface">
            {learners.map((learner) => {
              const hue = learner.avatarHue ?? 210;
              const initial = (learner.name || 'U').charAt(0).toUpperCase();
              const roleLabel = learner.title || (learner.role === 'admin' ? t('learnerAdmin') : t('learnerRole'));

              return (
                <TableRow key={learner.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                  <TableCell className="py-4 pl-6 font-medium">
                    <Link
                      href={`/profile?id=${learner.id}`}
                      className="flex items-center gap-3 group-hover:text-primary transition-colors"
                    >
                      <Avatar size="lg">
                        <AvatarFallback
                          className="text-white font-bold text-sm"
                          style={{ backgroundColor: `hsl(${hue}, 65%, 50%)` }}
                        >
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">
                          {learner.name}
                        </div>
                        <div className="text-xs text-on-surface-variant font-normal">{learner.email}</div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="py-4 text-on-surface-variant whitespace-nowrap">
                    <span className="text-xs font-medium text-on-surface bg-surface-container px-2.5 py-1 rounded-lg">
                      {roleLabel}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                        Lv. {learner.level || 1}
                      </span>
                      <span className="text-xs font-semibold text-on-surface-variant">
                        {(learner.xp || 0).toLocaleString()} XP
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 whitespace-nowrap">
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200/60 gap-1.5 font-bold">
                      <Icon icon="lucide:flame" className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{learner.streakDays || 0} ngày</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right whitespace-nowrap">
                    <Link
                      href={`/profile?id=${learner.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant hover:border-primary hover:text-primary text-xs font-semibold text-on-surface transition-colors"
                    >
                      <span>{t('learnerViewProfile')}</span>
                      <Icon icon="lucide:external-link" className="w-3.5 h-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
