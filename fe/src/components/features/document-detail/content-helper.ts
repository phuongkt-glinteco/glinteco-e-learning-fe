import type { DocumentResponseDto } from '@/services/api-client';
import type {
  GuideContent,
  TutorialContent,
  RunbookContent,
  ReferenceContent,
  LinkContent,
  ResourceRefLike,
  TutorialStep,
} from './types';

type NamedRecord = Record<string, unknown>;
type RunbookPhase = { name: string; steps: TutorialStep[] };
type ReferencePropertyRecord = {
  name?: unknown;
  type?: unknown;
  required?: unknown;
  description?: unknown;
  defaultValue?: unknown;
};
type ReferenceSectionRecord = { heading?: unknown; body?: unknown };

function parseResourceRef(item: unknown): ResourceRefLike {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const record = item as NamedRecord;
    return {
      id: String(record.id || ''),
      name: record.name ? String(record.name) : undefined,
      title: record.title ? String(record.title) : undefined,
      kind: record.kind ? String(record.kind) : undefined,
    };
  }
  return String(item || '');
}

function parseTutorialStep(item: unknown): TutorialStep {
  const record = typeof item === 'object' && item !== null ? item as NamedRecord : {};
  return {
    title: String(record.title || ''),
    body: String(record.body || ''),
  };
}

export function getDocumentContent(doc: DocumentResponseDto) {
  let raw: Record<string, unknown> = {};

  const content = doc.content as unknown;
  if (content) {
    if (typeof content === 'string') {
      try { raw = JSON.parse(content); } catch { raw = {}; }
    } else {
      raw = content as Record<string, unknown>;
    }
  }

  switch (doc.kind) {
    case 'Guide':
      return {
        objective: typeof raw.objective === 'string' ? raw.objective : undefined,
        prerequisites: Array.isArray(raw.prerequisites) ? raw.prerequisites.map(parseResourceRef) : undefined,
        steps: typeof raw.steps === 'string' ? raw.steps : (typeof raw.body === 'string' ? raw.body : ''),
        expectedResult: typeof raw.expectedResult === 'string' ? raw.expectedResult : undefined,
        relatedDocs: Array.isArray(raw.relatedDocs) ? raw.relatedDocs.map(parseResourceRef) : undefined,
        body: typeof raw.body === 'string' ? raw.body : undefined,
      } as GuideContent;

    case 'Tutorial':
      return {
        learningObjectives: Array.isArray(raw.learningObjectives) ? raw.learningObjectives.map((o) => String(o)) : undefined,
        prerequisites: Array.isArray(raw.prerequisites) ? raw.prerequisites.map(parseResourceRef) : undefined,
        duration: typeof raw.duration === 'number' ? raw.duration : (typeof raw.duration === 'string' ? Number(raw.duration) || undefined : undefined),
        difficulty: typeof raw.difficulty === 'string' ? raw.difficulty : undefined,
        steps: typeof raw.steps === 'string' ? raw.steps : undefined,
        exercises: Array.isArray(raw.exercises) ? raw.exercises.map((e) => String(e)) : undefined,
        summary: typeof raw.summary === 'string' ? raw.summary : undefined,
        explanation: typeof raw.explanation === 'string' ? raw.explanation : undefined,
        legacySteps: Array.isArray(raw.steps) && raw.steps.length > 0 && typeof raw.steps[0] === 'object'
          ? raw.steps.map(parseTutorialStep)
          : undefined,
      } as TutorialContent;

    case 'Runbook':
      return {
        trigger: typeof raw.trigger === 'string' ? raw.trigger : (typeof raw.background === 'string' ? raw.background : ''),
        impact: typeof raw.impact === 'string' ? raw.impact : undefined,
        prerequisites: Array.isArray(raw.prerequisites) ? raw.prerequisites.map(parseResourceRef) : undefined,
        procedure: typeof raw.procedure === 'string' ? raw.procedure : undefined,
        validation: typeof raw.validation === 'string' ? raw.validation : undefined,
        rollback: typeof raw.rollback === 'string' ? raw.rollback : undefined,
        escalation: typeof raw.escalation === 'string' ? raw.escalation : undefined,
        relatedDocs: Array.isArray(raw.relatedDocs) ? raw.relatedDocs.map(parseResourceRef) : undefined,
        background: typeof raw.background === 'string' ? raw.background : undefined,
        severity: typeof raw.severity === 'string' ? raw.severity : undefined,
        incidentId: typeof raw.incidentId === 'string' ? raw.incidentId : undefined,
        estimatedTime: typeof raw.estimatedTime === 'string' ? raw.estimatedTime : undefined,
        symptoms: Array.isArray(raw.symptoms) ? raw.symptoms.map((s) => String(s)) : undefined,
        status: typeof raw.status === 'string' ? raw.status : undefined,
        phases: Array.isArray(raw.phases)
          ? raw.phases.map((phase) => {
              const phaseRecord = typeof phase === 'object' && phase !== null ? phase as NamedRecord : {};
              return {
                name: String(phaseRecord.name || ''),
                steps: Array.isArray(phaseRecord.steps) ? phaseRecord.steps.map(parseTutorialStep) : [],
              } satisfies RunbookPhase;
            })
          : undefined,
      } as RunbookContent;

    case 'Reference':
      return {
        category: typeof raw.category === 'string' ? raw.category : undefined,
        version: typeof raw.version === 'string' ? raw.version : undefined,
        properties: Array.isArray(raw.properties)
          ? raw.properties.map((property) => {
              const p = typeof property === 'object' && property !== null ? property as ReferencePropertyRecord : {};
              return {
                name: String(p.name || ''),
                type: p.type ? String(p.type) : undefined,
                required: Boolean(p.required),
                description: p.description ? String(p.description) : undefined,
                defaultValue: p.defaultValue ? String(p.defaultValue) : undefined,
              };
            })
          : undefined,
        examples: typeof raw.examples === 'string' ? raw.examples : undefined,
        notes: typeof raw.notes === 'string' ? raw.notes : undefined,
        sections: Array.isArray(raw.sections)
          ? raw.sections.map((section) => {
              const s = typeof section === 'object' && section !== null ? section as ReferenceSectionRecord : {};
              return { heading: String(s.heading || ''), body: String(s.body || '') };
            })
          : undefined,
      } as ReferenceContent;

    case 'Link':
      return {
        url: typeof raw.url === 'string' ? raw.url : undefined,
        provider: typeof raw.provider === 'string' ? raw.provider : undefined,
        type: typeof raw.type === 'string' ? raw.type : undefined,
        openInNewTab: Boolean(raw.openInNewTab),
        description: typeof raw.description === 'string' ? raw.description : undefined,
        overview: typeof raw.overview === 'string' ? raw.overview : undefined,
      } as LinkContent;

    default:
      return { steps: '' } as GuideContent;
  }
}

export function getDocumentUrl(doc: DocumentResponseDto): string | null {
  const url = doc.url as unknown;
  if (!url) return null;
  if (typeof url === 'string') return url;
  return null;
}
