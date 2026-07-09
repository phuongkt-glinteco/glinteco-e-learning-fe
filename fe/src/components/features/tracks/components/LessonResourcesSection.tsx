'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import {
  getLessonExercises,
  addLessonExercise,
  removeLessonExercise,
  getLessonDocuments,
  addLessonDocument,
  removeLessonDocument,
  type LessonExerciseItem,
  type LessonRelativeDocumentItem,
} from '@/mocks/lessonExtendedMock';

interface LessonResourcesSectionProps {
  lessonId: string;
}

export function LessonResourcesSection({ lessonId }: LessonResourcesSectionProps) {
  const t = useTranslations('CreateTrackPage');
  const [exercises, setExercises] = useState<LessonExerciseItem[]>(() =>
    getLessonExercises(lessonId)
  );
  const [documents, setDocuments] = useState<LessonRelativeDocumentItem[]>(() =>
    getLessonDocuments(lessonId)
  );

  // Quick form state for adding Document
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocType, setNewDocType] = useState<LessonRelativeDocumentItem['type']>('PDF');

  // Quick form state for adding Exercise
  const [showAddExForm, setShowAddExForm] = useState(false);
  const [newExTitle, setNewExTitle] = useState('');
  const [newExType, setNewExType] = useState<LessonExerciseItem['type']>('PR_SUBMIT');
  const [newExDifficulty, setNewExDifficulty] = useState<LessonExerciseItem['difficulty']>('Medium');

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExTitle.trim()) return;
    const added = addLessonExercise(lessonId, {
      title: newExTitle.trim(),
      type: newExType,
      status: 'active',
      submissionsCount: 0,
      difficulty: newExDifficulty,
    });
    setExercises((prev) => [...prev, added]);
    setNewExTitle('');
    setShowAddExForm(false);
  };

  const handleRemoveExercise = (exId: string) => {
    removeLessonExercise(lessonId, exId);
    setExercises((prev) => prev.filter((item) => item.id !== exId));
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocUrl.trim()) return;
    const added = addLessonDocument(lessonId, {
      title: newDocTitle.trim(),
      type: newDocType,
      url: newDocUrl.trim(),
      sizeOrDuration: '1.2 MB',
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setDocuments((prev) => [...prev, added]);
    setNewDocTitle('');
    setNewDocUrl('');
    setShowAddDocForm(false);
  };

  const handleRemoveDocument = (docId: string) => {
    removeLessonDocument(lessonId, docId);
    setDocuments((prev) => prev.filter((item) => item.id !== docId));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* 1. LESSON EXERCISES CARD */}
      <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-outline-variant/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon icon="lucide:code-2" className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-on-surface">
              {t('exercisesHeading')} ({exercises.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowAddExForm(!showAddExForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
            <span>{t('addExerciseBtn')}</span>
          </button>
        </div>

        {showAddExForm && (
          <form
            onSubmit={handleCreateExercise}
            className="p-4 rounded-xl bg-surface-container/30 border border-outline-variant space-y-3 animate-in fade-in"
          >
            <input
              type="text"
              value={newExTitle}
              onChange={(e) => setNewExTitle(e.target.value)}
              placeholder="Tiêu đề bài tập..."
              className="w-full h-9 px-3 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface"
              required
            />
            <div className="flex items-center gap-2">
              <select
                value={newExType}
                onChange={(e) => setNewExType(e.target.value as LessonExerciseItem['type'])}
                className="h-9 px-2.5 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface font-semibold"
              >
                <option value="PR_SUBMIT">PR Submit</option>
                <option value="CODING">Coding</option>
                <option value="QUIZ">Quiz</option>
              </select>
              <select
                value={newExDifficulty}
                onChange={(e) => setNewExDifficulty(e.target.value as LessonExerciseItem['difficulty'])}
                className="h-9 px-2.5 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface font-semibold"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <button
                type="submit"
                className="ml-auto px-4 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
              >
                +
              </button>
            </div>
          </form>
        )}

        {exercises.length === 0 ? (
          <div className="py-10 text-center bg-surface-container/20 rounded-xl border border-dashed border-outline-variant text-xs text-on-surface-variant">
            {t('noExercises')}
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-outline-variant/80 bg-surface hover:border-primary/40 transition-all"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                      {ex.type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container text-on-surface-variant">
                      {ex.difficulty}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-on-surface line-clamp-1">
                    {ex.title}
                  </h4>
                  <div className="text-[11px] text-on-surface-variant">
                    {ex.submissionsCount} {t('submissionsLabel')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveExercise(ex.id)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors shrink-0"
                >
                  <Icon icon="lucide:trash-2" className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. RELATIVE DOCUMENTS CARD */}
      <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-outline-variant/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Icon icon="lucide:file-text" className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-on-surface">
              {t('documentsHeading')} ({documents.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowAddDocForm(!showAddDocForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
            <span>{t('addDocumentBtn')}</span>
          </button>
        </div>

        {showAddDocForm && (
          <form
            onSubmit={handleCreateDocument}
            className="p-4 rounded-xl bg-surface-container/30 border border-outline-variant space-y-3 animate-in fade-in"
          >
            <input
              type="text"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder={t('docTitlePlaceholder')}
              className="w-full h-9 px-3 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface"
              required
            />
            <div className="flex items-center gap-2">
              <select
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value as LessonRelativeDocumentItem['type'])}
                className="h-9 px-2.5 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface font-semibold"
              >
                <option value="PDF">PDF</option>
                <option value="LINK">Link / URL</option>
                <option value="SLIDES">Slides</option>
                <option value="MARKDOWN">Markdown</option>
              </select>
              <input
                type="url"
                value={newDocUrl}
                onChange={(e) => setNewDocUrl(e.target.value)}
                placeholder={t('docUrlPlaceholder')}
                className="flex-1 h-9 px-3 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface"
                required
              />
              <button
                type="submit"
                className="px-4 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
              >
                +
              </button>
            </div>
          </form>
        )}

        {documents.length === 0 ? (
          <div className="py-10 text-center bg-surface-container/20 rounded-xl border border-dashed border-outline-variant text-xs text-on-surface-variant">
            {t('noDocuments')}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-outline-variant/80 bg-surface hover:border-amber-500/40 transition-all"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 uppercase">
                      {doc.type}
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      {doc.sizeOrDuration}
                    </span>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-xs text-on-surface hover:text-primary transition-colors line-clamp-1 block"
                  >
                    {doc.title}
                  </a>
                  <div className="text-[10px] text-on-surface-variant/70 truncate">
                    {doc.url}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveDocument(doc.id)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors shrink-0"
                >
                  <Icon icon="lucide:trash-2" className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
