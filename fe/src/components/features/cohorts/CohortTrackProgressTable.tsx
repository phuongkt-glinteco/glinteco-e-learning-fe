'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/default/button';
import { Badge } from '@/components/ui/default/badge';
import { Progress } from '@/components/ui/default/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/default/table';
import Skeleton from '@/components/ui/loading/Skeleton';
import type { CohortTrackCompletionItemDto } from '@/services/api-client';

interface CohortTrackProgressTableProps {
  items: CohortTrackCompletionItemDto[];
  isLoading: boolean;
  error?: string | null;
  onReload?: () => void;
}

export function CohortTrackProgressTable({
  items,
  isLoading,
  error,
  onReload,
}: CohortTrackProgressTableProps) {
  const t = useTranslations('CohortDetailPage');

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface-container/30">
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-6 py-3 border-b border-outline-variant/50 last:border-0">
              <Skeleton className="h-5 w-1/3" />
              <div className="flex-1 max-w-xs space-y-1">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
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
        <h4 className="font-bold text-base text-on-surface mb-1">{t('errorTracksTitle')}</h4>
        <p className="text-xs text-on-surface-variant max-w-sm mb-5">{error}</p>
        {onReload && (
          <Button onClick={onReload} variant="default" className="flex items-center gap-2 px-4 py-2 text-xs shadow-sm">
            <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
            {t('errorTracksAction')}
          </Button>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[260px]">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
          <Icon icon="lucide:book-open" className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-base text-on-surface mb-1">{t('trackEmptyTitle')}</h4>
        <p className="text-xs text-on-surface-variant max-w-sm">{t('trackEmptyDesc')}</p>
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
                {t('trackColTrack')}
              </TableHead>
              <TableHead className="font-bold text-center text-on-surface-variant uppercase tracking-wider text-xs py-3.5 w-1/3">
                {t('trackColProgress')}
              </TableHead>
              <TableHead className="font-bold text-center text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                {t('trackColStatus')}
              </TableHead>
              <TableHead className="font-bold text-center text-on-surface-variant uppercase tracking-wider text-xs py-3.5 pr-6">
                {t('trackColAction')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-outline-variant text-sm text-on-surface">
            {items.map((item) => {
              const pct = Math.round(item.completionPct || 0);
              let statusVariant: 'outline' | 'secondary' | 'default' | 'destructive' | 'ghost' | 'link' = 'secondary';
              let statusLabel = t('trackStatusNotStarted');
              let progressClass = 'bg-slate-400';

              if (pct === 100) {
                statusVariant = 'outline';
                statusLabel = t('trackStatusCompleted');
                progressClass = 'bg-green-600';
              } else if (pct > 0) {
                statusVariant = 'outline';
                statusLabel = t('trackStatusInProgress');
                progressClass = 'bg-blue-600';
              }

              return (
                <TableRow key={item.trackId} className="hover:bg-surface-container-highest/30 transition-colors group">
                  <TableCell className="py-4 pl-6 w-[50%] font-semibold">
                    <Link
                      href={`/admin/tracks/${item.trackId}`}
                      className="text-on-surface group-hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <Icon icon="lucide:book-open" className="w-4 h-4 text-primary shrink-0" />
                      <span>{item.title.slice(0, 50)}{item.title.length > 50 ? '...' : ''}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="py-4 px-6 w-[20%] self-center">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                        <span>{t('trackProgress')}</span>
                        <span className="font-mono font-bold text-on-surface">{pct}%</span>
                      </div>
                      <Progress
                        value={pct}
                        className="h-2 bg-surface-container-higher border border-outline-variant rounded-full overflow-hidden"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-2 w-[15%] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <Badge variant={statusVariant} className="font-semibold">
                        {statusLabel}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pr-6 w-[15%] text-right whitespace-nowrap">
                    <Link
                      href={`/admin/tracks/${item.trackId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant hover:border-primary hover:text-primary text-xs font-semibold text-on-surface transition-colors"
                    >
                      <span>{t('trackManage')}</span>
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
