'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  lessonsControllerCreateLesson,
  lessonsControllerUpdateLesson,
  lessonsControllerFindOneLesson,
  lessonsControllerFindLessons,
} from '@/services/api-client';
import type { LessonDetailDto, LessonProgressItemDto } from '@/services/api-client';
import { queryCache } from '@/lib/queryCache';
import {
  useLessonPuckConfig,
  PuckStudio,
  PuckViewer,
  parseBodyToPuckData,
  type LessonPuckData,
} from '@/components/puck-editor';
import { FeatureBarPortal } from '@/components/layout/FeatureBarPortal';
import { LessonEditorBottomBar } from './LessonEditorBottomBar';

interface LessonEditorPageProps {
  trackId?: string;
  lessonId?: string;
  editIndex?: number;
}

type CachedLesson = LessonProgressItemDto & {
  description?: string | null;
  estimatedTime?: string;
  body?: string;
};

type CachedTrackDetail = {
  lessons?: CachedLesson[];
};

type CachedTrackEntry = {
  track: CachedTrackDetail;
  exercises: unknown[];
};

export function LessonEditorPage({ trackId, lessonId, editIndex }: LessonEditorPageProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('15 mins');
  const [lessonType, setLessonType] = useState<'video' | 'reading' | 'quiz' | 'coding' | 'assignment'>('reading');
  const [order, setOrder] = useState(1);
  const [body, setBody] = useState('');
  const [isEditing, setIsEditing] = useState<boolean>(true);

  const lessonConfig = useLessonPuckConfig();
  const [loadedLesson, setLoadedLesson] = useState<LessonDetailDto | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    async function fetchLesson() {
      if (!trackId || !lessonId) return;
      try {
        const res = await lessonsControllerFindOneLesson({ path: { id: lessonId }, throwOnError: true });
        const found = res.data as LessonDetailDto;
        if (found) {
          setLoadedLesson(found);
          setTitle(found.title ?? '');
          setDescription(found.description ?? '');
          setLessonType(found.type ?? 'reading');
          setOrder(found.order ?? 1);
          setBody(found.body ?? '');
          setEstimatedTime(found.estimatedTime ?? '15 mins');
        }
      } catch {
        // silent
      }
    }
    fetchLesson();
  }, [lessonId, trackId]);

  useEffect(() => {
    if (lessonId) return; // create mode handled separately or from track cache
    if (!trackId || editIndex === undefined) return;
    const entry = queryCache.get<CachedTrackEntry>(`/tracks/${trackId}`);
    if (entry?.track?.lessons?.[editIndex]) {
      const lesson = entry.track.lessons[editIndex];
      setTitle(lesson.title ?? '');
      setDescription(lesson.description ?? '');
      setLessonType((lesson.type as 'video' | 'reading' | 'quiz' | 'coding' | 'assignment') ?? 'reading');
      setOrder(lesson.order ?? editIndex + 1);
      setBody(lesson.body ?? '');
      setEstimatedTime(lesson.estimatedTime ?? '15 mins');
    }
  }, [trackId, editIndex, lessonId]);

  // Luôn điền thông tin từ lesson đã có vào Puck Data
  const puckData: LessonPuckData = parseBodyToPuckData(body, {
    title,
    description,
    estimatedTime,
    order,
    type: lessonType,
    documents: (loadedLesson as any)?.documents || [],
    exercises: (loadedLesson as any)?.exercises || [],
  });

  async function handlePublishPuck(data: LessonPuckData) {
    const rootProps = (data.root?.props || {}) as Record<string, any>;
    const headerBlock =
      (data as any).zones?.["header-zone"]?.[0] ||
      (data as any).zones?.["root:header-zone"]?.[0] ||
      data.content?.find((b: any) => b.type === "LessonHeaderBlock");
    const headerProps = headerBlock?.props || {};

    const updatedTitle =
      headerProps.title || rootProps.title || title || "Untitled Lesson";
    const updatedDescription =
      headerProps.description || rootProps.description || description || "";
    const updatedOrder =
      headerProps.order || rootProps.order || order || 1;
    const updatedTime =
      headerProps.estimatedTime ||
      rootProps.estimatedTime ||
      estimatedTime ||
      "15 mins";
    const jsonBody = JSON.stringify(data);

    if (saving) return;
    setSaving(true);
    try {
      if (lessonId && trackId) {
        await lessonsControllerUpdateLesson({
          path: { id: lessonId },
          body: {
            title: updatedTitle,
            description: updatedDescription || null,
            order: updatedOrder,
            estimatedTime: updatedTime,
            body: jsonBody,
          },
          throwOnError: true,
        });

        // Tự động làm mới cache
        const refreshRes = await lessonsControllerFindLessons({
          path: { id: trackId },
          throwOnError: true,
        });
        const fullTrack = queryCache.get<any>(`/tracks/${trackId}`) || {};
        queryCache.set(`/tracks/${trackId}`, {
          ...fullTrack,
          track: {
            ...(fullTrack.track || {}),
            lessons: (refreshRes.data as { items?: unknown[] })?.items || [],
          },
        });
      } else if (trackId) {
        const createRes = await lessonsControllerCreateLesson({
          path: { id: trackId },
          body: {
            title: updatedTitle,
            description: updatedDescription || null,
            order: updatedOrder,
            estimatedTime: updatedTime,
            body: jsonBody,
          },
          throwOnError: true,
        });

        const createdLesson = createRes.data as { id?: string } | undefined;
        const newLessonId = createdLesson?.id;

        const refreshRes = await lessonsControllerFindLessons({
          path: { id: trackId },
          throwOnError: true,
        });

        const fullTrack = queryCache.get<any>(`/tracks/${trackId}`) || {};
        queryCache.set(`/tracks/${trackId}`, {
          ...fullTrack,
          track: {
            ...(fullTrack.track || {}),
            lessons: (refreshRes.data as { items?: unknown[] })?.items || [],
          },
        });

        if (newLessonId) {
          router.replace(`/tracks/${trackId}/lessons/${newLessonId}/edit`);
          setSaving(false);
          return;
        }
      }
    } catch {
      setSaving(false);
      return;
    }
    setSaving(false);
    router.back();
  }

  return (
    <main className="w-full flex-1 flex flex-col bg-surface-container-lowest">
      <FeatureBarPortal
        bottomBar={
          <LessonEditorBottomBar
            onSave={() => handlePublishPuck(puckData)}
            saving={saving}
            canSave={true}
            onCancel={() => router.back()}
            onReset={() => setBody('')}
            isPreview={!isEditing}
            onPreviewToggle={() => setIsEditing(!isEditing)}
          />
        }
      />

      <div className="flex-1 w-full h-full flex flex-col">
        {isEditing ? (
          <PuckStudio
            key={`${lessonId || "new"}-${title}`}
            config={lessonConfig}
            initialData={puckData}
            onPublish={handlePublishPuck}
            overrides={{ headerActions: () => null }}
          />
        ) : (
          <div className="w-full h-full overflow-y-auto">
            <PuckViewer config={lessonConfig} data={puckData} />
          </div>
        )}
      </div>
    </main>
  );
}
