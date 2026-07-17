'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import {
  CheckCircle2, FileEdit, Archive, Loader2, AlertCircle, RefreshCw,
  BookOpen, Star, Terminal, Save, X,
} from 'lucide-react';

import {
  tracksControllerFindOne,
  tracksControllerUpdate,
  adminTracksControllerAdminList,
  exercisesControllerFindAll,
} from '@/services/api-client';
import type { TrackDetailDto, ExerciseSummaryDto } from '@/services/api-client';

import { DynamicBreadcrumbs } from '@/components/ui/containers/DynamicBreadcrumbs';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import Skeleton from '@/components/ui/loading/Skeleton';

import { TrackLessonsManagerCard } from '../edit/TrackLessonsManagerCard';
import { TrackExercisesManagerFull } from '../edit/TrackExercisesManagerFull';
import { isTrackDirectExercise } from '../utils';
import { TRACK_ICONS, getTrackIconLucide } from '../utils/icon-mapping';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/default/tabs';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';
import { Textarea } from '@/components/ui/default/textarea';
import { Badge } from '@/components/ui/default/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/default/select';

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

const STATUS_LABELS: Record<TrackPublishStatus, string> = {
  Active: 'Đang hoạt động',
  Developing: 'Đang phát triển',
  Archived: 'Đã lưu trữ',
};

const STATUS_COLORS: Record<TrackPublishStatus, string> = {
  Active: 'bg-green-500',
  Developing: 'bg-amber-500',
  Archived: 'bg-gray-400',
};

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
          { label: fetchedTrack.title || trackId, href: `/admin/tracks/${trackId}` },
        ]);

        // Find status from admin list
        if (adminListRes?.data?.data) {
          const adminTrack = adminListRes.data.data.find(t => t.id === trackId);
          if (adminTrack && adminTrack.status) {
            setPublishStatus(adminTrack.status as TrackPublishStatus);
          }
        }
      }

      const rawExercises = exRes?.data?.data ?? [];
      setExercises(rawExercises.filter(isTrackDirectExercise));
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

  const handleSave = async () => {
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
  const totalXp = exercises.reduce((sum, ex) => sum + (ex.xp ?? 0), 0);

  const statusOptions = [
    {
      value: 'Active' as const,
      label: 'Active',
      desc: 'Published & visible',
      icon: CheckCircle2,
    },
    {
      value: 'Developing' as const,
      label: 'Developing',
      desc: 'Draft mode, hidden',
      icon: FileEdit,
    },
    {
      value: 'Archived' as const,
      label: 'Archived',
      desc: 'Legacy track',
      icon: Archive,
    },
  ];

  return (
    <Tabs defaultValue="overview" className="flex flex-col w-full min-h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-surface border-b border-border shadow-sm">
        <div className="px-lg md:px-xl py-md md:py-lg flex flex-col gap-md">
          {/* Breadcrumbs & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
            <DynamicBreadcrumbs />
            <div className="flex items-center gap-sm">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/tracks')}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim()}
              >
                {saving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save />
                )}
                {saving ? t('saving') : t('saveTrack')}
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-lg text-sm text-muted-foreground bg-surface-container-low p-md rounded-lg border border-border">
            <div className="flex items-center gap-xs">
              <BookOpen className="w-4 h-4 shrink-0 text-tertiary" />
              <span className="font-semibold text-foreground">{totalLessons}</span>
              {' '}{t('lesson_other')}
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-xs">
              <Star className="w-4 h-4 shrink-0 text-secondary" />
              <span className="font-semibold text-foreground">{totalXp.toLocaleString()}</span>
              {' '}XP
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-xs">
              <Terminal className="w-4 h-4 shrink-0 text-primary" />
              <span className="font-semibold text-foreground">{exercises.length}</span>
              {' '}{t('exercise_other')}
            </div>
            <div className="w-px h-4 bg-border hidden md:block" />
            <div className="flex items-center gap-xs mt-2 md:mt-0 w-full md:w-auto md:ml-auto">
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[publishStatus]}`} />
              <span>
                Trạng thái: <strong>{STATUS_LABELS[publishStatus]}</strong>
              </span>
            </div>
          </div>

          {/* Notification Banner */}
          {saveSuccessMessage && (
            <div className="flex items-center gap-sm bg-green-50 border border-green-300 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400 p-sm rounded-lg text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{t('saveSuccess')}</span>
              <button
                type="button"
                onClick={() => setSaveSuccessMessage(false)}
                className="ml-auto cursor-pointer"
              >
                <X className="w-4 h-4 shrink-0" />
              </button>
            </div>
          )}

          {/* Segmented Navigation */}
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="overview" className="text-label-md">
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger value="lessons" className="text-label-md">
              Nội dung bài học
            </TabsTrigger>
            <TabsTrigger value="exercises" className="text-label-md gap-xs">
              Bài tập liên kết
              {exercises.length > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 px-1 text-[10px] rounded-full"
                >
                  {exercises.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 p-lg md:p-xl space-y-xl max-w-screen-xl w-full mx-auto">
        {/* Overview Tab - Form + Roadmap */}
        <TabsContent value="overview" className="space-y-lg mt-0">
          <section className="bg-card border border-border rounded-xl p-lg shadow-sm space-y-lg">
            <div>
              <h2 className="text-headline-sm font-headline-sm text-foreground">
                {t('editTitle')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-label-md font-label-md text-foreground">
                  {t('trackTitle')} <span className="text-destructive">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('trackTitlePlaceholder')}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-label-md font-label-md text-foreground">
                  Estimated Time
                </label>
                <Input
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="e.g. 4 weeks"
                />
              </div>
            </div>

            

            <div className="space-y-1.5">
              <label className="text-label-md font-label-md text-foreground">
                {t('description')}
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="space-y-1.5 flex w-full flex-col md:flex-row gap-lg">
            <div className="space-y-1.5 md:flex-1">
              <label className="text-label-md font-label-md text-foreground">
                Icon
              </label>
              <Select
                value={icon}
                onValueChange={(val) => setIcon(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn icon">
                    {icon ? (
                      <>
                        <Icon
                          icon={`lucide:${getTrackIconLucide(icon)}`}
                          className="w-4 h-4 shrink-0"
                        />
                        <span>
                          {TRACK_ICONS.find((i) => i.value === icon)
                            ?.label ?? icon}
                        </span>
                      </>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TRACK_ICONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <Icon
                        icon={`lucide:${opt.lucide}`}
                        className="w-4 h-4 shrink-0"
                      />
                      <span>{opt.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:flex-4">
              <label className="text-label-md font-label-md text-foreground">
                {t('statusLabel')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
                {statusOptions.map((item) => {
                  const isActive = publishStatus === item.value;
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPublishStatus(item.value)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
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
          </section>

        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-lg mt-0">
          <TrackLessonsManagerCard trackId={trackId} />
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="space-y-lg mt-0">
          <TrackExercisesManagerFull
            trackId={trackId}
            exercises={exercises}
            onDeleteExercise={handleDeleteExercise}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
