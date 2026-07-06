'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/default/button';
import { Badge } from '@/components/ui/default/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/default/table';
import Skeleton from '@/components/ui/loading/Skeleton';
import type { SubmissionFeedItemDto } from '@/services/api-client';

interface CohortSubmissionsTableProps {
  submissions: SubmissionFeedItemDto[];
  isLoading: boolean;
  error?: string | null;
  onReload?: () => void;
}

const STATUS_MAP: Record<string, { labelKey: string; cls: string; icon: string }> = {
  pending: {
    labelKey: 'Chờ chấm bài',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: 'lucide:clock',
  },
  submitted: {
    labelKey: 'Đã nộp',
    cls: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: 'lucide:send',
  },
  approved: {
    labelKey: 'Đạt / Thông qua',
    cls: 'bg-green-50 text-green-700 border-green-200',
    icon: 'lucide:check-circle',
  },
  rejected: {
    labelKey: 'Không đạt',
    cls: 'bg-red-50 text-red-700 border-red-200',
    icon: 'lucide:x-circle',
  },
  changes: {
    labelKey: 'Yêu cầu sửa lại',
    cls: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: 'lucide:alert-circle',
  },
};

export function CohortSubmissionsTable({
  submissions,
  isLoading,
  error,
  onReload,
}: CohortSubmissionsTableProps) {
  const t = useTranslations('CohortDetailPage');

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface-container/30">
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant/50 last:border-0">
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-6 w-28 rounded-full" />
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
        <h4 className="font-bold text-base text-on-surface mb-1">{t('errorSubmissionsTitle')}</h4>
        <p className="text-xs text-on-surface-variant max-w-sm mb-5">{error}</p>
        {onReload && (
          <Button onClick={onReload} variant="default" className="flex items-center gap-2 px-4 py-2 text-xs shadow-sm">
            <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
            {t('errorSubmissionsAction')}
          </Button>
        )}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[260px]">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
          <Icon icon="lucide:file-check" className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-base text-on-surface mb-1">{t('submissionEmptyTitle')}</h4>
        <p className="text-xs text-on-surface-variant max-w-sm">{t('submissionEmptyDesc')}</p>
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
                {t('submissionColLearner')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                {t('submissionColExercise')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                {t('submissionColStatus')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                {t('submissionColDate')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5 pr-6 text-right">
                {t('submissionColAction')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-outline-variant text-sm text-on-surface">
            {submissions.map((sub) => {
              const st = STATUS_MAP[sub.status] || STATUS_MAP.pending;
              const user = sub.user as any;
              const dateStr = sub.submittedAt
                ? new Date(sub.submittedAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : t('submissionJustNow');

              return (
                <TableRow key={sub.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                  <TableCell className="py-4 pl-6">
                    <div className="font-bold text-on-surface text-sm">{user?.name || 'Học viên'}</div>
                    <div className="text-xs text-on-surface-variant font-normal">{user?.email || ''}</div>
                  </TableCell>
                  <TableCell className="py-4 font-semibold">
                    <div className="text-on-surface flex items-center gap-2">
                      <Icon icon="lucide:code-2" className="w-4 h-4 text-primary shrink-0" />
                      <span>{sub.exercise?.title || 'Bài thực hành'}</span>
                    </div>
                    {sub.prUrl && (
                      <a
                        href={sub.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1 font-mono"
                      >
                        <Icon icon="lucide:git-pull-request" className="w-3 h-3" />
                        <span>{t('submissionViewPR')}</span>
                        <Icon icon="lucide:external-link" className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="py-4 whitespace-nowrap">
                    <Badge variant="outline" className={`gap-1.5 font-semibold ${st.cls}`}>
                      <Icon icon={st.icon} className="w-3.5 h-3.5" />
                      {st.labelKey}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-xs text-on-surface-variant whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-on-surface-variant/70" />
                      <span>{dateStr}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/reviews?submissionId=${sub.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-xs font-bold transition-all shadow-sm"
                    >
                      <span>{t('submissionReview')}</span>
                      <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
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
