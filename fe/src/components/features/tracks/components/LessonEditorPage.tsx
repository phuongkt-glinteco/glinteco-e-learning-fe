'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
  serializePuckDataToPayload,
  type LessonPuckData,
} from '@/components/puck-editor';
import { FeatureBarPortal } from '@/components/layout/FeatureBarPortal';
import { LessonEditorBottomBar } from './LessonEditorBottomBar';
import { useLessonDraftStore } from '@/stores/lessonDraftStore';

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
  const [uiValidationError, setUiValidationError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('15 min');
  const [lessonType, setLessonType] = useState<'video' | 'reading' | 'quiz' | 'coding' | 'assignment'>('reading');
  const [order, setOrder] = useState(1);
  const [body, setBody] = useState('');
  const [isEditing, setIsEditing] = useState<boolean>(true);

  const lessonConfig = useLessonPuckConfig();
  const [loadedLesson, setLoadedLesson] = useState<LessonDetailDto | null>(null);

  const { saveDraft, getDraft, clearDraft } = useLessonDraftStore();
  const draftKey = `${trackId || 'track'}-${lessonId || editIndex || 'new'}`;

  useEffect(() => {
    const draft = getDraft(draftKey);
    if (draft) {
      setTitle(draft.title || '');
      setDescription(draft.description || '');
      setEstimatedTime(draft.estimatedTime || '15 min');
      setLessonType(draft.type || 'reading');
      setOrder(draft.order || 1);
      setBody(draft.body || '');
    }
  }, [draftKey, getDraft]);

  useEffect(() => {
    if (!lessonId) return;
    async function fetchLesson() {
      if (!trackId || !lessonId) return;
      try {
        const res = await lessonsControllerFindOneLesson({ path: { id: lessonId }, throwOnError: true });
        const found = res.data as LessonDetailDto;
        if (found && !getDraft(draftKey)) {
          setLoadedLesson(found);
          setTitle(found.title ?? '');
          setDescription(found.description ?? '');
          setLessonType(found.type ?? 'reading');
          setOrder(found.order ?? 1);
          setBody(found.body ?? '');
          setEstimatedTime(found.estimatedTime ?? '15 min');
        }
      } catch {
        // silent
      }
    }
    fetchLesson();
  }, [lessonId, trackId, draftKey, getDraft]);

  useEffect(() => {
    if (lessonId) return;
    if (!trackId || editIndex === undefined) return;
    const entry = queryCache.get<CachedTrackEntry>(`/tracks/${trackId}`);
    if (entry?.track?.lessons?.[editIndex] && !getDraft(draftKey)) {
      const lesson = entry.track.lessons[editIndex];
      setTitle(lesson.title ?? '');
      setDescription(lesson.description ?? '');
      setLessonType((lesson.type as 'video' | 'reading' | 'quiz' | 'coding' | 'assignment') ?? 'reading');
      setOrder(lesson.order ?? editIndex + 1);
      setBody(lesson.body ?? '');
      setEstimatedTime(lesson.estimatedTime ?? '15 min');
    }
  }, [trackId, editIndex, lessonId, draftKey, getDraft]);

  const puckData: LessonPuckData = parseBodyToPuckData(body, {
    title,
    description,
    estimatedTime,
    order,
    type: lessonType,
    documents: loadedLesson?.relatedDocs || [],
    exercises: [],
  });

  async function handlePublishPuck(data: LessonPuckData) {
    const payload = serializePuckDataToPayload(data, {
      title,
      description,
      estimatedTime,
      order,
      type: lessonType,
    });
    const {
      title: updatedTitle,
      description: updatedDescription,
      estimatedTime: updatedTime,
      order: updatedOrder,
      type: updatedType,
      body: jsonBody,
    } = payload;

    if (!updatedTitle.trim()) {
      setUiValidationError("Tiêu đề bài học không được để trống.");
      return;
    }
    setUiValidationError(null);

    // Auto save draft before attempting API call
    saveDraft(draftKey, {
      title: updatedTitle,
      description: updatedDescription,
      estimatedTime: updatedTime,
      type: (updatedType as any) || lessonType,
      order: updatedOrder,
      body: jsonBody,
    });

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

        clearDraft(draftKey);
        toast.success("Cập nhật bài học thành công!");

        const refreshRes = await lessonsControllerFindLessons({
          path: { id: trackId },
          throwOnError: true,
        });
        const fullTrack = queryCache.get<CachedTrackEntry>(`/tracks/${trackId}`);
        if (fullTrack) {
          queryCache.set(`/tracks/${trackId}`, {
            ...fullTrack,
            track: {
              ...fullTrack.track,
              lessons: (refreshRes.data as { items?: CachedLesson[] })?.items || [],
            },
          });
        }
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

        clearDraft(draftKey);
        toast.success("Tạo bài học mới thành công!");

        const createdLesson = createRes.data as { id?: string } | undefined;
        const newLessonId = createdLesson?.id;

        const refreshRes = await lessonsControllerFindLessons({
          path: { id: trackId },
          throwOnError: true,
        });

        const fullTrack = queryCache.get<CachedTrackEntry>(`/tracks/${trackId}`);
        if (fullTrack) {
          queryCache.set(`/tracks/${trackId}`, {
            ...fullTrack,
            track: {
              ...fullTrack.track,
              lessons: (refreshRes.data as { items?: CachedLesson[] })?.items || [],
            },
          });
        }

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
            onReset={() => {
              clearDraft(draftKey);
              setBody('');
            }}
            isPreview={!isEditing}
            onPreviewToggle={() => setIsEditing(!isEditing)}
          />
        }
      />

      {uiValidationError && (
        <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600 dark:text-red-400 font-medium flex items-center justify-between">
          <span>⚠️ {uiValidationError}</span>
          <button
            type="button"
            onClick={() => setUiValidationError(null)}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

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
