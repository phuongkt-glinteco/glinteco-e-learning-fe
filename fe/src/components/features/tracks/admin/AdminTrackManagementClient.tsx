'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  CheckCircle2, FileEdit, Archive, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';

import { 
  tracksControllerFindOne, 
  tracksControllerUpdate,
  adminTracksControllerAdminList,
  exercisesControllerFindAll
} from '@/services/api-client';
import type { TrackDetailDto, ExerciseSummaryDto } from '@/services/api-client';

import { DynamicBreadcrumbs } from '@/components/ui/containers/DynamicBreadcrumbs';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import Skeleton from '@/components/ui/loading/Skeleton';

import { TrackLessonsManagerCard } from '../edit/TrackLessonsManagerCard';
import LinkedExercisesCard from '../detail/LinkedExercisesCard';
import AdminCurriculumRoadmap from '../detail/AdminCurriculumRoadmap';
import TrackStatusCard from '../detail/TrackStatusCard';

type LessonStatus = 'completed' | 'in_progress' | 'locked';

interface LessonItem {
  id: string;
  title: string;
  order: number;
  status: LessonStatus;
  type?: 'video' | 'reading' | 'quiz' | 'coding' | 'assignment';
  description?: string | null;
}

function determineLessonStatus(lessons: TrackDetailDto['lessons']): LessonItem[] {
  if (!lessons) return [];
  const sorted = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  let foundActive = false;
  return sorted.map((l) => {
    const base = { id: l.id!, title: l.title!, order: l.order!, type: l.type as any, description: l.description };
    if (l.completed) return { ...base, status: 'completed' as const };
    if (!foundActive) {
      foundActive = true;
      return { ...base, status: 'in_progress' as const };
    }
    return { ...base, status: 'locked' as const };
  });
}

type TrackPublishStatus = 'Developing' | 'Active' | 'Archived';

interface AdminTrackManagementClientProps {
  trackId: string;
}

export function AdminTrackManagementClient({ trackId }: AdminTrackManagementClientProps) {
  const t = useTranslations('EditTrackPage');
  const router = useRouter();
  const { setTree } = useBreadcrumbStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  // Data states
  const [track, setTrack] = useState<TrackDetailDto | null>(null);
  const [exercises, setExercises] = useState<ExerciseSummaryDto[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [icon, setIcon] = useState('');
  const [publishStatus, setPublishStatus] = useState<TrackPublishStatus>('Developing');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [trackRes, exRes, adminListRes] = await Promise.all([
        tracksControllerFindOne({ path: { id: trackId }, throwOnError: true }),
        exercisesControllerFindAll({ query: { trackId }, throwOnError: true }).catch(() => null),
        adminTracksControllerAdminList({ throwOnError: true }).catch(() => null),
      ]);
      
      const fetchedTrack = trackRes.data;
      if (fetchedTrack) {
        setTrack(fetchedTrack);
        setTitle(fetchedTrack.title || '');
        setDescription(fetchedTrack.description || '');
        setEstimatedTime(fetchedTrack.estimatedTime || '');
        setIcon(fetchedTrack.icon || '');

        setTree([
          { label: t('breadcrumbTracks'), href: '/admin/tracks' },
          { label: fetchedTrack.title || trackId, href: `/admin/tracks/${trackId}` }
        ]);

        // Find status from admin list
        if (adminListRes?.data?.data) {
          const adminTrack = adminListRes.data.data.find(t => t.id === trackId);
          if (adminTrack && adminTrack.status) {
            setPublishStatus(adminTrack.status as TrackPublishStatus);
          }
        }
      }

      setExercises(exRes?.data?.data ?? []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [trackId, setTree, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          estimatedTime: estimatedTime.trim(),
          icon: icon.trim(),
          status: publishStatus,
        },
      });

      setSaveSuccessMessage(true);
      setTimeout(() => setSaveSuccessMessage(false), 3000);
      
      // Re-fetch to get latest data
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercise = useCallback((exerciseId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  }, []);

  const handleDeleteLesson = useCallback((lessonId: string) => {
    setTrack((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lessons: prev.lessons?.filter((l) => l.id !== lessonId),
      };
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-foreground font-medium">{t('failedToLoad')}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const lessonsWithStatus = determineLessonStatus(track.lessons);
  const totalLessons = lessonsWithStatus.length;
  const completedLessons = lessonsWithStatus.filter((l) => l.status === 'completed').length;
  const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 w-full">
      <DynamicBreadcrumbs />

      {saveSuccessMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t('saveSuccess')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Track Metadata Form */}
          <form onSubmit={handleSave} className="rounded-2xl border bg-card text-card-foreground p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold">{t('editTitle')}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/admin/tracks')}
                  className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{saving ? t('saving') : t('saveTrack')}</span>
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('trackTitle')} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('trackTitlePlaceholder')}
                  required
                  className="w-full h-10 px-3.5 rounded-xl bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estimated Time
                </label>
                <input
                  type="text"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="e.g. 10 hours"
                  className="w-full h-10 px-3.5 rounded-xl bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Icon
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. Code, Book, Rocket"
                  className="w-full h-10 px-3.5 rounded-xl bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('description')}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full p-3.5 rounded-xl bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('statusLabel')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        value: 'Active',
                        label: 'Active',
                        desc: 'Published & visible',
                        icon: CheckCircle2,
                      },
                      {
                        value: 'Developing',
                        label: 'Developing',
                        desc: 'Draft mode, hidden',
                        icon: FileEdit,
                      },
                      {
                        value: 'Archived',
                        label: 'Archived',
                        desc: 'Legacy track',
                        icon: Archive,
                      },
                    ] as const
                  ).map((item) => {
                    const isActive = publishStatus === item.value;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setPublishStatus(item.value)}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-primary/5 border-primary shadow-sm'
                            : 'bg-accent/50 border-border hover:border-border/80'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                            {item.label}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </form>

          {/* Lessons Manager */}
          <TrackLessonsManagerCard trackId={trackId} />

          {/* Curriculum Roadmap */}
          <AdminCurriculumRoadmap
            trackId={trackId}
            lessons={lessonsWithStatus}
            onDeleteLesson={handleDeleteLesson}
          />
        </div>

        <div className="space-y-6">
          {/* Track Status */}
          <TrackStatusCard
            title={track.title ?? ''}
            completionPercent={completionPercent}
            prevTrack={track.prevTrack}
            nextTrack={track.nextTrack}
          />

          {/* Linked Exercises */}
          <LinkedExercisesCard 
            trackId={trackId} 
            exercises={exercises} 
            onDeleteExercise={handleDeleteExercise} 
          />
        </div>
      </div>
    </div>
  );
}
