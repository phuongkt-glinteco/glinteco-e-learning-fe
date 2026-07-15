'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
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
import { LessonEditorBottomBar, type ViewportMode } from './LessonEditorBottomBar';
import { useLessonDraftStore } from '@/stores/lessonDraftStore';
import { AILessonGeneratorModal } from './AILessonGeneratorModal';

type LessonEditorPageProps = {
  trackId?: string;
  lessonId?: string;
  editIndex?: number | string;
};

type CachedLesson = LessonProgressItemDto & {
  description?: string | null;
  estimatedTime?: string;
  body?: string;
};

type CachedTrackDetail = {
  id: string;
  title: string;
  lessons?: CachedLesson[];
};

type CachedTrackEntry = {
  track: CachedTrackDetail;
  exercises: unknown[];
};

export function LessonEditorPage({ trackId, lessonId, editIndex }: LessonEditorPageProps) {
  const router = useRouter();
  const t = useTranslations('PuckEditor.Lesson.messages');
  const [currentPuckData, setCurrentPuckData] = useState<LessonPuckData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uiValidationError, setUiValidationError] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('15 min');
  const [lessonType, setLessonType] = useState<'video' | 'reading' | 'quiz' | 'coding' | 'assignment'>('reading');
  const [order, setOrder] = useState(1);
  const [body, setBody] = useState('');
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [aiVersion, setAiVersion] = useState(0);

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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu bài học';
        toast.error(msg);
      }
    }
    fetchLesson();
  }, [lessonId, trackId, draftKey, getDraft]);

  useEffect(() => {
    if (lessonId) return;
    if (!trackId || editIndex === undefined) return;
    const entry = queryCache.get<CachedTrackEntry>(`/tracks/${trackId}`);
    const idx = Number(editIndex);
    if (entry?.track?.lessons?.[idx] && !getDraft(draftKey)) {
      const lesson = entry.track.lessons[idx];
      setTitle(lesson.title ?? '');
      setDescription(lesson.description ?? '');
      setLessonType((lesson.type as 'video' | 'reading' | 'quiz' | 'coding' | 'assignment') ?? 'reading');
      setOrder(lesson.order ?? idx + 1);
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

  async function refreshTrackCache(tId: string) {
    try {
      const refreshRes = await lessonsControllerFindLessons({
        path: { id: tId },
        throwOnError: true,
      });
      const fullTrack = queryCache.get<CachedTrackEntry>(`/tracks/${tId}`);
      if (fullTrack) {
        queryCache.set(`/tracks/${tId}`, {
          ...fullTrack,
          track: {
            ...fullTrack.track,
            lessons: (refreshRes.data as { items?: CachedLesson[] })?.items || [],
          },
        });
      }
    } catch (err: unknown) {
      console.error('Failed to refresh track lessons cache:', err);
    }
  }

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
      setUiValidationError(t('titleRequired'));
      return;
    }
    setUiValidationError(null);

    // Auto save draft before attempting API call
    saveDraft(draftKey, {
      title: updatedTitle,
      description: updatedDescription,
      estimatedTime: updatedTime,
      type: (updatedType as 'video' | 'reading' | 'quiz' | 'coding' | 'assignment') || lessonType,
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
        toast.success(t('updateSuccess'));
        await refreshTrackCache(trackId);
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
        toast.success(t('createSuccess'));

        const createdLesson = createRes.data as { id?: string } | undefined;
        const newLessonId = createdLesson?.id;

        await refreshTrackCache(trackId);

        if (newLessonId) {
          router.replace(`/tracks/${trackId}/lessons/${newLessonId}/edit`);
          setSaving(false);
          return;
        }
      }
    } catch (err: unknown) {
      setSaving(false);
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu bài học';
      toast.error(msg);
      return;
    }
    setSaving(false);
    router.back();
  }

  function handleAiGenerate() {
    setAiModalOpen(true);
  }

  function handleConfirmAiGenerate(generatedData: LessonPuckData) {
    setCurrentPuckData(generatedData);
    if (generatedData.root?.props) {
      if (generatedData.root.props.title) setTitle(String(generatedData.root.props.title));
      if (generatedData.root.props.description) setDescription(String(generatedData.root.props.description));
      if (generatedData.root.props.estimatedTime) setEstimatedTime(String(generatedData.root.props.estimatedTime));
      if (generatedData.root.props.type) {
        const typeStr = String(generatedData.root.props.type);
        if (['video', 'reading', 'quiz', 'coding', 'assignment'].includes(typeStr)) {
          setLessonType(typeStr as 'video' | 'reading' | 'quiz' | 'coding' | 'assignment');
        }
      }
    }
    setBody(JSON.stringify(generatedData));
    setAiVersion((v) => v + 1);
    toast.success(t('aiGenerateSuccess'));
  }

  return (
    <main className="w-full flex-1 flex flex-col bg-surface-container-lowest">
      <FeatureBarPortal
        bottomBar={
          <LessonEditorBottomBar
            onHandleAiGenerate={handleAiGenerate}
            onSave={() => handlePublishPuck(currentPuckData || puckData)}
            saving={saving}
            canSave={true}
            onCancel={() => router.back()}
            onReset={() => {
              clearDraft(draftKey);
              setBody('');
            }}
            isPreview={!isEditing}
            onPreviewToggle={() => setIsEditing(!isEditing)}
            viewport={viewport}
            onViewportChange={(vp) => setViewport(vp)}
          />
        }
      />

      {uiValidationError && (
        <div className="mx-4 mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-sm text-error font-medium flex items-center justify-between">
          <span>⚠️ {uiValidationError}</span>
          <button
            type="button"
            onClick={() => setUiValidationError(null)}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            {t('closeBtn')}
          </button>
        </div>
      )}

      <div className="flex-1 w-full h-full flex flex-col overflow-hidden min-h-0">
        {isEditing ? (
          <PuckStudio
            key={`${lessonId || "new"}-${title}-${aiVersion}`}
            config={lessonConfig}
            initialData={currentPuckData || puckData}
            onChange={(newData) => setCurrentPuckData(newData)}
            onPublish={handlePublishPuck}
            overrides={{ headerActions: () => null }}
          />
        ) : (
          <div className="w-full h-full overflow-y-auto bg-surface-container-low p-4 md:p-8 flex justify-center">
            <div
              className={`transition-all duration-300 w-full ${
                viewport === 'tablet'
                  ? 'max-w-[768px] border border-border rounded-2xl shadow-xl bg-surface overflow-hidden'
                  : viewport === 'mobile'
                    ? 'max-w-[375px] border border-border rounded-2xl shadow-xl bg-surface overflow-hidden'
                    : 'w-full bg-surface'
              }`}
            >
              <PuckViewer config={lessonConfig} data={currentPuckData || puckData} />
            </div>
          </div>
        )}
      </div>

      <AILessonGeneratorModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        initialTitle={title}
        initialDescription={description}
        initialEstimatedTime={estimatedTime}
        onConfirmGenerate={handleConfirmAiGenerate}
      />
    </main>
  );
}
