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
        body: typeof raw.body === 'string' ? raw.body : '',
      } as GuideContent;

    case 'Tutorial':
      return {
        explanation: typeof raw.explanation === 'string' ? raw.explanation : '',
        steps: Array.isArray(raw.steps)
          ? raw.steps.map((s: unknown) => ({
              title: typeof (s as Record<string, unknown>).title === 'string' ? (s as Record<string, unknown>).title as string : '',
              body: typeof (s as Record<string, unknown>).body === 'string' ? (s as Record<string, unknown>).body as string : '',
            }))
          : [],
      } as TutorialContent;

    case 'Runbook':
      return {
        background: typeof raw.background === 'string' ? raw.background : '',
        severity: typeof raw.severity === 'string' ? raw.severity : undefined,
        incidentId: typeof raw.incidentId === 'string' ? raw.incidentId : undefined,
        estimatedTime: typeof raw.estimatedTime === 'string' ? raw.estimatedTime : undefined,
        symptoms: Array.isArray(raw.symptoms) ? raw.symptoms.map((s) => String(s)) : undefined,
        status: typeof raw.status === 'string' ? raw.status : undefined,
        phases: Array.isArray(raw.phases)
          ? raw.phases.map((p: unknown) => ({
              name: typeof (p as Record<string, unknown>).name === 'string' ? (p as Record<string, unknown>).name as string : '',
              steps: Array.isArray((p as Record<string, unknown>).steps)
                ? ((p as Record<string, unknown>).steps as unknown[]).map((s: unknown) => ({
                    title: typeof (s as Record<string, unknown>).title === 'string' ? (s as Record<string, unknown>).title as string : '',
                    body: typeof (s as Record<string, unknown>).body === 'string' ? (s as Record<string, unknown>).body as string : '',
                  }))
                : [],
            }))
          : [],
      } as RunbookContent;

    case 'Reference':
      return {
        sections: Array.isArray(raw.sections)
          ? raw.sections.map((s: unknown) => ({
              heading: typeof (s as Record<string, unknown>).heading === 'string' ? (s as Record<string, unknown>).heading as string : '',
              body: typeof (s as Record<string, unknown>).body === 'string' ? (s as Record<string, unknown>).body as string : '',
            }))
          : [],
      } as ReferenceContent;

    case 'Link':
      return {
        description: typeof raw.description === 'string' ? raw.description : '',
        overview: typeof raw.overview === 'string' ? raw.overview : '',
      } as LinkContent;

    default:
      return { body: '' } as GuideContent;
  }
}

export function getDocumentUrl(doc: DocumentResponseDto): string | null {
  const url = doc.url as unknown;
  if (!url) return null;
  if (typeof url === 'string') return url;
  return null;
}
