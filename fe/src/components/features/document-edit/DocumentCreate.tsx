'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { documentsControllerCreate, documentsControllerFindAllTags } from '@/services/api-client';
import type { TagResponseDto } from '@/services/api-client';
import { DocumentEditSidebar } from './DocumentEditSidebar';
import { DocumentReadingEditor } from './DocumentReadingEditor';
import { DocumentNavigationEditor } from './DocumentNavigationEditor';
import { DocumentProceduralEditor } from './DocumentProceduralEditor';
import { buildContentString } from './content-builder';
import { PageContainer, PageHeader } from '@/components/ui';

const KIND_OPTIONS = [
  { value: 'Guide', label: 'Guide' },
  { value: 'Tutorial', label: 'Tutorial' },
  { value: 'Runbook', label: 'Runbook' },
  { value: 'Reference', label: 'Reference' },
  { value: 'Link', label: 'Link' },
];

export default function DocumentCreate() {
  const t = useTranslations('DocumentEdit');
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [allTags, setAllTags] = useState<TagResponseDto[]>([]);

  const [kind, setKind] = useState('Guide');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Guide
  const [guideBody, setGuideBody] = useState('');

  // Tutorial
  const [tutorialExplanation, setTutorialExplanation] = useState('');
  const [tutorialSteps, setTutorialSteps] = useState<Array<{ title: string; body: string }>>([]);

  // Runbook
  const [runbookBackground, setRunbookBackground] = useState('');
  const [runbookSeverity, setRunbookSeverity] = useState('');
  const [runbookIncidentId, setRunbookIncidentId] = useState('');
  const [runbookEstimatedTime, setRunbookEstimatedTime] = useState('');
  const [runbookSymptoms, setRunbookSymptoms] = useState<string[]>([]);
  const [runbookStatus, setRunbookStatus] = useState('');
  const [runbookPhases, setRunbookPhases] = useState<Array<{ name: string; steps: Array<{ title: string; body: string }> }>>([]);

  // Reference
  const [referenceSections, setReferenceSections] = useState<Array<{ heading: string; body: string }>>([]);

  // Link
  const [linkDescription, setLinkDescription] = useState('');
  const [linkOverview, setLinkOverview] = useState('');

  useEffect(() => {
    documentsControllerFindAllTags({ throwOnError: true })
      .then((res) => setAllTags((res.data as TagResponseDto[] | undefined) ?? []))
      .catch(() => {});
  }, []);

  async function handleCreate() {
    if (saving) return;
    setSaving(true);
    try {
      const contentStr = buildContentString({
        kind,
        guideBody,
        tutorialExplanation,
        tutorialSteps,
        runbookBackground,
        runbookSeverity,
        runbookIncidentId,
        runbookEstimatedTime,
        runbookSymptoms,
        runbookStatus,
        runbookPhases,
        referenceSections,
        linkDescription,
        linkOverview,
      });

      await documentsControllerCreate({
        body: {
          title,
          kind: kind as 'Guide' | 'Reference' | 'Runbook' | 'Tutorial' | 'Link',
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
    <PageContainer>
      <PageHeader
        title={t('createTitle')}
        breadcrumbs={[
          { label: 'Documents', href: '/documents' },
          { label: 'Create' }
        ]}
        actions={
          <>
            <button
              onClick={() => router.back()}
              className="px-5 py-2 font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors border border-outline-variant"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleCreate}
              disabled={saving || !title.trim()}
              className="px-5 py-2 font-label-md bg-primary text-on-primary rounded-lg transition-all hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              {saving ? t('creating') : t('createDocument')}
            </button>
          </>
        }
      />

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
    </PageContainer>
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
            severity={runbookSeverity}
            onSeverityChange={setRunbookSeverity}
            incidentId={runbookIncidentId}
            onIncidentIdChange={setRunbookIncidentId}
            estimatedTime={runbookEstimatedTime}
            onEstimatedTimeChange={setRunbookEstimatedTime}
            symptoms={runbookSymptoms}
            onSymptomsChange={setRunbookSymptoms}
            status={runbookStatus}
            onStatusChange={setRunbookStatus}
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
                  sections[sections.length - 1].body = val.slice(lastIndex, match.index).replace(/^##\s+.*$/, '').trim();
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
