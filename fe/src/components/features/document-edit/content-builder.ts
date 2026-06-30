import type {
  GuideContent,
  TutorialContent,
  RunbookContent,
  ReferenceContent,
  LinkContent,
} from '../document-detail/types';

export function buildContentString(data: {
  kind: string;
  guideBody?: string;
  tutorialExplanation?: string;
  tutorialSteps?: Array<{ title: string; body: string }>;
  runbookBackground?: string;
  runbookSeverity?: string;
  runbookIncidentId?: string;
  runbookEstimatedTime?: string;
  runbookSymptoms?: string[];
  runbookStatus?: string;
  runbookPhases?: Array<{ name: string; steps: Array<{ title: string; body: string }> }>;
  referenceSections?: Array<{ heading: string; body: string }>;
  linkDescription?: string;
  linkOverview?: string;
}): string {
  switch (data.kind) {
    case 'Guide':
      return JSON.stringify({ body: data.guideBody ?? '' } satisfies GuideContent);

    case 'Tutorial':
      return JSON.stringify({
        explanation: data.tutorialExplanation ?? '',
        steps: data.tutorialSteps ?? [],
      } satisfies TutorialContent);

    case 'Runbook':
      return JSON.stringify({
        background: data.runbookBackground ?? '',
        severity: data.runbookSeverity || undefined,
        incidentId: data.runbookIncidentId || undefined,
        estimatedTime: data.runbookEstimatedTime || undefined,
        symptoms: data.runbookSymptoms && data.runbookSymptoms.length > 0 ? data.runbookSymptoms : undefined,
        status: data.runbookStatus || undefined,
        phases: data.runbookPhases ?? [],
      } satisfies RunbookContent);

    case 'Reference':
      return JSON.stringify({
        sections: data.referenceSections ?? [],
      } satisfies ReferenceContent);

    case 'Link':
      return JSON.stringify({
        description: data.linkDescription ?? '',
        overview: data.linkOverview ?? '',
      } satisfies LinkContent);

    default:
      return JSON.stringify({ body: '' });
  }
}
