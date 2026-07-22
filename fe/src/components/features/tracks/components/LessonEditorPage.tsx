'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations, useFormatter } from 'next-intl';
import { Icon } from '@iconify/react';
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
  parseBodyToPuckData,
  serializePuckDataToPayload,
  type LessonPuckData,
} from '@/components/puck-editor';
import { FeatureBarPortal } from '@/components/layout/FeatureBarPortal';
import { LessonEditorBottomBar } from './LessonEditorBottomBar';
import { useLessonDraftStore, type LessonDraftData } from '@/stores/lessonDraftStore';
import { useTrackDraftStore } from '@/stores/trackDraftStore';
import { AILessonGeneratorModal } from './AILessonGeneratorModal';
import Modal from '@/components/ui/Modal';
import { AppButton } from '@/components/ui/buttons';
import { useSidebar } from '@/components/ui/default/sidebar';

type SaveResultModalState = {
  status: 'success' | 'error';
  mode: 'create' | 'update' | 'draft';
  savedLessonId?: string;
  errorMessage?: string;
} | null;

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

function normalizeLessonType(type?: string | null): 'video' | 'reading' | 'quiz' | 'coding' | 'assignment' {
  if (type && ['video', 'reading', 'quiz', 'coding', 'assignment'].includes(type)) {
    return type as 'video' | 'reading' | 'quiz' | 'coding' | 'assignment';
  }
  return 'reading';
}

export function LessonEditorPage({ trackId, lessonId, editIndex }: LessonEditorPageProps) {
  const router = useRouter();
  const t = useTranslations('PuckEditor.Lesson.messages');
  const format = useFormatter();
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fill order when creating a new lesson
  useEffect(() => {
    if (lessonId || !trackId) return;
    lessonsControllerFindLessons({ path: { id: trackId } })
      .then((res) => {
        const data = res.data;
        const items = Array.isArray(data)
          ? data
          : data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)
          ? data.data
          : [];
        setOrder(items.length + 1);
      })
      .catch(() => {});
  }, [lessonId, trackId]);

  const [currentPuckData, setCurrentPuckData] = useState<LessonPuckData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uiValidationError, setUiValidationError] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [saveResultModal, setSaveResultModal] = useState<SaveResultModalState>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('15 min');
  const [lessonType, setLessonType] = useState<'video' | 'reading' | 'quiz' | 'coding' | 'assignment'>('reading');
  const [order, setOrder] = useState(1);
  const [body, setBody] = useState('');
  const [aiVersion, setAiVersion] = useState(0);

  const lessonConfig = useLessonPuckConfig();
  const [loadedLesson, setLoadedLesson] = useState<LessonDetailDto | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState<boolean>(Boolean(lessonId || editIndex !== undefined));

  const baselinePayloadRef = useRef<string | null>(null);
  const isPuckReadyRef = useRef<boolean>(false);
  const [dirtyDraftToRestore, setDirtyDraftToRestore] = useState<LessonDraftData | null>(null);

  const draftKey = `${trackId || 'track'}-${lessonId || editIndex || 'new'}`;

  const applyLessonDataToState = useCallback((raw: {
    title?: string | null;
    description?: string | null;
    estimatedTime?: string | null;
    type?: string | null;
    order?: number | null;
    body?: string | null;
    relatedDocs?: unknown[];
  }) => {
    const nTitle = raw.title ?? '';
    const nDesc = raw.description ?? '';
    const nTime = raw.estimatedTime ?? '15 min';
    const nType = normalizeLessonType(raw.type);
    const nOrder = raw.order ?? 1;
    const nBody = raw.body ?? '';

    setTitle(nTitle);
    setDescription(nDesc);
    setEstimatedTime(nTime);
    setLessonType(nType);
    setOrder(nOrder);
    setBody(nBody);

    const parsed = parseBodyToPuckData(nBody, {
      title: nTitle,
      description: nDesc,
      estimatedTime: nTime,
      order: nOrder,
      type: nType,
      documents: (raw.relatedDocs as any[]) || [],
      exercises: [],
    });
    setCurrentPuckData(parsed);
    setAiVersion((v) => v + 1);

    const canonicalPayload = serializePuckDataToPayload(parsed, {
      title: nTitle,
      description: nDesc,
      estimatedTime: nTime,
      order: nOrder,
      type: nType,
    });

    return {
      title: nTitle,
      description: nDesc,
      estimatedTime: nTime,
      type: nType,
      order: nOrder,
      body: nBody,
      parsed,
      canonicalPayload,
    };
  }, []);

  useEffect(() => {
    // Only auto-load draft on mount if creating a brand new standalone lesson
    if (lessonId || editIndex !== undefined) return;

    const draft = useLessonDraftStore.getState().getDraft(draftKey);
    if (draft && draft.body && draft.body.trim() && draft.body !== '{"content":[]}') {
      const result = applyLessonDataToState(draft);
      baselinePayloadRef.current = JSON.stringify(result.canonicalPayload);
      isPuckReadyRef.current = false;
    } else if (baselinePayloadRef.current === null) {
      const emptyParsed = parseBodyToPuckData('', {
        title: '',
        description: '',
        estimatedTime: '15 min',
        order: 1,
        type: 'reading',
        documents: [],
        exercises: [],
      });
      const payload = serializePuckDataToPayload(emptyParsed, {
        title: '',
        description: '',
        estimatedTime: '15 min',
        order: 1,
        type: 'reading',
      });
      baselinePayloadRef.current = JSON.stringify(payload);
      isPuckReadyRef.current = false;
    }
  }, [draftKey, lessonId, editIndex, applyLessonDataToState]);

  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

  useEffect(() => {
    if (!lessonId) return;
    async function fetchLesson() {
      if (!lessonId) return;
      setIsLoadingLesson(true);
      try {
        const res = await lessonsControllerFindOneLesson({ path: { id: lessonId }, throwOnError: true });
        const found = res.data as LessonDetailDto;
        if (found) {
          setLoadedLesson(found);
          const result = applyLessonDataToState({
            title: found.title,
            description: found.description,
            estimatedTime: found.estimatedTime,
            type: found.type,
            order: found.order,
            body: found.body,
            relatedDocs: found.relatedDocs || [],
          });
          baselinePayloadRef.current = JSON.stringify(result.canonicalPayload);
          isPuckReadyRef.current = false;

          const draft = useLessonDraftStore.getState().getDraft(draftKey);
          if (draft && draft.isDirty === true && draft.body !== result.canonicalPayload.body && draft.body !== result.body) {
            setDirtyDraftToRestore(draft);
          } else {
            setDirtyDraftToRestore(null);
            if (draft) useLessonDraftStore.getState().clearDraft(draftKey);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : tRef.current('loadError');
        toast.error(msg);
      } finally {
        setIsLoadingLesson(false);
      }
    }
    fetchLesson();
  }, [lessonId, trackId, draftKey, applyLessonDataToState]);

  useEffect(() => {
    if (lessonId) return;
    if (editIndex === undefined) return;
    const idx = Number(editIndex);

    const trackDraftLessons = useTrackDraftStore.getState().lessons;
    const storeLesson = trackDraftLessons?.[idx];
    if (storeLesson) {
      const result = applyLessonDataToState({
        title: storeLesson.title,
        description: '',
        estimatedTime: storeLesson.estimatedTime,
        type: 'reading',
        order: idx + 1,
        body: storeLesson.body,
      });
      baselinePayloadRef.current = JSON.stringify(result.canonicalPayload);
      isPuckReadyRef.current = false;

      const draft = useLessonDraftStore.getState().getDraft(draftKey);
      if (draft && draft.isDirty === true && draft.body !== result.canonicalPayload.body && draft.body !== result.body) {
        setDirtyDraftToRestore(draft);
      } else {
        setDirtyDraftToRestore(null);
        if (draft) useLessonDraftStore.getState().clearDraft(draftKey);
      }
      setIsLoadingLesson(false);
      return;
    }

    if (trackId) {
      const entry = queryCache.get<CachedTrackEntry>(`/tracks/${trackId}`);
      if (entry?.track?.lessons?.[idx]) {
        const lesson = entry.track.lessons[idx];
        const result = applyLessonDataToState({
          title: lesson.title,
          description: lesson.description,
          estimatedTime: lesson.estimatedTime,
          type: lesson.type,
          order: lesson.order || idx + 1,
          body: lesson.body,
        });
        baselinePayloadRef.current = JSON.stringify(result.canonicalPayload);
        isPuckReadyRef.current = false;

        const draft = useLessonDraftStore.getState().getDraft(draftKey);
        if (draft && draft.isDirty === true && draft.body !== result.canonicalPayload.body && draft.body !== result.body) {
          setDirtyDraftToRestore(draft);
        } else {
          setDirtyDraftToRestore(null);
          if (draft) useLessonDraftStore.getState().clearDraft(draftKey);
        }
      }
    }
    setIsLoadingLesson(false);
  }, [trackId, editIndex, lessonId, draftKey, applyLessonDataToState]);

  // Auto-save draft whenever currentPuckData or metadata changes (debounced by 800ms)
  useEffect(() => {
    if (!currentPuckData) return;
    const timer = setTimeout(() => {
      const payload = serializePuckDataToPayload(currentPuckData, {
        title,
        description,
        estimatedTime,
        order,
        type: lessonType,
      });
      const payloadStr = JSON.stringify(payload);

      // Do not mark as dirty if we haven't established baseline yet on existing lesson/track item
      if (baselinePayloadRef.current === null && (lessonId || editIndex !== undefined)) {
        return;
      }

      // Guard 1: If currently displaying a dirty draft recovery banner, do NOT auto-save or touch storage!
      // The draft in storage must remain frozen until the user explicitly clicks Restore or Discard.
      if (dirtyDraftToRestore !== null) {
        return;
      }

      // Guard 2: If PuckStudio has not yet mounted and run its initial normalization onChange,
      // wait until it stabilizes before starting auto-save comparisons.
      if (!isPuckReadyRef.current) {
        return;
      }

      const hasRealChanges = baselinePayloadRef.current !== null && payloadStr !== baselinePayloadRef.current;

      // If there are no real changes and storage already doesn't have a dirty draft for this key, no need to save clean data to storage
      const existingDraft = useLessonDraftStore.getState().getDraft(draftKey);
      if (!hasRealChanges && (!existingDraft || existingDraft.isDirty !== true)) {
        return;
      }

      useLessonDraftStore.getState().saveDraft(draftKey, {
        title: payload.title,
        description: payload.description,
        estimatedTime: payload.estimatedTime,
        type: normalizeLessonType(payload.type),
        order: payload.order,
        body: payload.body,
        isDirty: hasRealChanges,
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [currentPuckData, title, description, estimatedTime, lessonType, order, draftKey, lessonId, editIndex, dirtyDraftToRestore]);

  const puckData: LessonPuckData = useMemo(() => parseBodyToPuckData(body, {
    title,
    description,
    estimatedTime,
    order,
    type: lessonType,
    documents: loadedLesson?.relatedDocs || [],
    exercises: [],
  }), [body, title, description, estimatedTime, order, lessonType, loadedLesson]);

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
    useLessonDraftStore.getState().saveDraft(draftKey, {
      title: updatedTitle,
      description: updatedDescription,
      estimatedTime: updatedTime,
      type: normalizeLessonType(updatedType || lessonType),
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

        useLessonDraftStore.getState().clearDraft(draftKey);
        toast.success(t('updateSuccess'));
        await refreshTrackCache(trackId);
        setSaveResultModal({
          status: 'success',
          mode: 'update',
          savedLessonId: lessonId,
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

        useLessonDraftStore.getState().clearDraft(draftKey);
        toast.success(t('createSuccess'));

        const createdLesson = createRes.data as { id?: string } | undefined;
        const newLessonId = createdLesson?.id;

        await refreshTrackCache(trackId);

        setSaveResultModal({
          status: 'success',
          mode: 'create',
          savedLessonId: newLessonId,
        });
      } else if (editIndex !== undefined) {
        const store = useTrackDraftStore.getState();
        const idx = Number(editIndex);
        const draftLessonObj = {
          title: updatedTitle,
          estimatedTime: updatedTime,
          body: jsonBody,
        };
        if (!isNaN(idx) && idx >= 0 && idx < store.lessons.length) {
          store.updateLesson(idx, draftLessonObj);
        } else {
          store.addLesson(draftLessonObj);
        }
        useLessonDraftStore.getState().clearDraft(draftKey);
        toast.success(t('createSuccess'));
        setSaveResultModal({
          status: 'success',
          mode: 'draft',
        });
      }
    } catch (err: unknown) {
      setSaving(false);
      const msg = err instanceof Error ? err.message : t('saveError');
      toast.error(msg);
      setSaveResultModal({
        status: 'error',
        mode: lessonId ? 'update' : editIndex !== undefined ? 'draft' : 'create',
        errorMessage: msg,
      });
      return;
    }
    setSaving(false);
  }

  function handleRestoreDirtyDraft() {
    if (!dirtyDraftToRestore) return;
    applyLessonDataToState({
      title: dirtyDraftToRestore.title,
      description: dirtyDraftToRestore.description,
      estimatedTime: dirtyDraftToRestore.estimatedTime,
      type: dirtyDraftToRestore.type,
      order: dirtyDraftToRestore.order,
      body: dirtyDraftToRestore.body,
      relatedDocs: loadedLesson?.relatedDocs || [],
    });
    isPuckReadyRef.current = false;
    setDirtyDraftToRestore(null);
  }

  function handleDiscardDirtyDraft() {
    setDirtyDraftToRestore(null);
    useLessonDraftStore.getState().clearDraft(draftKey);
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

  if (isLoadingLesson) {
    return (
      <main className="w-full flex-1 flex flex-col items-center justify-center bg-surface-container-lowest min-h-screen">
        <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-surface border border-outline-variant shadow-sm max-w-xs w-full text-center animate-in fade-in duration-200">
          <Icon icon="lucide:loader-2" className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-medium text-on-surface-variant">
            {t('loadingLesson', { defaultValue: 'Đang tải dữ liệu bài học...' })}
          </span>
        </div>
      </main>
    );
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
              useLessonDraftStore.getState().clearDraft(draftKey);
              setBody('');
            }}
          />
        }
      />

      {dirtyDraftToRestore && (
        <div className="mx-4 mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/60 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <span className="text-base">⚠️</span>
            <div>
              <span className="font-semibold">{t('unsavedDraftDetected')}</span>
              <span className="text-xs text-amber-700 dark:text-amber-300/80 block sm:inline sm:ml-1">
                ({t('savedAt', { time: format.dateTime(new Date(dirtyDraftToRestore.updatedAt), { dateStyle: 'short', timeStyle: 'short' }) })})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleRestoreDirtyDraft}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {t('restoreDraftBtn')}
            </button>
            <button
              type="button"
              onClick={handleDiscardDirtyDraft}
              className="px-3 py-1.5 bg-amber-100/80 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {t('discardDraftBtn')}
            </button>
          </div>
        </div>
      )}

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
        <PuckStudio
          key={`${lessonId || "new"}-${aiVersion}`}
          config={lessonConfig}
          initialData={currentPuckData || puckData}
          onChange={(newData) => {
            setCurrentPuckData(newData);
            if (!isPuckReadyRef.current) {
              isPuckReadyRef.current = true;
              const existingDraft = useLessonDraftStore.getState().getDraft(draftKey);
              if (dirtyDraftToRestore === null && (!existingDraft || existingDraft.isDirty !== true)) {
                const initialPayload = serializePuckDataToPayload(newData, {
                  title,
                  description,
                  estimatedTime,
                  order,
                  type: lessonType,
                });
                baselinePayloadRef.current = JSON.stringify(initialPayload);
              }
            }
          }}
          onPublish={handlePublishPuck}
          overrides={{ headerActions: () => null }}
        />
      </div>

      <AILessonGeneratorModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        initialTitle={title}
        initialDescription={description}
        initialEstimatedTime={estimatedTime}
        onConfirmGenerate={handleConfirmAiGenerate}
      />

      <Modal
        open={!!saveResultModal}
        onClose={() => setSaveResultModal(null)}
        width={540}
        title={
          saveResultModal?.status === 'success'
            ? t('saveResultSuccessTitle', { defaultValue: 'Lưu bài học thành công!' })
            : t('saveResultErrorTitle', { defaultValue: 'Lưu bài học thất bại' })
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                saveResultModal?.status === 'success'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-error/10 text-error'
              }`}
            >
              <Icon
                icon={saveResultModal?.status === 'success' ? 'lucide:check-circle-2' : 'lucide:alert-circle'}
                className="w-6 h-6"
              />
            </div>
            <div className="space-y-1 flex-1 pt-0.5">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {saveResultModal?.status === 'success'
                  ? t('saveResultSuccessDesc', {
                      defaultValue:
                        'Dữ liệu bài học đã được lưu vào hệ thống. Bạn muốn tiếp tục thực hiện thao tác nào dưới đây?',
                    })
                  : saveResultModal?.errorMessage || t('errorOccurred')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-outline-variant/60 w-full">
            {saveResultModal?.status === 'success' ? (
              <>
                <AppButton
                  variant="outline"
                  className="px-2 py-2 text-xs sm:text-sm font-medium justify-center w-full whitespace-nowrap"
                  onClick={() => {
                    const modalState = saveResultModal;
                    setSaveResultModal(null);
                    if (modalState.mode === 'create' && modalState.savedLessonId && trackId) {
                      window.history.replaceState(
                        null,
                        '',
                        `/admin/tracks/${trackId}/lessons/${modalState.savedLessonId}/edit`
                      );
                    }
                  }}
                >
                  {t('stayAndEditBtn', { defaultValue: 'Tiếp tục sửa' })}
                </AppButton>

                <AppButton
                  variant="outline"
                  className="px-2 py-2 text-xs sm:text-sm font-medium justify-center w-full whitespace-nowrap"
                  onClick={() => {
                    setSaveResultModal(null);
                    if (trackId) {
                      router.push(`/admin/tracks/${trackId}`);
                    } else if (editIndex !== undefined) {
                      router.push('/admin/tracks/create');
                    } else {
                      router.back();
                    }
                  }}
                >
                  {t('backToTrackBtn', { defaultValue: 'Về lộ trình' })}
                </AppButton>

                <AppButton
                  variant="primary"
                  className="px-2 py-2 text-xs sm:text-sm font-medium justify-center w-full whitespace-nowrap"
                  onClick={() => {
                    const savedId = saveResultModal.savedLessonId || lessonId;
                    setSaveResultModal(null);
                    if (trackId && savedId) {
                      router.push(`/tracks/${trackId}/lessons/${savedId}`);
                    } else if (trackId) {
                      router.push(`/admin/tracks/${trackId}`);
                    } else {
                      router.push('/admin/tracks/create');
                    }
                  }}
                >
                  {t('goToLessonDetailBtn', { defaultValue: 'Xem bài học' })}
                </AppButton>
              </>
            ) : (
              <div className="sm:col-span-3 flex justify-end">
                <AppButton
                  variant="primary"
                  className="px-6 py-2 text-xs sm:text-sm font-medium justify-center"
                  onClick={() => setSaveResultModal(null)}
                >
                  {t('closeBtn', { defaultValue: 'Đóng' })}
                </AppButton>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </main>
  );
}
