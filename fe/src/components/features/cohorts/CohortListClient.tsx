'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import { Icon } from '@iconify/react';
import { Loader2Icon, Trash2Icon } from 'lucide-react';
import { useCohorts } from '@/hooks/useCohorts';
import { cohortControllerRemove } from '@/services/api-client';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/default/dialog';
import { CohortListTable } from './CohortListTable';
import { CreateCohortModal } from './CreateCohortModal';
import { EditCohortModal } from './EditCohortModal';
import type { CohortSummaryDto } from '@/services/api-client';

const LIMIT_OPTIONS = [10, 20, 50] as const;

export function CohortListClient() {
  const t = useTranslations('CohortsPage');
  const shellT = useTranslations('AppShell');
  const { setTree } = useBreadcrumbStore();

  useEffect(() => {
    setTree([{ label: shellT('cohortManager'), href: '/admin/cohorts' }]);
  }, [setTree, shellT]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { cohorts, meta, loading, error, refetch } = useCohorts({
    page,
    limit,
    q: debouncedQuery,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingCohort, setEditingCohort] = useState<CohortSummaryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await cohortControllerRemove({
        path: { id: deleteTarget.id },
        throwOnError: true,
      });
      setDeleteTarget(null);
      if (meta && meta.page > 1 && cohorts.length === 1) {
        setPage(meta.page - 1);
      } else {
        refetch();
      }
    } catch {
      // error is handled and toasted by interceptor
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = meta?.lastPage ?? 1;

  function getPageNumbers(): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-outline-variant shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Icon
            icon="lucide:search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70 pointer-events-none"
          />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-10 h-10 rounded-xl bg-surface-container-lowest"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <Icon icon="lucide:x" className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-medium">{t('showLabel')}</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 px-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs text-on-surface cursor-pointer focus:outline-none focus:border-primary"
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t('perPage', { limit: opt })}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="default"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold shadow-sm h-10"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            <span>{t('createCohort')}</span>
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <CohortListTable
        cohorts={cohorts}
        isLoading={loading}
        error={error}
        onReload={refetch}
        onEdit={(cohort) => setEditingCohort(cohort)}
        onDelete={(id) => {
          const target = cohorts.find((c) => c.id === id);
          if (target) setDeleteTarget({ id: target.id, name: target.name });
        }}
      />

      {/* Pagination Footer */}
      {meta && meta.total > 0 && !loading && !error && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <span className="text-xs text-on-surface-variant font-medium">
            {t('showingFromTo', {
              from: (meta.page - 1) * meta.limit + 1,
              to: Math.min(meta.page * meta.limit, meta.total),
              total: meta.total,
            })}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 h-9 w-9"
              aria-label={t('prevPage')}
            >
              <Icon icon="lucide:chevron-left" className="w-4 h-4" />
            </Button>
            {getPageNumbers().map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`e-${i}`} className="px-2 text-xs text-on-surface-variant">
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 text-xs font-bold ${page === p ? '' : 'text-on-surface-variant'}`}
                >
                  {p}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 h-9 w-9"
              aria-label={t('nextPage')}
            >
              <Icon icon="lucide:chevron-right" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreating && (
        <CreateCohortModal
          onSuccess={() => {
            setIsCreating(false);
            refetch();
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {editingCohort && (
        <EditCohortModal
          cohort={editingCohort}
          onSuccess={() => {
            setEditingCohort(null);
            refetch();
          }}
          onCancel={() => setEditingCohort(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl border-outline-variant p-6 shadow-xl">
          <DialogHeader className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Trash2Icon className="w-6 h-6 stroke-[2]" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {t('deleteConfirmTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {t('deleteConfirmDesc')}
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (
            <div className="font-bold text-base text-on-surface bg-surface-container/50 p-3 rounded-lg border border-outline-variant text-center">
              &quot;{deleteTarget.name}&quot;
            </div>
          )}

          <DialogFooter className="gap-2 pt-4 border-t border-outline-variant">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-xl h-10 px-4 font-medium"
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl h-10 px-5 font-semibold shadow-sm gap-2"
            >
              {deleting ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  <span>{t('deleting')}</span>
                </>
              ) : (
                <>
                  <Trash2Icon className="w-4 h-4" />
                  <span>{t('deleteConfirm')}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
