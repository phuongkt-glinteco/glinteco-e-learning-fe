import type {  TagResponseDto } from '@/services/api-client';

export type DocumentKind = 'Guide' | 'Reference' | 'Runbook' | 'Tutorial' | 'Link';

export interface DocumentListItem {
  id: string;
  title: string;
  kind: DocumentKind;
  tags: TagResponseDto[];
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