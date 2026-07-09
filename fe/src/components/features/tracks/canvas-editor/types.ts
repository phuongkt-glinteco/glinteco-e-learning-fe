import type { DocumentResponseDto, ExerciseSummaryDto } from '@/services/client';

export type CanvasBlockType =
  | 'container'
  | 'heading'
  | 'paragraph'
  | 'callout'
  | 'code'
  | 'table'
  | 'scrollable-area'
  | 'doc-embed'
  | 'exercise-embed'
  | 'link'
  | 'truncate';

export type DisplayLayoutMode = 'block' | 'inline' | 'floating-left' | 'floating-right';
export type SpacingVariant = 'compact' | 'normal' | 'relaxed';
export type ViewportSize = 'desktop' | 'tablet' | 'mobile';
export type CanvasEditorMode = 'edit' | 'preview';

export type SemanticTag = 'section' | 'article' | 'header' | 'main' | 'aside' | 'div';
export type ContainerLayoutMode = 'flex-col' | 'flex-row' | 'grid-2' | 'grid-3';
export type ContainerGap = 'none' | 'sm' | 'md' | 'lg';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg';

export type ParagraphListType = 'bullet' | 'ordered';

export interface BlockLayoutProps {
  displayMode?: DisplayLayoutMode;
  widthPercentage?: number; // 25 to 100
  minWidth?: string;
  maxWidth?: string;
  textColor?: string;
  truncateHeight?: number; // Threshold in px or lines for show more/less
  spacing?: SpacingVariant;
  hiddenOnPreview?: boolean;
  listType?: ParagraphListType;
  listStart?: number;
  indentLevel?: number;
}

export interface ContainerBlockProps extends BlockLayoutProps {
  semanticTag?: SemanticTag;
  layoutMode?: ContainerLayoutMode;
  gap?: ContainerGap;
  padding?: ContainerPadding;
  maxHeight?: number;
  borderStyle?: 'none' | 'subtle' | 'card';
}

export interface HeadingBlockProps extends BlockLayoutProps {
  level?: 1 | 2 | 3;
}

export interface CalloutBlockProps extends BlockLayoutProps {
  variant?: 'info' | 'objective' | 'prerequisites' | 'exercise' | 'challenge' | 'summary';
}

export interface CodeBlockProps extends BlockLayoutProps {
  language?: string;
  filename?: string;
  height?: number;
}

export interface TableBlockProps extends BlockLayoutProps {
  headers?: string[];
  rows?: string[][];
  colWidths?: number[];
}

export interface ScrollableAreaBlockProps extends BlockLayoutProps {
  maxHeight?: number;
}

export interface EmbedBlockProps extends BlockLayoutProps {
  embedDisplayMode?: 'embedded' | 'link-card' | 'inline-link';
  refId?: string;
}

export interface LinkBlockProps extends BlockLayoutProps {
  altText?: string;
  url?: string;
  linkId?: string;
}

export type CanvasBlockProps =
  & BlockLayoutProps
  & ContainerBlockProps
  & HeadingBlockProps
  & CalloutBlockProps
  & CodeBlockProps
  & TableBlockProps
  & ScrollableAreaBlockProps
  & EmbedBlockProps
  & LinkBlockProps
  & Record<string, unknown>;

export interface CanvasBlock {
  id: string;
  type: CanvasBlockType;
  props: CanvasBlockProps;
  content?: string;
  children?: CanvasBlock[];
}

export interface LessonCanvasMetadata {
  title: string;
  description: string;
  estimatedTime: string;
  type: 'video' | 'reading' | 'quiz' | 'coding' | 'assignment';
  order: number;
}

export interface LessonCanvasState {
  metadata: LessonCanvasMetadata;
  blocks: CanvasBlock[];
  selectedBlockId: string | null;
  asideActiveTab: 'outline' | 'documents' | 'exercises' | 'inspector';
  mode: CanvasEditorMode;
  previewViewport: ViewportSize;
  relatedDocs: DocumentResponseDto[];
  exercises: ExerciseSummaryDto[];
}
