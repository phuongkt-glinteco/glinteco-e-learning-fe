import { parseMarkdown } from '@/lib/md-renderer';

export interface TocItem {
  id: string;
  label: string;
  level: number;
}

export function extractTocFromBlocks(markdown: string): TocItem[] {
  const blocks = parseMarkdown(markdown);
  const items: TocItem[] = [];
  for (const block of blocks) {
    if (block.type === 'heading') {
      const label = block.children.map((c) => (c.type === 'text' ? c.value : '')).join('');
      const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      items.push({ id, label, level: block.level });
    }
  }
  return items;
}
