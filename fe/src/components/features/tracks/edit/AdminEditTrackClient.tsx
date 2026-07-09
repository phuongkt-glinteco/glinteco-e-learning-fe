'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { tracksControllerFindOne, tracksControllerUpdate } from '@/services/api-client';
import { getAdminTrackExtendedMetadata, updateAdminTrackExtendedMetadata, type TrackPublishStatus } from '@/mocks/adminTracksMock';
import { UiShowError } from '@/services/errors';
import { DynamicBreadcrumbs } from '@/components/ui/containers/DynamicBreadcrumbs';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import { TrackTagSelector } from '../components/TrackTagSelector';
import { TrackLessonsManagerCard } from './TrackLessonsManagerCard';
import Skeleton from '@/components/ui/loading/Skeleton';

interface AdminEditTrackClientProps {
  trackId: string;
}

export function AdminEditTrackClient({ trackId }: AdminEditTrackClientProps) {
  const t = useTranslations('EditTrackPage');
  const router = useRouter();
  const { setTree } = useBreadcrumbStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [publishStatus, setPublishStatus] = useState<TrackPublishStatus>('published');
  const [tags, setTags] = useState<string[]>([]);

  const fetchTrack = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tracksControllerFindOne({
        path: { id: trackId },
      });
      const data = res.data;
      if (data) {
        setTitle(data.title || '');
        setDescription(data.description || '');

        // Breadcrumb
        setTree([
          { label: t('breadcrumbTracks'), href: '/admin/tracks' },
          { label: data.title || trackId, href: `/admin/tracks/${trackId}` },
          { label: t('breadcrumbEdit'), href: `#` },
        ]);
      }

      const ext = getAdminTrackExtendedMetadata(trackId);
      setPublishStatus(ext.status);
      setTags(ext.tags);
    } catch (err) {
      console.error(t('loadError'), err);
    } finally {
      setLoading(false);
    }
  }, [trackId, setTree, t]);

  useEffect(() => {
    fetchTrack();
  }, [fetchTrack]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setSaveSuccessMessage(false);

    try {
      await tracksControllerUpdate({
        path: { id: trackId },
        body: {
          title: title.trim(),
          description: description.trim(),
        },
      });

      updateAdminTrackExtendedMetadata(trackId, {
        status: publishStatus,
        tags,
      });

      setSaveSuccessMessage(true);
      setTimeout(() => setSaveSuccessMessage(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 w-full">
      <DynamicBreadcrumbs />

      {saveSuccessMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-bold animate-fadeIn">
          <Icon icon="lucide:check-circle-2" className="w-4 h-4 shrink-0" />
          <span>{t('saveSuccess')}</span>
        </div>
      )}

      {/* Card 1: Edit Track Metadata & Tags */}
      <form onSubmit={handleSave} className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-outline-variant/60">
          <div>
            <h2 className="text-xl font-black text-on-surface">{t('editTitle')}</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">{t('subtitle')}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/tracks')}
              className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {saving && <Icon icon="lucide:loader-2" className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? t('saving') : t('saveTrack')}</span>
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {/* Title input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
              {t('trackTitle')} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('trackTitlePlaceholder')}
              required
              className="w-full h-10 px-3.5 rounded-xl bg-surface-container/30 border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Description textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
              {t('description')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              className="w-full p-3.5 rounded-xl bg-surface-container/30 border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Publish Status Options */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
              {t('statusLabel')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  {
                    value: 'published',
                    label: t('statusPublished'),
                    desc: 'Hiển thị công khai cho tất cả học viên',
                    icon: 'lucide:check-circle-2',
                  },
                  {
                    value: 'draft',
                    label: t('statusDraft'),
                    desc: 'Đang chuẩn bị, ẩn với học viên',
                    icon: 'lucide:file-edit',
                  },
                  {
                    value: 'archived',
                    label: t('statusArchived'),
                    desc: 'Lưu trữ lộ trình cũ',
                    icon: 'lucide:archive',
                  },
                ] as const
              ).map((item) => {
                const isActive = publishStatus === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPublishStatus(item.value)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'bg-surface-container/20 border-outline-variant hover:border-outline-variant/80'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <Icon icon={item.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                        {item.label}
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Track Tag Selector */}
          <TrackTagSelector selectedTags={tags} onChange={setTags} />
        </div>
      </form>

      {/* Card 2: Track Lessons Manager Card */}
      <TrackLessonsManagerCard trackId={trackId} />
    </div>
  );
}
