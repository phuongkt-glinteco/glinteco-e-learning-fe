'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/lib/md-renderer';
import { lessonsControllerFindOneLesson, lessonsControllerFindExercisesByLesson, documentsControllerCreate } from '@/services/api-client';
import type { LessonDetailDto, ExerciseSummaryDto, DocumentResponseDto } from '@/services/api-client';
import ResourceDocumentPickerDialog from '@/components/features/tracks/exercises/ResourceDocumentPickerDialog';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import { DynamicBreadcrumbs } from '@/components/ui/containers/DynamicBreadcrumbs';

const TYPE_ICON: Record<string, string> = {
  video: 'play_circle',
  reading: 'menu_book',
  quiz: 'quiz',
  coding: 'code',
  assignment: 'assignment',
};

export default function LessonDetailPage({ trackId, lessonId }: { trackId: string; lessonId: string }) {
  const t = useTranslations('TrackDetailPage');
  const [lesson, setLesson] = useState<LessonDetailDto | null>(null);
  const [exercises, setExercises] = useState<ExerciseSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { pushNode, setTree, tree } = useBreadcrumbStore();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [addingDoc, setAddingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [lessonRes, exRes] = await Promise.all([
        lessonsControllerFindOneLesson({ path: { id: lessonId }, throwOnError: true }),
        lessonsControllerFindExercisesByLesson({ path: { id: lessonId }, throwOnError: true }).catch(() => null),
      ]);
      setLesson(lessonRes.data as LessonDetailDto);
      setExercises(exRes?.data?.data ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (lesson) {
      if (tree.length === 0) {
        setTree([
          { label: t('breadcrumbTracks', { defaultValue: 'Tracks' }), href: '/admin/tracks' },
          { label: t('breadcrumbDetail', { defaultValue: 'Detail' }), href: `/admin/tracks/${trackId}` }
        ]);
      }
      pushNode({ label: lesson.title, href: window.location.pathname });
    }
  }, [lesson?.id, trackId, setTree, pushNode, tree.length]);

  const handleAddDocuments = useCallback(async (docIds: string[]) => {
    if (!lesson || docIds.length === 0) return;
    setAddingDoc(true);
    setDocError(t('lessonDocumentLinkUnsupported'));
    setAddingDoc(false);
  }, [lesson]);

  const handleCreateDocument = useCallback(async () => {
    setAddingDoc(true);
    setDocError(null);
    try {
      const kind = prompt('Document type (Guide/Reference/Runbook/Tutorial/Link):');
      if (!kind || !['Guide', 'Reference', 'Runbook', 'Tutorial', 'Link'].includes(kind as never)) return;
      const title = prompt('Document title:');
      if (!title) return;
      const content = prompt('Document content (optional):') || undefined;
      const res = await documentsControllerCreate({
        body: { title, kind: kind as 'Guide' | 'Reference' | 'Runbook' | 'Tutorial' | 'Link', content },
        throwOnError: true,
      });
      const newDoc = res.data as DocumentResponseDto;
      if (newDoc?.id) {
        await handleAddDocuments([newDoc.id]);
      } else {
        setDocError(t('lessonDocumentCreatedNotLinked'));
      }
    } catch {
      setDocError(t('lessonDocumentCreateFailed'));
    } finally {
      setAddingDoc(false);
    }
  }, [handleAddDocuments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-outline animate-spin">refresh</span>
          <p className="text-outline font-label-md">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-[48px] text-error">error</span>
          <p className="text-on-surface font-label-lg">{t('failedToLoad')}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-gutter py-6 max-w-[1200px] mx-auto w-full">
      <div className="mb-4">
        <DynamicBreadcrumbs />
      </div>

      <div className="grid grid-cols-12 gap-lg">
        <div className="col-span-12 lg:col-span-8 space-y-lg">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center gap-3 mb-4">
              {lesson.type && (
                <span className="material-symbols-outlined text-primary text-[24px]">{TYPE_ICON[lesson.type] || 'help_outline'}</span>
              )}
              <h2 className="text-[28px] font-bold text-on-surface">{lesson.title}</h2>
            </div>
            {lesson.description && (
              <p className="text-body-md text-on-surface-variant mb-4">{lesson.description}</p>
            )}
            <div className="flex items-center gap-4 text-label-sm text-outline mb-6">
              <span className="px-2 py-1 bg-surface-container-high rounded">{lesson.type}</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {lesson.estimatedTime}
              </span>
            </div>
            <div className="border-t border-outline-variant pt-6">
              {lesson.body ? (
                <div className="text-on-surface-variant">
                  <MarkdownRenderer content={lesson.body} />
                </div>
              ) : (
                <p className="text-body-sm text-secondary italic">No content yet.</p>
              )}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-lg">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-sm text-on-surface">Documents</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPickerOpen(true)}
                  disabled={addingDoc}
                  className="flex items-center gap-1 px-3 py-1.5 border border-primary text-primary rounded-lg font-label-sm hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Existing
                </button>
                <button
                  onClick={handleCreateDocument}
                  disabled={addingDoc}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">note_add</span>
                  New
                </button>
              </div>
            </div>
            {docError && (
              <div className="mb-3 p-2 bg-error-container text-on-error-container rounded text-label-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {docError}
              </div>
            )}
            {(!lesson.relatedDocs || lesson.relatedDocs.length === 0) ? (
              <div className="py-6 text-center text-outline font-label-sm border border-dashed border-outline-variant rounded-lg">
                No documents linked.
              </div>
            ) : (
              <div className="space-y-2">
                {lesson.relatedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-label-md text-on-surface truncate">{doc.title}</p>
                      <p className="text-label-sm text-outline">{doc.kind}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-sm text-on-surface">Exercises</h3>
              <Link
                href={`/admin/tracks/${trackId}/exercises/new?lessonId=${lessonId}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-sm hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Create Exercise
              </Link>
            </div>
            {exercises.length === 0 ? (
              <div className="py-6 text-center text-outline font-label-sm border border-dashed border-outline-variant rounded-lg">
                No exercises linked to this lesson.
              </div>
            ) : (
              <div className="space-y-2">
                {exercises.map((ex) => (
                  <div key={ex.id} className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg">
                    <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-label-md text-on-surface truncate">{ex.title}</p>
                      <p className="text-label-sm text-outline">{ex.brief}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Link
          href={`/admin/tracks/${trackId}/lessons/${lessonId}/edit`}
          className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg font-label-md hover:bg-primary/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Edit Lesson
        </Link>
      </div>

      <ResourceDocumentPickerDialog
        open={pickerOpen}
        selectedIds={(lesson.relatedDocs?.map((d) => d.id).filter(Boolean) as string[]) ?? []}
        onClose={() => setPickerOpen(false)}
        onConfirm={handleAddDocuments}
      />
    </div>
  );
}
