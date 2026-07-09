'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { buildTimeString, type TimeUnit } from '@/lib/time-utils';
import {
  lessonsControllerCreateLesson,
  lessonsControllerUpdateLesson,
  lessonsControllerFindOneLesson,
  lessonsControllerFindLessons,
} from '@/services/api-client';
import type { LessonDetailDto } from '@/services/api-client';
import { queryCache } from '@/lib/queryCache';
import { Icon } from '@iconify/react';
import { LessonResourcesSection } from './LessonResourcesSection';

import {
  LessonCanvasEditor,
  CanvasRightAside,
  parseBodyToBlocks,
  serializeBlocksToBody,
  type CanvasBlock,
  type CanvasBlockProps,
  type SpacingVariant,
} from '../canvas-editor';

interface LessonEditorPageProps {
  trackId?: string;
  lessonId?: string;
  editIndex?: number;
}

type LessonEditorType = 'video' | 'reading' | 'quiz' | 'coding' | 'assignment';

const UNIT_OPTIONS: { value: TimeUnit; labelKey: string }[] = [
  { value: 'm', labelKey: 'minutes' },
  { value: 'h', labelKey: 'hours' },
  { value: 'd', labelKey: 'days' },
  { value: 'w', labelKey: 'weeks' },
  { value: 'M', labelKey: 'months' },
];

const LESSON_TYPE_OPTIONS: { value: LessonEditorType; labelKey: string; icon: string; color: string }[] = [
  { value: 'reading', labelKey: 'typeReading', icon: 'lucide:book-open', color: 'text-blue-500 bg-blue-500/10' },
  { value: 'video', labelKey: 'typeVideo', icon: 'lucide:video', color: 'text-purple-500 bg-purple-500/10' },
  { value: 'coding', labelKey: 'typeCoding', icon: 'lucide:code-2', color: 'text-emerald-500 bg-emerald-500/10' },
  { value: 'quiz', labelKey: 'typeQuiz', icon: 'lucide:help-circle', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'assignment', labelKey: 'typeAssignment', icon: 'lucide:clipboard-check', color: 'text-rose-500 bg-rose-500/10' },
];

export function LessonEditorPage({ trackId, lessonId }: LessonEditorPageProps) {
  const t = useTranslations('CreateTrackPage');
  const tu = useTranslations('TimeUnit');
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessonType, setLessonType] = useState<LessonEditorType>('reading');
  const [order, setOrder] = useState(1);
  const [numValue, setNumValue] = useState('');
  const [unit, setUnit] = useState<TimeUnit>('m');

  const [blocks, setBlocks] = useState<CanvasBlock[]>(() => parseBodyToBlocks(''));
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [showAside, setShowAside] = useState(true);
  const [documentSpacing, setDocumentSpacing] = useState<SpacingVariant>('normal');

  const [activeMainTab, setActiveMainTab] = useState<'content' | 'resources'>('content');

  useEffect(() => {
    if (!lessonId) return;
    async function fetchLesson() {
      if (!trackId || !lessonId) return;
      try {
        const res = await lessonsControllerFindOneLesson({
          path: { id: lessonId },
          throwOnError: true,
        });
        const found = res.data as LessonDetailDto;
        if (found) {
          setTitle(found.title ?? '');
          setDescription(found.description ?? '');
          setLessonType(found.type ?? 'reading');
          setOrder(found.order ?? 1);
          setBlocks(parseBodyToBlocks(found.body ?? ''));
          if (found.estimatedTime) {
            const match = found.estimatedTime.match(/^(\d+(?:\.\d+)?)\s*(m|h|d|w|M)$/);
            if (match) {
              setNumValue(match[1]);
              setUnit(match[2] as TimeUnit);
            }
          }
        }
      } catch {
        // silent
      }
    }
    fetchLesson();
  }, [trackId, lessonId]);

  useEffect(() => {
    if (!trackId || lessonId) return;
    async function fetchNextOrder() {
      try {
        const res = await lessonsControllerFindLessons({
          path: { id: trackId! },
          throwOnError: true,
        });
        const lessons = res.data?.data ?? [];
        const maxOrder = lessons.reduce((max, l) => Math.max(max, l.order ?? 0), 0);
        setOrder(maxOrder + 1);
      } catch {
        setOrder(1);
      }
    }
    fetchNextOrder();
  }, [trackId, lessonId]);

  const estimatedTime =
    numValue && !isNaN(Number(numValue)) ? buildTimeString(Number(numValue), unit) : '';

  async function handleSave() {
    if (!title.trim() || saving) return;
    setSaving(true);

    const serializedBody = serializeBlocksToBody(blocks);

    try {
      if (lessonId) {
        await lessonsControllerUpdateLesson({
          path: { id: lessonId },
          body: {
            title: title.trim(),
            description: description.trim() || null,
            order,
            estimatedTime: estimatedTime || '0m',
            body: serializedBody,
          },
          throwOnError: true,
        });
        if (trackId) {
          queryCache.invalidate(`track-detail-${trackId}`);
        }
      } else if (trackId) {
        await lessonsControllerCreateLesson({
          path: { id: trackId },
          body: {
            title: title.trim(),
            description: description.trim() || null,
            order,
            estimatedTime: estimatedTime || '0m',
            body: serializedBody,
          },
          throwOnError: true,
        });
        queryCache.invalidate(`track-detail-${trackId}`);
      }
    } catch {
      setSaving(false);
      return;
    }
    setSaving(false);
    router.back();
  }

  const handleBlockPropsChange = (blockId: string, newProps: CanvasBlockProps) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, props: newProps } : b))
    );
  };

  const handleBatchUpdateProps = (ids: string[], newPropsPartial: Partial<CanvasBlockProps>) => {
    setBlocks((prev) =>
      prev.map((b) =>
        ids.includes(b.id) ? { ...b, props: { ...b.props, ...newPropsPartial } } : b
      )
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
    setSelectedBlockIds((prev) => prev.filter((id) => id !== blockId));
  };

  const handleBatchDeleteBlocks = (ids: string[]) => {
    setBlocks((prev) => prev.filter((b) => !ids.includes(b.id)));
    setSelectedBlockId(null);
    setSelectedBlockIds([]);
  };

  const handleDuplicateBlock = (blockId: string) => {
    const targetIdx = blocks.findIndex((b) => b.id === blockId);
    if (targetIdx === -1) return;
    const target = blocks[targetIdx];
    const cloned: CanvasBlock = {
      ...target,
      id: 'block_' + Math.random().toString(36).substring(2, 11),
      props: { ...target.props },
    };
    const next = [
      ...blocks.slice(0, targetIdx + 1),
      cloned,
      ...blocks.slice(targetIdx + 1),
    ];
    setBlocks(next);
    setSelectedBlockId(cloned.id);
  };

  // Header Card thiết kế chuẩn Notion / Document sang trọng, tinh gọn
  const currentTypeConfig =
    LESSON_TYPE_OPTIONS.find((t) => t.value === lessonType) || LESSON_TYPE_OPTIONS[0];

  const lessonHeaderCard = (
    <div className="group relative mb-4 overflow-hidden rounded-3xl border border-outline-variant/80 bg-surface/90 p-7 shadow-sm transition-all hover:border-outline hover:shadow-md">
      {/* Decorative top accent glow strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-purple-500 opacity-80" />

      {/* Top Ribbon: Metadata Pills */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Lesson Type Pill */}
        <div className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-variant/30 px-3 py-1.5">
          <Icon icon={currentTypeConfig.icon} className={`h-4 w-4 ${currentTypeConfig.color.split(' ')[0]}`} />
          <select
            className="border-none bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer"
            value={lessonType}
            onChange={(e) => setLessonType(e.target.value as LessonEditorType)}
          >
            {LESSON_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {/* Lesson Order Pill */}
        <div className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface">
          <Icon icon="lucide:hash" className="h-3.5 w-3.5 text-secondary" />
          <span className="text-secondary">Bài số:</span>
          <input
            type="number"
            min={1}
            className="w-10 border-none bg-transparent p-0 font-extrabold text-primary focus:outline-none"
            value={order}
            onChange={(e) => setOrder(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>

        {/* Estimated Time Pill */}
        <div className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface">
          <Icon icon="lucide:clock" className="h-3.5 w-3.5 text-secondary" />
          <input
            type="number"
            min={0}
            step="0.5"
            className="w-12 border-none bg-transparent p-0 text-xs font-bold text-on-surface focus:outline-none"
            placeholder="0"
            value={numValue}
            onChange={(e) => setNumValue(e.target.value)}
          />
          <select
            className="border-none bg-transparent text-xs font-bold text-secondary outline-none cursor-pointer"
            value={unit}
            onChange={(e) => setUnit(e.target.value as TimeUnit)}
          >
            {UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {tu(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Title Input (Notion style huge bold) */}
      <div className="mb-3">
        <input
          data-header-input="title"
          className="w-full bg-transparent text-3xl sm:text-4xl font-black tracking-tight text-on-surface placeholder:text-on-surface-variant/35 focus:outline-none"
          placeholder={t('untitledLesson') || 'Nhập tiêu đề bài học...'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
              e.preventDefault();
              document.querySelector<HTMLElement>('[data-header-input="description"]')?.focus();
            }
          }}
        />
      </div>

      {/* Description input */}
      <div>
        <input
          data-header-input="description"
          className="w-full rounded-xl bg-transparent py-1 text-sm font-medium text-on-surface-variant placeholder:text-on-surface-variant/40 focus:bg-surface-variant/20 focus:px-3 focus:outline-none transition-all"
          placeholder={t('lessonDescriptionPlaceholder') || 'Thêm mô tả ngắn gọn về mục tiêu hoặc tổng quan bài học...'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              document.querySelector<HTMLElement>('[data-header-input="title"]')?.focus();
            } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
              e.preventDefault();
              const firstBlockEl = document.querySelector<HTMLElement>('[data-block-id] textarea, [data-block-id] input');
              firstBlockEl?.focus();
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <main className="flex flex-1 flex-col bg-background gap-0 overflow-hidden">
      {/* Topmost Navigation Control Tabs Bar */}
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface px-6 shrink-0">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveMainTab('content')}
            className={`flex items-center gap-2 py-3.5 px-6 text-sm font-bold border-b-2 transition-colors ${
              activeMainTab === 'content'
                ? 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-on-surface'
            }`}
          >
            <Icon icon="lucide:layout-template" className="w-4 h-4" />
            <span>Khối nội dung Canvas ({blocks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('resources')}
            className={`flex items-center gap-2 py-3.5 px-6 text-sm font-bold border-b-2 transition-colors ${
              activeMainTab === 'resources'
                ? 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-on-surface'
            }`}
          >
            <Icon icon="lucide:folder-git-2" className="w-4 h-4" />
            <span>{t('tabResources')}</span>
          </button>
        </div>

        {activeMainTab === 'content' && (
          <button
            type="button"
            onClick={() => setShowAside(!showAside)}
            title="Bật/Tắt cột thuộc tính bên phải"
            className="flex items-center gap-1.5 rounded-xl border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface transition-all"
          >
            <Icon
              icon={showAside ? 'lucide:panel-right-close' : 'lucide:panel-right-open'}
              className="h-4 w-4"
            />
            <span>{showAside ? 'Ẩn Cột Thuộc Tính' : 'Hiện Cột Thuộc Tính'}</span>
          </button>
        )}
      </div>

      {/* Body Content */}
      {activeMainTab === 'resources' ? (
        <div className="flex-1 w-full max-w-[1600px] mx-auto overflow-y-auto p-6">
          <LessonResourcesSection lessonId={lessonId || 'new'} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Main Visual Canvas Area (chứa headerCard ở trên cùng, bên dưới tab điều khiển) */}
          <div className="flex-1 overflow-y-auto bg-surface-container-lowest">
            <LessonCanvasEditor
              initialBlocks={blocks}
              onChangeBlocks={setBlocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              selectedBlockIds={selectedBlockIds}
              onSelectBlockIds={setSelectedBlockIds}
              headerSlot={lessonHeaderCard}
              onSave={handleSave}
              onCancel={() => router.back()}
              saving={saving}
              canSave={!!title.trim()}
              documentSpacing={documentSpacing}
            />
          </div>

          {/* Right Aside Inspector & Outline Panel */}
          {showAside && (
            <CanvasRightAside
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              selectedBlockIds={selectedBlockIds}
              onSelectBlock={setSelectedBlockId}
              onChangeBlockProps={handleBlockPropsChange}
              onDeleteBlock={handleDeleteBlock}
              onDuplicateBlock={handleDuplicateBlock}
              documentSpacing={documentSpacing}
              onChangeDocumentSpacing={setDocumentSpacing}
              onBatchUpdateProps={handleBatchUpdateProps}
              onBatchDeleteBlocks={handleBatchDeleteBlocks}
            />
          )}
        </div>
      )}
    </main>
  );
}
