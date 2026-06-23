export type Inline =
  | { type: 'text'; value: string }
  | { type: 'bold'; children: Inline[] }
  | { type: 'italic'; children: Inline[] }
  | { type: 'underline'; children: Inline[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; external: boolean; children: Inline[] }
  | { type: 'image'; alt: string; src: string };

export interface ListItem {
  checked: boolean | null;
  children: Inline[];
}

export interface NestedListItem {
  checked: boolean | null;
  children: Inline[];
  sublist?: { ordered: boolean; items: NestedListItem[] };
}

export type CalloutVariant =
  | 'info'
  | 'objective'
  | 'prerequisites'
  | 'exercise'
  | 'challenge'
  | 'summary';

export interface TabBlock {
  label: string;
  content: string;
}

export interface Metadata {
  difficulty?: string;
  duration?: string;
  xp?: string;
  subtitle?: string;
}

export type Block =
  | { type: 'heading'; level: 1 | 2 | 3; children: Inline[] }
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'list'; ordered: boolean; items: NestedListItem[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'blockquote'; children: Inline[] }
  | { type: 'code'; language: string; code: string; filename?: string }
  | { type: 'terminal'; code: string }
  | { type: 'folderTree'; content: string }
  | { type: 'image'; alt: string; src: string }
  | { type: 'hr' }
  | { type: 'callout'; variant: CalloutVariant; children: Inline[]; listItems?: ListItem[] }
  | { type: 'tabs'; tabs: TabBlock[] }
  | { type: 'details'; summary: string; children: Inline[] };
