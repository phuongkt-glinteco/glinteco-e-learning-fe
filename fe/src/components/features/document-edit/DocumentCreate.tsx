'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { documentsControllerCreate, documentsControllerFindAllTags } from '@/services/api-client';
import type { TagResponseDto } from '@/services/api-client';
import { DocumentEditSidebar } from './DocumentEditSidebar';
import { GuideEditor, type GuideEditorData } from './GuideEditor';
import { TutorialEditor, type TutorialEditorData } from './TutorialEditor';
import { RunbookEditor, type RunbookEditorData } from './RunbookEditor';
import { ReferenceEditor, type ReferenceEditorData } from './ReferenceEditor';
import { LinkEditor, type LinkEditorData } from './LinkEditor';
import { buildContentString } from './content-builder';
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

export default function DocumentCreate() {
  const t = useTranslations('DocumentEdit');
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [allTags, setAllTags] = useState<TagResponseDto[]>([]);
  const { pushNode, setTree, tree } = useBreadcrumbStore();

  const [kind, setKind] = useState('Guide');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Editor states
  const [guideData, setGuideData] = useState<GuideEditorData>({});
  const [tutorialData, setTutorialData] = useState<TutorialEditorData>({});
  const [runbookData, setRunbookData] = useState<RunbookEditorData>({});
  const [referenceData, setReferenceData] = useState<ReferenceEditorData>({});
  const [linkData, setLinkData] = useState<LinkEditorData>({});

  useEffect(() => {
    documentsControllerFindAllTags({ throwOnError: true })
      .then((res) => setAllTags((res.data as TagResponseDto[] | undefined) ?? []))
      .catch(() => {});
      
    if (tree.length === 0) {
      setTree([{ label: 'Documents', href: '/documents' }]);
    }
    pushNode({ label: 'Create', href: window.location.pathname });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate() {
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
        title={t('createTitle')}
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
