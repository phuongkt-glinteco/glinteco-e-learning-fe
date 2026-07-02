import type { DocumentResponseDto } from '@/services/api-client';
import type {
  GuideContent,
  TutorialContent,
  RunbookContent,
  ReferenceContent,
  LinkContent,
} from './types';

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
        prerequisites: Array.isArray(raw.prerequisites)
          ? raw.prerequisites.map((p: any) => ({ id: String(p?.id || ''), name: p?.name ? String(p.name) : undefined, title: p?.title ? String(p.title) : undefined }))
          : undefined,
        steps: typeof raw.steps === 'string' ? raw.steps : (typeof raw.body === 'string' ? raw.body : ''),
        expectedResult: typeof raw.expectedResult === 'string' ? raw.expectedResult : undefined,
        relatedDocs: Array.isArray(raw.relatedDocs)
          ? raw.relatedDocs.map((r: any) => ({ id: String(r?.id || ''), title: r?.title ? String(r.title) : (r?.name ? String(r.name) : undefined), kind: r?.kind ? String(r.kind) : undefined }))
          : undefined,
        body: typeof raw.body === 'string' ? raw.body : undefined,
      } as GuideContent;

    case 'Tutorial':
      return {
        learningObjectives: Array.isArray(raw.learningObjectives) ? raw.learningObjectives.map((o) => String(o)) : undefined,
        prerequisites: Array.isArray(raw.prerequisites)
          ? raw.prerequisites.map((p: any) => ({ id: String(p?.id || ''), name: p?.name ? String(p.name) : undefined, title: p?.title ? String(p.title) : undefined }))
          : undefined,
        duration: typeof raw.duration === 'number' ? raw.duration : (typeof raw.duration === 'string' ? Number(raw.duration) || undefined : undefined),
        difficulty: typeof raw.difficulty === 'string' ? raw.difficulty : undefined,
        steps: typeof raw.steps === 'string' ? raw.steps : undefined,
        exercises: Array.isArray(raw.exercises) ? raw.exercises.map((e) => String(e)) : undefined,
        summary: typeof raw.summary === 'string' ? raw.summary : undefined,
        explanation: typeof raw.explanation === 'string' ? raw.explanation : undefined,
        legacySteps: Array.isArray(raw.steps) && raw.steps.length > 0 && typeof raw.steps[0] === 'object'
          ? raw.steps.map((s: any) => ({ title: String(s?.title || ''), body: String(s?.body || '') }))
          : undefined,
      } as TutorialContent;

    case 'Runbook':
      return {
        trigger: typeof raw.trigger === 'string' ? raw.trigger : (typeof raw.background === 'string' ? raw.background : ''),
        impact: typeof raw.impact === 'string' ? raw.impact : undefined,
        prerequisites: Array.isArray(raw.prerequisites)
          ? raw.prerequisites.map((p: any) => ({ id: String(p?.id || ''), name: p?.name ? String(p.name) : undefined, title: p?.title ? String(p.title) : undefined }))
          : undefined,
        procedure: typeof raw.procedure === 'string' ? raw.procedure : undefined,
        validation: typeof raw.validation === 'string' ? raw.validation : undefined,
        rollback: typeof raw.rollback === 'string' ? raw.rollback : undefined,
        escalation: typeof raw.escalation === 'string' ? raw.escalation : undefined,
        relatedDocs: Array.isArray(raw.relatedDocs)
          ? raw.relatedDocs.map((r: any) => ({ id: String(r?.id || ''), title: r?.title ? String(r.title) : (r?.name ? String(r.name) : undefined), kind: r?.kind ? String(r.kind) : undefined }))
          : undefined,
        background: typeof raw.background === 'string' ? raw.background : undefined,
        severity: typeof raw.severity === 'string' ? raw.severity : undefined,
        incidentId: typeof raw.incidentId === 'string' ? raw.incidentId : undefined,
        estimatedTime: typeof raw.estimatedTime === 'string' ? raw.estimatedTime : undefined,
        symptoms: Array.isArray(raw.symptoms) ? raw.symptoms.map((s) => String(s)) : undefined,
        status: typeof raw.status === 'string' ? raw.status : undefined,
        phases: Array.isArray(raw.phases)
          ? raw.phases.map((p: any) => ({
              name: String(p?.name || ''),
              steps: Array.isArray(p?.steps) ? p.steps.map((s: any) => ({ title: String(s?.title || ''), body: String(s?.body || '') })) : [],
            }))
          : undefined,
      } as RunbookContent;

    case 'Reference':
      return {
        category: typeof raw.category === 'string' ? raw.category : undefined,
        version: typeof raw.version === 'string' ? raw.version : undefined,
        properties: Array.isArray(raw.properties)
          ? raw.properties.map((p: any) => ({
              name: String(p?.name || ''),
              type: p?.type ? String(p.type) : undefined,
              required: Boolean(p?.required),
              description: p?.description ? String(p.description) : undefined,
              defaultValue: p?.defaultValue ? String(p.defaultValue) : undefined,
            }))
          : undefined,
        examples: typeof raw.examples === 'string' ? raw.examples : undefined,
        notes: typeof raw.notes === 'string' ? raw.notes : undefined,
        sections: Array.isArray(raw.sections)
          ? raw.sections.map((s: any) => ({ heading: String(s?.heading || ''), body: String(s?.body || '') }))
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
