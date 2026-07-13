'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  ListTree,
  BookOpen,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { slugifyHeadingId } from '@/components/puck-editor/helper';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface TocTreeNode {
  id: string;
  text: string;
  level: number;
  children: TocTreeNode[];
}

interface LessonRightSidebarProps {
  lesson?: any;
  exercises?: any[];
  bodyContent?: string;
  canvasHeadings?: TocItem[];
  showToLearner?: boolean;
  maxHeadingLevel?: number;
  isEditing?: boolean;
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

function buildTocTree(items: TocItem[], maxLevel: number): TocTreeNode[] {
  const filtered = items.filter((item) => item.level <= maxLevel);
  const roots: TocTreeNode[] = [];
  const stack: { node: TocTreeNode; level: number }[] = [];

  for (const item of filtered) {
    const newNode: TocTreeNode = {
      id: item.id,
      text: item.text,
      level: item.level,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(newNode);
    } else {
      stack[stack.length - 1].node.children.push(newNode);
    }

    stack.push({ node: newNode, level: item.level });
  }

  return roots;
}

function TocTreeItem({ node }: { node: TocTreeNode }) {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(true);
  const hasChildren = node.children.length > 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 group">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-secondary hover:text-primary rounded transition-colors cursor-pointer shrink-0"
            aria-label="Toggle section"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-4.5 inline-block shrink-0" />
        )}
        <a
          href={`#${node.id}`}
          onClick={(e) => {
            e.preventDefault();
            scrollToElementById(node.id);
          }}
          className={`block truncate transition-colors py-0.5 cursor-pointer flex-1 ${
            node.level === 1
              ? 'font-semibold text-body-sm text-on-surface hover:text-primary'
              : node.level === 2
              ? 'font-medium text-body-xs text-secondary hover:text-primary'
              : 'font-normal text-body-xs text-secondary/80 hover:text-primary'
          }`}
        >
          {node.text}
        </a>
      </div>
      {hasChildren && isExpanded && (
        <div className="pl-3 border-l border-outline-variant/60 ml-2 space-y-1">
          {node.children.map((child) => (
            <TocTreeItem key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LessonRightSidebar({
  lesson,
  exercises = [],
  bodyContent = '',
  canvasHeadings,
  showToLearner = true,
  maxHeadingLevel = 3,
  isEditing = false,
  onAddRelatedDoc,
  onRemoveRelatedDoc,
  onAddExercise,
}: LessonRightSidebarProps) {
  const t = useTranslations('PuckEditor.Common.sidebar');

  const headings = useMemo(() => {
    if (canvasHeadings && canvasHeadings.length > 0) {
      return canvasHeadings.filter((item) => item.level <= maxHeadingLevel);
    }

    const list: TocItem[] = [];
    if (!bodyContent) return list;

    try {
      const parsed = JSON.parse(bodyContent);
      if (parsed && Array.isArray(parsed.content)) {
        parsed.content.forEach((block: any) => {
          if (block.type === 'HeadingBlock' && block.props?.title) {
            const levelNum =
              parseInt((block.props.level || 'h2').replace('h', ''), 10) || 2;
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
      // Not JSON, fallback to HTML parser
    }

    const headingRegex = /<(h[1-6])(?:\s+id="([^"]+)")?[^>]*>(.*?)<\/\1>/gi;
    let match;
    while ((match = headingRegex.exec(bodyContent)) !== null) {
      const levelNum = parseInt(match[1].replace('h', ''), 10);
      if (levelNum <= maxHeadingLevel) {
        list.push({
          id: match[2] || slugifyHeadingId(match[3]),
          text: match[3].replace(/<[^>]+>/g, ''),
          level: levelNum,
        });
      }
    }
    return list;
  }, [bodyContent, canvasHeadings, maxHeadingLevel]);

  const tocTree = useMemo(() => {
    return buildTocTree(headings, maxHeadingLevel);
  }, [headings, maxHeadingLevel]);

  const shouldRenderToc = showToLearner || isEditing;

  return (
    <div className="flex flex-col gap-6 p-5 w-full">
      {/* COMPONENT 1: DOCUMENT CONTENT MAP (MỤC LỤC BÀI HỌC) */}
      {shouldRenderToc && (
        <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-body-base text-on-surface">
              <ListTree className="w-5 h-5 text-primary" />
              <span>{t('tocTitle')}</span>
            </div>
            {!showToLearner && isEditing && (
              <span className="text-label-xs bg-error/10 text-error px-2 py-0.5 rounded-full border border-error/20">
                {t('hiddenFromLearnerBadge')}
              </span>
            )}
          </div>

          {tocTree.length > 0 ? (
            <nav className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {tocTree.map((node) => (
                <TocTreeItem key={node.id} node={node} />
              ))}
            </nav>
          ) : (
            <p className="text-label-xs text-secondary italic py-2 text-center">
              {t('tocEmpty')}
            </p>
          )}
        </div>
      )}

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
                  {ex.type || t('exerciseTypeFallback')}
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
