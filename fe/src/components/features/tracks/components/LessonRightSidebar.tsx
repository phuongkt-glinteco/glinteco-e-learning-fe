'use client';

import React, { useState, useMemo } from 'react';
import type { LessonDetailDto, ExerciseSummaryDto } from '@/services/api-client';

interface LessonRightSidebarProps {
  lesson?: any;
  exercises?: any[];
  bodyContent?: string;
  onAddRelatedDoc?: () => void;
  onRemoveRelatedDoc?: (id: string) => void;
  onAddExercise?: () => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function LessonRightSidebar({
  lesson,
  exercises = [],
  bodyContent = '',
  onAddRelatedDoc,
  onRemoveRelatedDoc,
  onAddExercise,
}: LessonRightSidebarProps) {
  const [maxHeadingLevel, setMaxHeadingLevel] = useState<number>(3);
  const [showToLearner, setShowToLearner] = useState<boolean>(true);
  const [domHeadings, setDomHeadings] = useState<TocItem[]>([]);

  React.useEffect(() => {
    const updateFromDOM = () => {
      const els = document.querySelectorAll('main h1, main h2, main h3, main h4');
      const list: TocItem[] = [];
      els.forEach((el, idx) => {
        const text = el.textContent?.trim();
        if (text) {
          const tag = el.tagName.toLowerCase();
          const levelNum = parseInt(tag.replace('h', ''), 10) || 2;
          if (levelNum <= maxHeadingLevel) {
            const id = el.id || `dom-heading-${idx}`;
            if (!el.id) el.id = id;
            list.push({ id, text, level: levelNum });
          }
        }
      });
      setDomHeadings(list);
    };

    updateFromDOM();
    const interval = setInterval(updateFromDOM, 2000);
    return () => clearInterval(interval);
  }, [maxHeadingLevel]);

  // 1. Tự động quét và trích xuất danh sách Heading từ bodyContent (Puck JSON hoặc Markdown) hoặc DOM live
  const headings: TocItem[] = useMemo(() => {
    if (domHeadings.length > 0) return domHeadings;
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
                id: `heading-${idx}`,
                text: block.props.title,
                level: levelNum,
              });
            }
          }
        });
        return list;
      }
    } catch {
      // Markdown fallback
      const lines = bodyContent.split('\n');
      lines.forEach((line, idx) => {
        const match = line.match(/^(#{1,4})\s+(.+)$/);
        if (match) {
          const levelNum = match[1].length;
          if (levelNum <= maxHeadingLevel) {
            list.push({
              id: `md-heading-${idx}`,
              text: match[2],
              level: levelNum,
            });
          }
        }
      });
    }
    return list;
  }, [bodyContent, maxHeadingLevel, domHeadings]);

  return (
    <div className="flex flex-col gap-6 p-5 w-full">
      {/* COMPONENT 1: DOCUMENT CONTENT MAP (MỤC LỤC BÀI HỌC) */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-body-base text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-primary">
              toc
            </span>
            <span>Mục lục nội dung (Map)</span>
          </div>
          <select
            value={maxHeadingLevel}
            onChange={(e) => setMaxHeadingLevel(Number(e.target.value))}
            className="text-label-xs bg-surface-container border border-outline-variant rounded px-2 py-1 outline-none text-secondary"
            title="Mức Heading tối đa hiển thị"
          >
            <option value={1}>H1</option>
            <option value={2}>H1 - H2</option>
            <option value={3}>H1 - H3</option>
            <option value={4}>H1 - H4</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-label-xs text-secondary border-b border-outline-variant pb-2">
          <span>Hiển thị với học viên:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showToLearner}
              onChange={(e) => setShowToLearner(e.target.checked)}
              className="rounded border-outline-variant text-primary focus:ring-0"
            />
            <span>{showToLearner ? 'Bật (Mặc định)' : 'Ẩn'}</span>
          </label>
        </div>

        {headings.length > 0 ? (
          <nav className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {headings.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(item.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
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
            Chưa có tiêu đề (Heading) nào trong bài học.
          </p>
        )}
      </div>

      {/* COMPONENT 2: RELATED DOCUMENTS LIST (TÀI LIỆU LIÊN QUAN) */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-body-base text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-primary">
              library_books
            </span>
            <span>Tài liệu liên quan</span>
          </div>
          {onAddRelatedDoc && (
            <button
              type="button"
              onClick={onAddRelatedDoc}
              className="text-label-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Thêm</span>
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
                  <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">
                    description
                  </span>
                  <span className="truncate font-medium text-on-surface">
                    {doc.title || doc.name || `Tài liệu #${i + 1}`}
                  </span>
                </div>
                {onRemoveRelatedDoc && doc.id && (
                  <button
                    type="button"
                    onClick={() => onRemoveRelatedDoc(doc.id)}
                    className="text-error hover:opacity-80 p-0.5 transition-opacity cursor-pointer shrink-0"
                    title="Xoá tài liệu"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      delete
                    </span>
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-label-xs text-secondary italic py-2 text-center">
              Chưa có tài liệu liên quan được đính kèm.
            </p>
          )}
        </div>
      </div>

      {/* COMPONENT 3: RELATED EXERCISES LIST (BÀI TẬP LIÊN QUAN) */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-body-base text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-primary">
              assignment
            </span>
            <span>Bài tập liên quan</span>
          </div>
          {onAddExercise && (
            <button
              type="button"
              onClick={onAddExercise}
              className="text-label-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Thêm</span>
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
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0">
                    quiz
                  </span>
                  <span className="truncate font-medium text-on-surface">
                    {ex.title || `Bài tập #${i + 1}`}
                  </span>
                </div>
                <span className="text-label-xs bg-surface px-2 py-0.5 rounded border border-outline-variant text-secondary">
                  {ex.type || 'exercise'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-label-xs text-secondary italic py-2 text-center">
              Chưa có bài tập liên quan cho bài học này.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
