import type { DocumentListResponseDto, DocumentResponseDto, TagResponseDto } from '@/services/api-client';

export type DocumentKind = 'Guide' | 'Reference' | 'Runbook' | 'Tutorial' | 'Link';

export interface DocumentTag {
  id: string;
  name: string;
}

export interface DocumentListItem {
  id: string;
  title: string;
  kind: DocumentKind;
  tags: DocumentTag[];
  isBookmarked: boolean;
  url?: string | null;
}

export interface DocumentContent {
  title: string;
  body?: string;
  url?: string;
}

export interface RunbookPhase {
  title: string;
  steps: { title: string; content: string }[];
}

export interface LinkContent {
  title: string;
  description: string;
  url: string;
}

const DOCUMENT_KINDS: DocumentKind[] = ['Guide', 'Reference', 'Runbook', 'Tutorial', 'Link'];

function toSafeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizeDocumentKind(value: unknown): DocumentKind {
  return DOCUMENT_KINDS.includes(value as DocumentKind) ? (value as DocumentKind) : 'Link';
}

export function normalizeDocumentTag(tag: TagResponseDto): DocumentTag | null {
  const id = toSafeString(tag.id);
  const name = toSafeString(tag.name);

  if (!id || !name) {
    return null;
  }

  return { id, name };
}

export function normalizeDocumentTags(tags: unknown): DocumentTag[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => normalizeDocumentTag(tag as TagResponseDto))
    .filter((tag): tag is DocumentTag => Boolean(tag));
}

export function normalizeDocumentListItem(document: DocumentResponseDto): DocumentListItem | null {
  const id = toSafeString(document.id);
  const title = toSafeString(document.title);

  if (!id || !title) {
    return null;
  }

  const url = toSafeString(document.url, '');

  return {
    id,
    title,
    kind: normalizeDocumentKind(document.kind),
    tags: normalizeDocumentTags(document.tags),
    isBookmarked: document.isBookmarked === true,
    url: url || null,
  };
}

export function normalizeDocumentListItems(response: DocumentListResponseDto | undefined): DocumentListItem[] {
  return (response?.data ?? [])
    .map(normalizeDocumentListItem)
    .filter((document): document is DocumentListItem => Boolean(document));
}
