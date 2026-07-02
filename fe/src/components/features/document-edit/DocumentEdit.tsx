'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { DocumentResponseDto, TagResponseDto } from '@/services/api-client';
import { documentsControllerUpdate, documentsControllerFindAllTags } from '@/services/api-client';
import { DocumentEditSidebar } from './DocumentEditSidebar';
import { GuideEditor, type GuideEditorData } from './GuideEditor';
import { TutorialEditor, type TutorialEditorData } from './TutorialEditor';
import { RunbookEditor, type RunbookEditorData } from './RunbookEditor';
import { ReferenceEditor, type ReferenceEditorData } from './ReferenceEditor';
import { LinkEditor, type LinkEditorData } from './LinkEditor';
import { buildContentString } from './content-builder';
import { getDocumentContent, getDocumentUrl } from '../document-detail/content-helper';
import { PageContainer, PageHeader } from '@/components/ui';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import { DynamicBreadcrumbs } from '@/components/ui/containers/DynamicBreadcrumbs';
import { isUiShowError } from '@/services/errors';
import { toast } from 'sonner';

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
  const { pushNode, setTree, tree } = useBreadcrumbStore();

  const initialContent = useMemo(() => getDocumentContent(document), [document]);
  const initialUrl = useMemo(() => getDocumentUrl(document), [document]);

  const [kind, setKind] = useState<string>(document.kind);
  const [title, setTitle] = useState(document.title);
  const [url, setUrl] = useState(initialUrl ?? '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<TagResponseDto[]>([]);

  // Editor states
  const [guideData, setGuideData] = useState<GuideEditorData>(() => {
    if (document.kind !== 'Guide') return {};
    const gc = initialContent as any;
    return {
      objective: gc.objective,
      prerequisites: gc.prerequisites,
      steps: gc.steps || gc.body,
      expectedResult: gc.expectedResult,
      relatedDocs: gc.relatedDocs,
    };
  });

  const [tutorialData, setTutorialData] = useState<TutorialEditorData>(() => {
    if (document.kind !== 'Tutorial') return {};
    const tc = initialContent as any;
    return {
      learningObjectives: tc.learningObjectives,
      prerequisites: tc.prerequisites,
      duration: tc.duration,
      difficulty: tc.difficulty,
      explanation: tc.explanation,
      stepsStr: tc.steps,
      exercises: tc.exercises,
      summary: tc.summary,
      legacySteps: tc.legacySteps,
    };
  });

  const [runbookData, setRunbookData] = useState<RunbookEditorData>(() => {
    if (document.kind !== 'Runbook') return {};
    const rc = initialContent as any;
    return {
      trigger: rc.trigger || rc.background,
      impact: rc.impact,
      prerequisites: rc.prerequisites,
      procedure: rc.procedure,
      validation: rc.validation,
      rollback: rc.rollback,
      escalation: rc.escalation,
      relatedDocs: rc.relatedDocs,
      background: rc.background,
      severity: rc.severity,
      incidentId: rc.incidentId,
      estimatedTime: rc.estimatedTime,
      symptoms: rc.symptoms,
      status: rc.status,
      phases: rc.phases,
    };
  });

  const [referenceData, setReferenceData] = useState<ReferenceEditorData>(() => {
    if (document.kind !== 'Reference') return {};
    const refc = initialContent as any;
    return {
      category: refc.category,
      version: refc.version,
      properties: refc.properties,
      examples: refc.examples,
      notes: refc.notes,
      sections: refc.sections,
    };
  });

  const [linkData, setLinkData] = useState<LinkEditorData>(() => {
    if (document.kind !== 'Link') return {};
    const lc = initialContent as any;
    return {
      provider: lc.provider,
      type: lc.type,
      openInNewTab: lc.openInNewTab,
      description: lc.description,
      overview: lc.overview,
    };
  });

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
      
    if (tree.length === 0) {
      setTree([
        { label: 'Documents', href: '/documents' },
        { label: document.title, href: `/documents/${document.id}` }
      ]);
    }
    pushNode({ label: 'Edit', href: window.location.pathname });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.tags, document.title, document.id]);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const contentStr = buildContentString({
        kind,
        // Guide
        guideObjective: guideData.objective,
        guidePrerequisites: guideData.prerequisites,
        guideSteps: guideData.steps,
        guideExpectedResult: guideData.expectedResult,
        guideRelatedDocs: guideData.relatedDocs,
        guideBody: guideData.steps,
        // Tutorial
        tutorialLearningObjectives: tutorialData.learningObjectives,
        tutorialPrerequisites: tutorialData.prerequisites,
        tutorialDuration: typeof tutorialData.duration === 'number' ? tutorialData.duration : Number(tutorialData.duration) || undefined,
        tutorialDifficulty: tutorialData.difficulty,
        tutorialStepsStr: tutorialData.stepsStr,
        tutorialExercises: tutorialData.exercises,
        tutorialSummary: tutorialData.summary,
        tutorialExplanation: tutorialData.explanation,
        tutorialSteps: tutorialData.legacySteps,
        // Runbook
        runbookTrigger: runbookData.trigger,
        runbookImpact: runbookData.impact,
        runbookPrerequisites: runbookData.prerequisites,
        runbookProcedure: runbookData.procedure,
        runbookValidation: runbookData.validation,
        runbookRollback: runbookData.rollback,
        runbookEscalation: runbookData.escalation,
        runbookRelatedDocs: runbookData.relatedDocs,
        runbookBackground: runbookData.background || runbookData.trigger,
        runbookSeverity: runbookData.severity,
        runbookIncidentId: runbookData.incidentId,
        runbookEstimatedTime: runbookData.estimatedTime,
        runbookSymptoms: runbookData.symptoms,
        runbookStatus: runbookData.status,
        runbookPhases: runbookData.phases,
        // Reference
        referenceCategory: referenceData.category,
        referenceVersion: referenceData.version,
        referenceProperties: referenceData.properties,
        referenceExamples: referenceData.examples,
        referenceNotes: referenceData.notes,
        referenceSections: referenceData.sections,
        // Link
        linkUrl: url,
        linkProvider: linkData.provider,
        linkType: linkData.type,
        linkOpenInNewTab: linkData.openInNewTab,
        linkDescription: linkData.description,
        linkOverview: linkData.overview,
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
    } catch (err: any) {
      if (isUiShowError(err)) {
        toast.error(t(`errors.${err.errorCode}`) || err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-2">
        <DynamicBreadcrumbs />
      </div>
      <PageHeader
        title={title || t('untitled')}
        actions={
          <>
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
        return <GuideEditor data={guideData} onChange={setGuideData} />;
      case 'Tutorial':
        return <TutorialEditor data={tutorialData} onChange={setTutorialData} />;
      case 'Runbook':
        return <RunbookEditor data={runbookData} onChange={setRunbookData} />;
      case 'Reference':
        return <ReferenceEditor data={referenceData} onChange={setReferenceData} />;
      case 'Link':
        return <LinkEditor data={linkData} onChange={setLinkData} />;
      default:
        return <GuideEditor data={guideData} onChange={setGuideData} />;
    }
  }
}
