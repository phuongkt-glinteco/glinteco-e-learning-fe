'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { useTracks } from '@/hooks/useTracks';
import { tracksControllerDelete } from '@/services/api-client';
import { AppButton } from '@/components/ui/buttons';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/loading/Skeleton';

const STATUS_CONFIG: Record<string, { cls: string; icon: string }> = {
  in_progress: {
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: 'lucide:play-circle',
  },
  completed: {
    cls: 'bg-green-50 text-green-700 border-green-200',
    icon: 'lucide:check-circle',
  },
  locked: {
    cls: 'bg-slate-100 text-slate-500 border-slate-200',
    icon: 'lucide:lock',
  },
};

function StatusChip({ status, label }: { status: string; label: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.locked;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <Icon icon={cfg.icon} className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

interface PageButtonProps {
  page: number;
  current: number;
  onClick: (p: number) => void;
}

function PageButton({ page, current, onClick }: PageButtonProps) {
  const isActive = page === current;
  return (
    <button
      onClick={() => onClick(page)}
      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
        isActive
          ? 'bg-primary text-on-primary shadow-sm'
          : 'text-on-surface-variant hover:bg-surface-container'
      }`}
    >
      {page}
    </button>
  );
}

interface FilterSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  ariaLabel: string;
}

function FilterSelect({ value, onChange, children, ariaLabel }: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className="h-9 pl-3 pr-8 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow duration-200"
      >
        {children}
      </select>
      <Icon
        icon="lucide:chevron-down"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none w-4 h-4"
      />
    </div>
  );
}

const STATUS_FILTER_OPTIONS = [
  { value: '', key: 'allStatuses' },
  { value: 'in_progress', key: 'active' },
  { value: 'completed', key: 'completed' },
  { value: 'locked', key: 'locked' },
] as const;

const LIMIT_OPTIONS = [10, 20, 50] as const;

export default function TrackListTable() {
  const t = useTranslations('TracksPage');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { tracks, meta, loading, error, refetch } = useTracks({
    page,
    limit,
    status: statusFilter || undefined,
  });

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tracksControllerDelete({
        path: { id: deleteTarget.id },
        throwOnError: true,
      });
      setDeleteTarget(null);
      if (meta && meta.page > 1 && tracks.length === 1) {
        setPage(meta.page - 1);
      } else {
        refetch();
      }
    } catch {
      // error handled by interceptor
    } finally {
      setDeleting(false);
    }
  }

  const handleLimitChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  }, []);

  const totalPages = meta?.lastPage ?? 1;
  const startRecord = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const endRecord = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

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

  function statusLabel(value: string): string {
    if (!value) return t('filter.allStatuses');
    const option = STATUS_FILTER_OPTIONS.find((o) => o.value === value);
    return option ? t(`filter.${option.key}`) : value;
  }

  return (
    <div className="space-y-xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-md flex-wrap">
        <div className="flex items-center gap-2">
          <FilterSelect
            value={statusFilter}
            onChange={handleStatusChange}
            ariaLabel={t('filter.allStatuses')}
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(`filter.${opt.key}`)}
              </option>
            ))}
          </FilterSelect>
          {statusFilter && (
            <button
              onClick={() => { setStatusFilter(''); setPage(1); }}
              className="h-9 px-3 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <Icon icon="lucide:x" className="w-4 h-4" />
              <span className="hidden sm:inline label-sm">Clear</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-md">
          <Link href="/reorder">
            <AppButton variant="outlinePrimary" icon="lucide:list-ordered">
              {t('reorder')}
            </AppButton>
          </Link>
          <Link href="/admin/tracks/create">
            <AppButton icon="lucide:plus">{t('createTrack')}</AppButton>
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg card-shadow overflow-hidden">
        {loading ? (
          <div className="p-lg space-y-md">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={48} rounded="rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-2xl gap-md">
            <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
              <Icon icon="lucide:alert-circle" className="text-2xl text-error" />
            </div>
            <p className="text-body-sm text-on-surface-variant">{t('error')}</p>
            <AppButton variant="outline" onClick={refetch}>
              {t('retry')}
            </AppButton>
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-2xl gap-md">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
              <Icon icon="lucide:folder-open" className="text-2xl text-on-surface-variant" />
            </div>
            <p className="text-body-sm text-on-surface-variant">{t('empty')}</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">
                  {t('table.titleDescription')}
                </th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">
                  {t('table.contentStructure')}
                </th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">
                  {t('table.status')}
                </th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant text-right">
                  {t('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {tracks.map((track) => (
                <tr
                  key={track.id}
                  className="even:bg-background hover:bg-surface-container transition-colors duration-200 group"
                >
                  <td className="px-lg py-md">
                    <Link
                      href={`/admin/tracks/${track.id}`}
                      className="flex flex-col gap-0.5 group/link"
                    >
                      <span className="font-label-md text-on-surface group-hover/link:text-primary transition-colors duration-200">
                        {track.title}
                      </span>
                      <span className="text-body-sm text-on-surface-variant line-clamp-1">
                        {track.description}
                      </span>
                    </Link>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <Icon icon="lucide:book-open" className="w-4 h-4" />
                      <span className="text-body-sm font-medium">
                        {t('table.lessons', { count: track.lessonCount })}
                      </span>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <StatusChip status={track.status} label={statusLabel(track.status)} />
                  </td>
                  <td className="px-lg py-md text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/tracks/${track.id}/edit`}
                        className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-200"
                        aria-label={t('actions.edit')}
                      >
                        <Icon icon="lucide:pen-square" className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget({ id: track.id, title: track.title })}
                        className="p-2 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors duration-200 cursor-pointer"
                        aria-label={t('actions.delete')}
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {meta && tracks.length > 0 && (
          <div className="px-lg py-md bg-surface-container-low border-t border-outline-variant flex items-center justify-between flex-wrap gap-md">
            <div className="flex items-center gap-3">
              <span className="text-body-sm text-on-surface-variant">
                {t('pagination.showing', {
                  start: startRecord,
                  end: endRecord,
                  total: meta.total,
                })}
              </span>
              <div className="flex items-center gap-1.5">
                <label className="text-body-sm text-on-surface-variant">
                  {t('pagination.perPage')}
                </label>
                <FilterSelect
                  value={String(limit)}
                  onChange={handleLimitChange}
                  ariaLabel={t('pagination.perPage')}
                >
                  {LIMIT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </FilterSelect>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
                aria-label="Previous page"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4" />
              </button>
              {getPageNumbers().map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`e-${i}`} className="px-2 text-body-sm text-on-surface-variant">
                    ...
                  </span>
                ) : (
                  <PageButton key={p} page={p} current={page} onClick={setPage} />
                ),
              )}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
                aria-label="Next page"
              >
                <Icon icon="lucide:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title={t('actions.deleteTitle')}
      >
        <div className="space-y-md">
          <p className="text-body-sm text-on-surface-variant">
            {t('actions.confirmDelete')}
          </p>
          {deleteTarget && (
            <p className="font-label-md text-on-surface">&quot;{deleteTarget.title}&quot;</p>
          )}
          <div className="flex justify-end gap-md pt-md">
            <AppButton
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {t('actions.cancel')}
            </AppButton>
            <AppButton
              variant="primary"
              onClick={handleDelete}
              disabled={deleting}
              className="!bg-error !text-on-error hover:!opacity-90"
            >
              {deleting ? t('actions.deleting') : t('actions.delete')}
            </AppButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
