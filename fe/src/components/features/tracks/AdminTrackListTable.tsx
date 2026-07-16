'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { useAdminTracks } from '@/hooks/useAdminTracks';
import { tracksControllerDelete } from '@/services/api-client';
import { AdminTrackActionsDropdown } from './AdminTrackActionsDropdown';
import type { AdminTrackItemDto } from '@/services/api-client';

type TrackStatus = AdminTrackItemDto['status'];
export function AdminTrackListTable() {
  const t = useTranslations('AdminTracksPage');
  const { tracks, loading, error, refetch } = useAdminTracks();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TrackStatus>('ALL');
  const [deleteModalTrack, setDeleteModalTrack] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter & Search logic
  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const matchSearch =
        !searchQuery.trim() ||
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' || track.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [tracks, searchQuery, statusFilter]);

  const handleDelete = async () => {
    if (!deleteModalTrack) return;
    setIsDeleting(true);
    try {
      await tracksControllerDelete({
        path: { id: deleteModalTrack.id },
        throwOnError: true,
      });
      setDeleteModalTrack(null);
      refetch();
    } catch (err) {
      console.error(t('deleteError'), err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: TrackStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" />
            {t('statusActive')}
          </span>
        );
      case 'Developing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
            <Icon icon="lucide:file-edit" className="w-3.5 h-3.5" />
            {t('statusDeveloping')}
          </span>
        );
      case 'Archived':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400">
            <Icon icon="lucide:archive" className="w-3.5 h-3.5" />
            {t('statusArchived')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Search & Filter Toolbar Card */}
      <div className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input h-10 */}
        <div className="relative flex-1 min-w-[260px]">
          <Icon
            icon="lucide:search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-surface-container/40 border border-outline-variant/80 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              type="button"
            >
              <Icon icon="lucide:x" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="inline-flex items-center gap-1.5 bg-surface-container/50 p-1 rounded-xl border border-outline-variant/60">
          {(
            [
              { value: 'ALL', label: t('filterStatusAll') },
              { value: 'Active', label: t('statusActive') },
              { value: 'Developing', label: t('statusDeveloping') },
              { value: 'Archived', label: t('statusArchived') },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-outline-variant bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="px-5 py-3.5">{t('colTrack')}</th>
                <th className="px-5 py-3.5">{t('colTags')}</th>
                <th className="px-5 py-3.5">{t('colStatus')}</th>
                <th className="px-5 py-3.5">{t('colStats')}</th>
                <th className="px-5 py-3.5">{t('colLearners')}</th>
                <th className="px-5 py-3.5 text-right">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Icon icon="lucide:loader-2" className="w-7 h-7 text-primary animate-spin" />
                      <span className="text-sm font-medium text-on-surface-variant">
                        {t('loading', { defaultValue: 'Đang tải danh sách lộ trình...' })}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs text-error font-medium">
                    {t('loadError')}
                  </td>
                </tr>
              ) : filteredTracks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs text-on-surface-variant">
                    {t('emptyTitle')}
                  </td>
                </tr>
              ) : (
                filteredTracks.map((track) => (
                  <tr
                    key={track.id}
                    className="hover:bg-surface-container/30 transition-colors"
                  >
                    {/* Column 1: Track Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                          {track.order || 1}
                        </div>
                        <div>
                          <Link
                            href={`/admin/tracks/${track.id}`}
                            className="font-bold text-sm text-on-surface hover:text-primary transition-colors line-clamp-1"
                          >
                            {track.title}
                          </Link>
                          <p className="text-on-surface-variant text-xs line-clamp-1 mt-0.5">
                            {/* Track description no longer returned by API */}
                          </p>
                          <span className="text-[10px] font-mono text-on-surface-variant/60 mt-1 block">
                            ID: {track.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Tags */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                        {/* Tags no longer returned by API */}
                        <span className="text-xs text-on-surface-variant/60 italic">-</span>
                      </div>
                    </td>

                    {/* Column 3: Status */}
                    <td className="px-5 py-4">{getStatusBadge(track.status)}</td>

                    {/* Column 4: Content Stats */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-on-surface-variant">
                        <span className="inline-flex items-center gap-1.5 font-medium text-on-surface">
                          <Icon icon="lucide:book-open" className="w-3.5 h-3.5 text-primary" />
                          {t('statsLessons', { count: track.totalLessons ?? 0 })}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px]">
                          <Icon icon="lucide:file-check" className="w-3.5 h-3.5 text-on-surface-variant" />
                          {t('statsExercises', { count: 0 })}
                        </span>
                      </div>
                    </td>

                    {/* Column 5: Learners */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 font-bold text-on-surface">
                          <Icon icon="lucide:users" className="w-3.5 h-3.5 text-primary" />
                          {t('statsEnrolled', { count: track.enrolledCount })}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <Icon icon="lucide:check-circle" className="w-3.5 h-3.5 text-emerald-500" />
                          {t('statsCompleted', { count: track.completedCount, percent: Math.round((track.avgCompletion || 0) * 100) })}
                        </span>
                      </div>
                    </td>

                    {/* Column 5: Actions */}
                    <td className="px-5 py-4 text-right">
                      <AdminTrackActionsDropdown
                        trackId={track.id}
                        onDelete={() => setDeleteModalTrack({ id: track.id, title: track.title })}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 max-w-md w-full shadow-xl space-y-4">
            <h4 className="font-bold text-base text-on-surface">{t('deleteConfirm')}</h4>
            <p className="text-xs text-on-surface-variant">
              {deleteModalTrack.title} (ID: {deleteModalTrack.id})
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalTrack(null)}
                disabled={isDeleting}
                type="button"
                className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-bold hover:bg-surface-container"
              >
                {t('retry')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                type="button"
                className="px-4 py-2 rounded-xl bg-error text-white text-xs font-bold hover:bg-error/90 disabled:opacity-50"
              >
                {isDeleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
