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
import type { CohortSummaryDto } from '@/services/api-client';
import {CohortActionsMenu} from './CohortActionsMenu';

interface CohortListTableProps {
  cohorts: CohortSummaryDto[];
  isLoading: boolean;
  error?: string | null;
  onReload?: () => void;
  onEdit: (cohort: CohortSummaryDto) => void;
  onDelete: (id: string) => void;
}

export function CohortListTable({
  cohorts,
  isLoading,
  error,
  onReload,
  onEdit,
  onDelete,
}: CohortListTableProps) {
  const t = useTranslations('CohortsPage');

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface-container/30">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-outline-variant/50 last:border-0">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[360px] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500/80" />
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
          <Icon icon="lucide:alert-triangle" className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg text-on-surface mb-1">{t('errorLoadTitle')}</h3>
        <p className="text-sm text-on-surface-variant max-w-md mb-6">{error}</p>
        {onReload && (
          <Button onClick={onReload} variant="default" className="flex items-center gap-2 px-5 py-2.5 shadow-sm">
            <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
            {t('errorLoadAction')}
          </Button>
        )}
      </div>
    );
  }

  if (cohorts.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[320px]">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
          <Icon icon="lucide:users" className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-base text-on-surface mb-1">{t('emptyTitle')}</h3>
        <p className="text-xs text-on-surface-variant max-w-sm">{t('emptyDesc')}</p>
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
                {t('tableColCode')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                {t('tableColLearners')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                {t('tableColProgress')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                {t('tableColStatus')}
              </TableHead>
              <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5 pr-6 text-right">
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-outline-variant text-sm text-on-surface">
            {cohorts.map((cohort) => {
              const item = { ...cohort, code: cohort.id.slice(0, 8).toUpperCase() };
              const learnerCount = item.learnerCount ?? 0;
              const progress = item.avgCompletion ?? 0;
               

              return (
                <TableRow
                  key={cohort.id}
                  className="hover:bg-surface-container-highest/30 transition-colors group"
                >
                  <TableCell className="py-4 pl-6 font-medium">
                    <Link
                      href={`/admin/cohorts/${cohort.id}`}
                      className="block group-hover:text-primary transition-colors"
                    >
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded w-fit mb-1 inline-block">
                        {item.code || cohort.id.slice(0, 8).toUpperCase()}
                      </span>
                      <div className="font-bold text-on-surface text-base">{cohort.name}</div>
                    </Link>
                  </TableCell>
                  <TableCell className="py-4 text-on-surface-variant whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Icon icon="lucide:calendar" className="w-4 h-4 text-on-surface-variant/70" />
                      <span>{learnerCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-container font-semibold text-xs text-on-surface">
                      {progress.toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="py-4 whitespace-nowrap">
                    {
                      progress === 100 ? (
                        <Badge variant="default" className="px-2.5 py-1 text-xs font-semibold">
                          {t('statusCompleted')}
                        </Badge>
                      ) : ( progress > 0 ? (
                        <Badge variant="secondary" className="px-2.5 py-1 text-xs font-semibold">
                          {t('statusInProgress')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold">
                          {t('statusNotStarted')}
                        </Badge>
                      ))
                    }
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right whitespace-nowrap">
                    
                      <CohortActionsMenu
                        cohortId={cohort.id}
                        title={cohort.name}
                        isAdmin={true}
                        onEdit={() => onEdit(cohort)}
                        onDeleteRequest={() => onDelete(cohort.id)}
                      />
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
