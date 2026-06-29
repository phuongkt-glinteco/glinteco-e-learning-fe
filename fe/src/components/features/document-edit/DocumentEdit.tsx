'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { DocumentResponseDto, TagResponseDto } from '@/services/api-client';
import { documentsControllerUpdate, documentsControllerFindAllTags } from '@/services/api-client';
import { DocumentEditSidebar } from './DocumentEditSidebar';
import { DocumentReadingEditor } from './DocumentReadingEditor';
import { DocumentNavigationEditor } from './DocumentNavigationEditor';
import { DocumentProceduralEditor } from './DocumentProceduralEditor';
import { buildContentString } from './content-builder';
import { getDocumentContent, getDocumentUrl } from '../document-detail/content-helper';

const KIND_OPTIONS = [
  { value: 'Guide', label: 'Guide' },
  { value: 'Tutorial', label: 'Tutorial' },
  { value: 'Runbook', label: 'Runbook' },
  { value: 'Reference', label: 'Reference' },
  { value: 'Link', label: 'Link' },
];

interface DocumentEditProps {
  document: DocumentResponseDto;
}

export default function DocumentEdit({ document }: DocumentEditProps) {
  const t = useTranslations('DocumentEdit');
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const initialContent = useMemo(() => getDocumentContent(document), [document]);
  const initialUrl = useMemo(() => getDocumentUrl(document), [document]);

  const [kind, setKind] = useState<string>(document.kind);
  const [title, setTitle] = useState(document.title);
  const [url, setUrl] = useState(initialUrl ?? '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<TagResponseDto[]>([]);

  // Guide
  const [guideBody, setGuideBody] = useState(
    document.kind === 'Guide' ? (initialContent as { body: string }).body : ''
  );

  // Tutorial
  const [tutorialExplanation, setTutorialExplanation] = useState(
    document.kind === 'Tutorial' ? (initialContent as { explanation: string }).explanation : ''
  );
  const [tutorialSteps, setTutorialSteps] = useState(
    document.kind === 'Tutorial' ? (initialContent as { steps: Array<{ title: string; body: string }> }).steps : []
  );

  // Runbook
  const [runbookBackground, setRunbookBackground] = useState(
    document.kind === 'Runbook' ? (initialContent as { background: string }).background : ''
  );
  const [runbookPhases, setRunbookPhases] = useState(
    document.kind === 'Runbook' ? (initialContent as { phases: Array<{ name: string; steps: Array<{ title: string; body: string }> }> }).phases : []
  );

  // Reference
  const [referenceSections, setReferenceSections] = useState(
    document.kind === 'Reference' ? (initialContent as { sections: Array<{ heading: string; body: string }> }).sections : []
  );

  // Link
  const [linkDescription, setLinkDescription] = useState(
    document.kind === 'Link' ? (initialContent as { description: string }).description : ''
  );
  const [linkOverview, setLinkOverview] = useState(
    document.kind === 'Link' ? (initialContent as { overview: string }).overview : ''
  );

  useEffect(() => {
    documentsControllerFindAllTags({ throwOnError: true })
      .then((res) => {
        const tags = (res.data as TagResponseDto[] | undefined) ?? [];
        setAllTags(tags);
        setSelectedTagIds(
          tags.filter((tag) => document.tags.some((dt) => dt.id === tag.id)).map((t) => t.id)
        );
      })
      .catch(() => {});
  }, [document.tags]);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const contentStr = buildContentString({
        kind,
        guideBody,
        tutorialExplanation,
        tutorialSteps,
        runbookBackground,
        runbookPhases,
        referenceSections,
        linkDescription,
        linkOverview,
      });

      await documentsControllerUpdate({
        path: { id: document.id },
        body: {
          title,
          kind: kind as DocumentResponseDto['kind'],
          content: contentStr,
          url: url || undefined,
          tagIds: selectedTagIds,
        },
        throwOnError: true,
      });

      router.push('/documents');
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex-1 flex flex-col p-gutter max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            {title || t('untitled')}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-2 font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors border border-outline-variant"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 font-label-md bg-primary text-on-primary rounded-lg transition-all hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            {saving ? t('saving') : t('saveChanges')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter flex-1">
        <DocumentEditSidebar
          kind={kind}
          kinds={KIND_OPTIONS}
          onKindChange={setKind}
          title={title}
          onTitleChange={setTitle}
          url={url}
          onUrlChange={setUrl}
          tagOptions={allTags}
          selectedTagIds={selectedTagIds}
          onTagToggle={(tagId) =>
            setSelectedTagIds((prev) =>
              prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
            )
          }
        />

        <div className="col-span-8 flex flex-col">
          {renderEditor()}
        </div>
      </div>
    </section>
  );

  function renderEditor() {
    switch (kind) {
      case 'Guide':
        return <DocumentReadingEditor body={guideBody} onChange={setGuideBody} />;
      case 'Tutorial':
        return (
          <DocumentProceduralEditor
            kind="Tutorial"
            explanationOrBackground={tutorialExplanation}
            onExplanationOrBackgroundChange={setTutorialExplanation}
            steps={tutorialSteps}
            onStepsChange={setTutorialSteps}
          />
        );
      case 'Runbook':
        return (
          <DocumentProceduralEditor
            kind="Runbook"
            explanationOrBackground={runbookBackground}
            onExplanationOrBackgroundChange={setRunbookBackground}
            phases={runbookPhases}
            onPhasesChange={setRunbookPhases}
          />
        );
      case 'Reference':
        return (
          <DocumentNavigationEditor
            description=""
            onDescriptionChange={() => {}}
            overview={referenceSections.map((s) => `## ${s.heading}\n\n${s.body}`).join('\n\n')}
            onOverviewChange={(val) => {
              const sections: Array<{ heading: string; body: string }> = [];
              const headingRegex = /^##\s+(.+)$/gm;
              let lastIndex = 0;
              let match: RegExpExecArray | null;
              while ((match = headingRegex.exec(val)) !== null) {
                if (lastIndex > 0) {
                  const body = val.slice(lastIndex, match.index).replace(/^##\s+.*$/, '').trim();
                  sections[sections.length - 1].body = body;
                }
                sections.push({ heading: match[1].trim(), body: '' });
                lastIndex = match.index + match[0].length;
              }
              if (sections.length > 0) {
                sections[sections.length - 1].body = val.slice(lastIndex).trim();
              }
              setReferenceSections(sections);
            }}
          />
        );
      case 'Link':
        return (
          <DocumentNavigationEditor
            description={linkDescription}
            onDescriptionChange={setLinkDescription}
            overview={linkOverview}
            onOverviewChange={setLinkOverview}
          />
        );
      default:
        return <DocumentReadingEditor body={guideBody} onChange={setGuideBody} />;
    }
  }
}
