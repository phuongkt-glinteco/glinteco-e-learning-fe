import type {
  GuideContent,
  TutorialContent,
  RunbookContent,
  ReferenceContent,
  LinkContent,
} from '../document-detail/types';

export function buildContentString(data: {
  kind: string;
  // Guide
  guideObjective?: string;
  guidePrerequisites?: Array<{ id: string; name?: string; title?: string }>;
  guideSteps?: string;
  guideExpectedResult?: string;
  guideRelatedDocs?: Array<{ id: string; title?: string; name?: string; kind?: string }>;
  guideBody?: string; // legacy fallback

  // Tutorial
  tutorialLearningObjectives?: string[];
  tutorialPrerequisites?: Array<{ id: string; name?: string; title?: string }>;
  tutorialDuration?: number;
  tutorialDifficulty?: string;
  tutorialStepsStr?: string;
  tutorialExercises?: string[];
  tutorialSummary?: string;
  tutorialExplanation?: string; // legacy fallback
  tutorialSteps?: Array<{ title: string; body: string }>; // legacy fallback

  // Runbook
  runbookTrigger?: string;
  runbookImpact?: string;
  runbookPrerequisites?: Array<{ id: string; name?: string; title?: string }>;
  runbookProcedure?: string;
  runbookValidation?: string;
  runbookRollback?: string;
  runbookEscalation?: string;
  runbookRelatedDocs?: Array<{ id: string; title?: string; name?: string; kind?: string }>;
  runbookBackground?: string; // legacy fallback
  runbookSeverity?: string;
  runbookIncidentId?: string;
  runbookEstimatedTime?: string;
  runbookSymptoms?: string[];
  runbookStatus?: string;
  runbookPhases?: Array<{ name: string; steps: Array<{ title: string; body: string }> }>;

  // Reference
  referenceCategory?: string;
  referenceVersion?: string;
  referenceProperties?: Array<{ name: string; type?: string; required?: boolean; description?: string; defaultValue?: string }>;
  referenceExamples?: string;
  referenceNotes?: string;
  referenceSections?: Array<{ heading: string; body: string }>; // legacy fallback

  // Link
  linkUrl?: string;
  linkProvider?: string;
  linkType?: string;
  linkOpenInNewTab?: boolean;
  linkDescription?: string;
  linkOverview?: string; // legacy fallback
}): string {
  switch (data.kind) {
    case 'Guide':
      return JSON.stringify({
        objective: data.guideObjective || undefined,
        prerequisites: data.guidePrerequisites?.length ? data.guidePrerequisites : undefined,
        steps: data.guideSteps ?? data.guideBody ?? '',
        expectedResult: data.guideExpectedResult || undefined,
        relatedDocs: data.guideRelatedDocs?.length ? data.guideRelatedDocs : undefined,
        body: data.guideBody || undefined,
      } satisfies GuideContent);

    case 'Tutorial':
      return JSON.stringify({
        learningObjectives: data.tutorialLearningObjectives?.length ? data.tutorialLearningObjectives : undefined,
        prerequisites: data.tutorialPrerequisites?.length ? data.tutorialPrerequisites : undefined,
        duration: data.tutorialDuration || undefined,
        difficulty: data.tutorialDifficulty || undefined,
        steps: data.tutorialStepsStr ?? data.tutorialExplanation ?? '',
        exercises: data.tutorialExercises?.length ? data.tutorialExercises : undefined,
        summary: data.tutorialSummary || undefined,
        explanation: data.tutorialExplanation || undefined,
        legacySteps: data.tutorialSteps?.length ? data.tutorialSteps : undefined,
      } satisfies TutorialContent);

    case 'Runbook':
      return JSON.stringify({
        trigger: data.runbookTrigger ?? data.runbookBackground ?? '',
        impact: data.runbookImpact || undefined,
        prerequisites: data.runbookPrerequisites?.length ? data.runbookPrerequisites : undefined,
        procedure: data.runbookProcedure ?? '',
        validation: data.runbookValidation || undefined,
        rollback: data.runbookRollback || undefined,
        escalation: data.runbookEscalation || undefined,
        relatedDocs: data.runbookRelatedDocs?.length ? data.runbookRelatedDocs : undefined,
        background: data.runbookBackground || undefined,
        severity: data.runbookSeverity || undefined,
        incidentId: data.runbookIncidentId || undefined,
        estimatedTime: data.runbookEstimatedTime || undefined,
        symptoms: data.runbookSymptoms?.length ? data.runbookSymptoms : undefined,
        status: data.runbookStatus || undefined,
        phases: data.runbookPhases?.length ? data.runbookPhases : undefined,
      } satisfies RunbookContent);

    case 'Reference':
      return JSON.stringify({
        category: data.referenceCategory || undefined,
        version: data.referenceVersion || undefined,
        properties: data.referenceProperties?.length ? data.referenceProperties : undefined,
        examples: data.referenceExamples || undefined,
        notes: data.referenceNotes || undefined,
        sections: data.referenceSections?.length ? data.referenceSections : undefined,
      } satisfies ReferenceContent);

    case 'Link':
      return JSON.stringify({
        url: data.linkUrl || undefined,
        provider: data.linkProvider || undefined,
        type: data.linkType || undefined,
        openInNewTab: data.linkOpenInNewTab ?? false,
        description: data.linkDescription ?? '',
        overview: data.linkOverview || undefined,
      } satisfies LinkContent);

    default:
      return JSON.stringify({ steps: '' });
  }
}
