'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  ListTree,
  BookOpen,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';
import { slugifyHeadingId } from '@/components/puck-editor/helper';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface LessonRightSidebarProps {
  lesson?: any;
  exercises?: any[];
  bodyContent?: string;
  canvasHeadings?: TocItem[];
  showToLearner?: boolean;
  maxHeadingLevel?: number;
  onAddRelatedDoc?: () => void;
  onRemoveRelatedDoc?: (id: string) => void;
  onAddExercise?: () => void;
}

function scrollToElementById(id: string) {
  let el = document.getElementById(id);
  if (!el) {
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of Array.from(iframes)) {
      try {
        const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (innerDoc) {
          el = innerDoc.getElementById(id);
          if (el) break;
        }
      } catch {
        // Ignore cross-origin frame access error
      }
    }
  }
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function LessonRightSidebar({
  lesson,
  exercises = [],
  bodyContent = '',
  canvasHeadings,
  showToLearner = true,
  maxHeadingLevel = 3,
  onAddRelatedDoc,
  onRemoveRelatedDoc,
  onAddExercise,
}: LessonRightSidebarProps) {
  const t = useTranslations('PuckEditor.Common.sidebar');

  const headings: TocItem[] = useMemo(() => {
    if (canvasHeadings !== undefined) {
      return canvasHeadings.filter((h) => h.level <= maxHeadingLevel);
    }
    const list: TocItem[] = [];
    if (!bodyContent) return list;

    try {
      const parsed = JSON.parse(bodyContent);
      if (parsed && Array.isArray(parsed.content)) {
        parsed.content.forEach((block: any, idx: number) => {
          if (block.type === 'HeadingBlock' && block.props?.title) {
            const levelNum = parseInt((block.props.level || 'h2').replace('h', ''), 10) || 2;
            if (levelNum <= maxHeadingLevel) {
              list.push({
                id: block.props.id || slugifyHeadingId(block.props.title),
                text: block.props.title,
                level: levelNum,
              });
            }
          }
        });
        return list;
      }
    } catch {
      // Fallback cho markdown
      const lines = bodyContent.split('\n');
      lines.forEach((line, idx) => {
        const match = line.match(/^(#{1,4})\s+(.+)$/);
        if (match) {
          const levelNum = match[1].length;
          if (levelNum <= maxHeadingLevel) {
            list.push({
              id: slugifyHeadingId(match[2]),
              text: match[2],
              level: levelNum,
            });
          }
        }
      });
    }
    return list;
  }, [bodyContent, canvasHeadings, maxHeadingLevel]);

  if (!showToLearner && typeof window !== 'undefined') {
    // Luôn hiển thị trong môi trường Editor, chỉ dùng cờ cho chế độ Learner View
  }

  return (
    <div className="flex flex-col gap-6 p-5 w-full">
      {/* COMPONENT 1: DOCUMENT CONTENT MAP (MỤC LỤC BÀI HỌC) */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-body-base text-on-surface">
          <ListTree className="w-5 h-5 text-primary" />
          <span>{t('tocTitle')}</span>
        </div>

        {headings.length > 0 ? (
          <nav className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {headings.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToElementById(item.id);
                }}
                className="block text-body-xs text-secondary hover:text-primary truncate transition-colors py-0.5 cursor-pointer"
                style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
              >
                • {item.text}
              </a>
            ))}
          </nav>
        ) : (
          <p className="text-label-xs text-secondary italic py-2 text-center">
            {t('tocEmpty')}
          </p>
        )}
      </div>

      {/* COMPONENT 2: RELATED DOCUMENTS LIST (TÀI LIỆU LIÊN QUAN) */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-body-base text-on-surface">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>{t('docsTitle')}</span>
          </div>
          {onAddRelatedDoc && (
            <button
              type="button"
              onClick={onAddRelatedDoc}
              className="text-label-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addBtn')}</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {lesson?.documents && lesson.documents.length > 0 ? (
            lesson.documents.map((doc: any, i: number) => (
              <div
                key={doc.id || i}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-container-low border border-outline-variant/60 text-body-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-secondary shrink-0" />
                  <span className="truncate font-medium text-on-surface">
                    {doc.title || doc.name || t('docFallback', { index: i + 1 })}
                  </span>
                </div>
                {onRemoveRelatedDoc && doc.id && (
                  <button
                    type="button"
                    onClick={() => onRemoveRelatedDoc(doc.id)}
                    className="text-error hover:opacity-80 p-0.5 transition-opacity cursor-pointer shrink-0"
                    title={t('deleteTitle')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-label-xs text-secondary italic py-2 text-center">
              {t('docsEmpty')}
            </p>
          )}
        </div>
      </div>

      {/* COMPONENT 3: RELATED EXERCISES LIST (BÀI TẬP LIÊN QUAN) */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-body-base text-on-surface">
            <FileText className="w-5 h-5 text-primary" />
            <span>{t('exercisesTitle')}</span>
          </div>
          {onAddExercise && (
            <button
              type="button"
              onClick={onAddExercise}
              className="text-label-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addBtn')}</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {exercises.length > 0 ? (
            exercises.map((ex, i) => (
              <div
                key={ex.id || i}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-container-low border border-outline-variant/60 text-body-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate font-medium text-on-surface">
                    {ex.title || t('exFallback', { index: i + 1 })}
                  </span>
                </div>
                <span className="text-label-xs bg-surface px-2 py-0.5 rounded border border-outline-variant text-secondary">
                  {ex.type || 'exercise'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-label-xs text-secondary italic py-2 text-center">
              {t('exercisesEmpty')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
