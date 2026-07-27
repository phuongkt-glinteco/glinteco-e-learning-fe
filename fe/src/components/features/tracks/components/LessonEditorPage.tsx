'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer, parseFrontmatter } from '@/lib/md-renderer';
import { SyntaxGuide } from './SyntaxGuide';
import { LessonMetadata } from './LessonMetadata';
import { buildTimeString, type TimeUnit } from '@/lib/time-utils';
import { lessonsControllerCreateLesson, lessonsControllerUpdateLesson, lessonsControllerFindOneLesson, lessonsControllerFindLessons } from '@/services/api-client';
import type { LessonDetailDto, LessonProgressItemDto } from '@/services/api-client';
import { queryCache } from '@/lib/queryCache';

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

type ToolbarAction =
  | 'h1' | 'h2' | 'h3'
  | 'bold' | 'italic'
  | 'list' | 'olist'
  | 'quote' | 'code'
  | 'link' | 'image'
  | 'table'
  | 'info' | 'objective' | 'challenge'
  | 'tabs' | 'details';

interface ToolbarButton {
  action: ToolbarAction;
  icon: string;
  labelKey: string;
}

function useToolbarConfig(): ToolbarButton[] {
  return [
    { action: 'h1', icon: 'format_h1', labelKey: 'heading1' },
    { action: 'h2', icon: 'format_h2', labelKey: 'heading2' },
    { action: 'h3', icon: 'format_h3', labelKey: 'heading3' },
    { action: 'bold', icon: 'format_bold', labelKey: 'bold' },
    { action: 'italic', icon: 'format_italic', labelKey: 'italic' },
    { action: 'list', icon: 'format_list_bulleted', labelKey: 'bulletList' },
    { action: 'olist', icon: 'format_list_numbered', labelKey: 'numberedList' },
    { action: 'quote', icon: 'format_quote', labelKey: 'quote' },
    { action: 'code', icon: 'code', labelKey: 'codeBlock' },
    { action: 'link', icon: 'link', labelKey: 'link' },
    { action: 'image', icon: 'image', labelKey: 'image' },
    { action: 'table', icon: 'table', labelKey: 'table' },
    { action: 'info', icon: 'info', labelKey: 'calloutInfo' },
    { action: 'objective', icon: 'flag', labelKey: 'calloutObjective' },
    { action: 'challenge', icon: 'warning', labelKey: 'calloutChallenge' },
    { action: 'tabs', icon: 'tab', labelKey: 'tabs' },
    { action: 'details', icon: 'menu_open', labelKey: 'details' },
  ];
}

const SNIPPETS: Record<ToolbarAction, string> = {
  h1: '# ',
  h2: '## ',
  h3: '### ',
  bold: '****',
  italic: '**',
  list: '- ',
  olist: '1. ',
  quote: '> ',
  code: '```\n\n```',
  link: '[](url)',
  image: '![](url)',
  table: '| Header | Header |\n|--------|--------|\n| Cell | Cell |\n',
  info: ':::info\n\n:::',
  objective: ':::objective\n- \n:::',
  challenge: ':::challenge\n\n:::',
  tabs: ':::tabs\n\n@tab Title\n\n:::',
  details: ':::details Title\n\n:::',
};

const CURSOR_OFFSET: Record<ToolbarAction, number> = {
  h1: 2,
  h2: 3,
  h3: 4,
  bold: 2,
  italic: 1,
  list: 2,
  olist: 3,
  quote: 2,
  code: 4,
  link: 1,
  image: 2,
  table: 16,
  info: 11,
  objective: 16,
  challenge: 15,
  tabs: 20,
  details: 18,
};

const UNIT_OPTIONS: { value: TimeUnit; labelKey: string }[] = [
  { value: 'm', labelKey: 'minutes' },
  { value: 'h', labelKey: 'hours' },
  { value: 'd', labelKey: 'days_label' },
  { value: 'w', labelKey: 'weeks_label' },
  { value: 'M', labelKey: 'months_label' },
];

type LessonEditorType = NonNullable<LessonProgressItemDto['type']>;

const LESSON_TYPE_OPTIONS: { value: LessonEditorType; labelKey: string }[] = [
  { value: 'reading', labelKey: 'typeReading' },
  { value: 'video', labelKey: 'typeVideo' },
  { value: 'quiz', labelKey: 'typeQuiz' },
  { value: 'coding', labelKey: 'typeCoding' },
  { value: 'assignment', labelKey: 'typeAssignment' },
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
  const [body, setBody] = useState('');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!lessonId) return;
    async function fetchLesson() {
      if (!trackId || !lessonId) return;
      try {
        const res = await lessonsControllerFindOneLesson({ path: { id: lessonId }, throwOnError: true });
        const found = res.data as LessonDetailDto;
        if (found) {
          setTitle(found.title ?? '');
          setDescription(found.description ?? '');
          setLessonType(found.type ?? 'reading');
          setOrder(found.order ?? 1);
          setBody(found.body ?? '');
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
        const res = await lessonsControllerFindLessons({ path: { id: trackId! }, throwOnError: true });
        const lessons = res.data?.data ?? [];
        const maxOrder = lessons.reduce((max, lesson) => Math.max(max, lesson.order ?? 0), 0);
        setOrder(maxOrder + 1);
      } catch {
        setOrder(1);
      }
    }
    fetchNextOrder();
  }, [trackId, lessonId]);

  const insertMarkdown = useCallback((action: ToolbarAction) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.substring(start, end);
    const snippet = SNIPPETS[action];
    const offset = CURSOR_OFFSET[action];

    let inserted: string;
    let cursorPos: number;

    if (selected) {
      if (action === 'bold') {
        inserted = `**${selected}**`;
        cursorPos = start + inserted.length;
      } else if (action === 'italic') {
        inserted = `*${selected}*`;
        cursorPos = start + inserted.length;
      } else if (action === 'link') {
        inserted = `[${selected}](url)`;
        cursorPos = start + inserted.length;
      } else if (action === 'image') {
        inserted = `![${selected}](url)`;
        cursorPos = start + inserted.length;
      } else {
        const before = body.substring(0, start);
        const newLine = before.endsWith('\n') || before === '' ? '' : '\n';
        inserted = `${newLine}${snippet}${selected}`;
        cursorPos = start + inserted.length;
      }
    } else {
      inserted = snippet;
      cursorPos = start + offset;
    }

    const newBody = body.substring(0, start) + inserted + body.substring(end);
    setBody(newBody);

    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(cursorPos, cursorPos);
    });
  }, [body]);

  const estimatedTime = numValue && !isNaN(Number(numValue))
    ? buildTimeString(Number(numValue), unit)
    : '';

  const parsedFrontmatter = parseFrontmatter(body);
  const bodyMeta = parsedFrontmatter.metadata;
  const strippedBody = parsedFrontmatter.body;

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const indent = '  ';
      const newBody = body.substring(0, start) + indent + body.substring(end);
      setBody(newBody);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + indent.length;
      });
    }
  }

  async function handleSave() {
    if (!title.trim() || !trackId) return;
    setSaving(true);
    try {
      if (lessonId) {
        await lessonsControllerUpdateLesson({
          path: { id: lessonId },
          body: { title: title.trim(), description: description.trim() || null, estimatedTime: estimatedTime || '0m', body: body.trim() },
          throwOnError: true,
        });

        // Update query cache optimistically for editing lesson
        const cached = queryCache.get<CachedTrackEntry>(`track-detail-${trackId}`);
        if (cached && cached.track) {
          const updatedLessons = cached.track.lessons?.map((l) => {
            if (l.id === lessonId) {
              return {
                ...l,
                title: title.trim(),
                description: description.trim() || null,
                estimatedTime: estimatedTime || '0m',
                body: body.trim(),
              };
            }
            return l;
          }) ?? [];
          queryCache.set(`track-detail-${trackId}`, {
            ...cached,
            track: {
              ...cached.track,
              lessons: updatedLessons,
            },
          });
        }
      } else {
        await lessonsControllerCreateLesson({
          path: { id: trackId },
          body: { title: title.trim(), description: description.trim() || null, order, estimatedTime: estimatedTime || '0m', body: body.trim() },
          throwOnError: true,
        });
      }
    } catch {
      setSaving(false);
      return;
    }
    setSaving(false);
    router.back();
  }

  const toolbarButtons = useToolbarConfig();

  return (
    <main className="flex-1 flex flex-col bg-background px-0 xl:p-14 md:p-4 gap-6">
      <header className="bg-surface-container-lowest border-b border-outline-variant max-w-[1600px] w-full mx-auto px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-5">
          <div className="flex-1 min-w-0 md:max-w-[500px]">
            <label className="block label-sm text-secondary mb-1.5">
              {t('lessonTitle')}
            </label>
            <input
              className="text-xl font-bold w-full text-h1 font-h1 border-none hover:bg-surface-container-high p-2 focus:ring-0 placeholder-surface-dim bg-transparent"
              placeholder={t('untitledLesson')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-52 shrink-0">
            <label className="block label-sm text-secondary mb-1.5">
              {t('estimatedTime')}
            </label>
            <div className="flex items-center gap-2 border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-lowest focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">schedule</span>
              <input
                type="number"
                min={0}
                step="0.5"
                className="w-[60px] border-none p-0 focus:ring-0 bg-transparent text-body-base font-medium outline-none"
                placeholder="0"
                value={numValue}
                onChange={(e) => setNumValue(e.target.value)}
              />
              <select
                className="flex-1 border-none bg-transparent text-body-sm text-secondary outline-none cursor-pointer appearance-none pr-4 bg-no-repeat bg-[right_0_center]"
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
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_160px_180px] gap-3">
          <div>
            <label className="block label-sm text-secondary mb-1.5">
              {t('lessonDescription')}
            </label>
            <input
              className="w-full border border-outline-variant rounded-lg p-2 text-body-base focus:border-primary focus:ring-0 transition-colors outline-none bg-surface-container-low"
              placeholder={t('lessonDescriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block label-sm text-secondary mb-1.5">
              {t('lessonOrder')}
            </label>
            <input
              type="number"
              min={1}
              className="w-full border border-outline-variant rounded-lg p-2 text-body-base focus:border-primary focus:ring-0 transition-colors outline-none bg-surface-container-low"
              value={order}
              onChange={(e) => setOrder(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div>
            <label className="block label-sm text-secondary mb-1.5">
              {t('lessonType')}
            </label>
            <select
              className="w-full border border-outline-variant rounded-lg p-2 text-body-base focus:border-primary focus:ring-0 transition-colors outline-none bg-surface-container-low"
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value as LessonEditorType)}
              title={t('lessonTypeReadonlyHint')}
            >
              {LESSON_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="md:hidden flex border-b border-outline-variant bg-surface">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-3 text-center label-md transition-colors cursor-pointer ${
            mobileTab === 'editor'
              ? 'text-primary border-b-2 border-primary'
              : 'text-secondary'
          }`}
        >
          {t('editor')}
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-center label-md transition-colors cursor-pointer ${
            mobileTab === 'preview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-secondary'
          }`}
        >
          {t('preview')}
        </button>
      </div>

      <section className="flex-1 flex bg-surface-container-lowest w-full max-w-[1600px] mx-auto md:rounded-sm border border-outline-variant h-full min-h-[70vh] max-h-[calc(100vh-4rem)]">
        <div
          className={`flex-1 flex flex-col border-r border-outline-variant ${
            mobileTab === 'preview' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="sticky top-0 z-10 flex items-center gap-0.5 px-3 py-2 bg-surface border-b border-outline-variant flex-wrap">
            {toolbarButtons.map((btn, i) => (
              <span key={btn.action}>
                {[3, 5, 9, 11].includes(i) && (
                  <div className="w-px h-6 bg-outline-variant mx-1.5 inline-block align-middle" />
                )}
                <button
                  onClick={() => insertMarkdown(btn.action)}
                  title={t(btn.labelKey)}
                  className="p-1.5 hover:bg-surface-container-high rounded transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px] text-secondary block">
                    {btn.icon}
                  </span>
                </button>
              </span>
            ))}
          </div>

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              className="w-full min-h-full p-6 font-mono text-body-sm outline-none resize-none bg-transparent leading-relaxed"
              placeholder={t('markdownPlaceholder')}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
            />
          </div>
        </div>

        <div
          className={`flex-1 flex flex-col bg-surface-container-lowest overflow-hidden ${
            mobileTab === 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-3 bg-surface-container-low border-b border-outline-variant">
            <span className="label-sm text-secondary uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              {t('livePreview')}
            </span>
          </div>

          <div className="flex-1 overflow-y-scroll px-8 sm:px-12 py-8 sm:py-10">
            <div className="max-w-[720px] mx-auto">
              {title || body ? (
                <article>
                  <LessonMetadata
                    title={title}
                    estimatedTime={estimatedTime}
                    bodyMeta={bodyMeta}
                    tu={tu}
                  />
                  {strippedBody ? (
                    <div className="text-on-surface-variant">
                      <MarkdownRenderer content={strippedBody} />
                    </div>
                  ) : (
                    <p className="text-body-sm text-secondary italic">
                      {t('noPreviewContent')}
                    </p>
                  )}
                </article>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-secondary text-3xl">visibility</span>
                  </div>
                  <p className="text-body-sm text-secondary italic">
                    {t('noPreviewContent')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="justify-center items-center fixed bottom-0 left-0 md:left-[256px] right-0 z-40 bg-surface border-t border-outline-variant transition-all duration-200">
        <div className="flex mx-2 justify-center items-center gap-2">
          <SyntaxGuide />
          <div className="w-px h-6 bg-outline-variant mx-1" />
          <div className="flex-1" />

          <div className="flex-2 flex justify-center items-center gap-8">
            <button
              onClick={() => router.back()}
              className="px-4 py-1.5 border border-outline-variant rounded-lg label-md text-secondary hover:bg-surface-variant transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="px-5 py-1.5 bg-primary text-on-primary rounded-lg label-md hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? t('saving') : t('saveLesson')}
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
