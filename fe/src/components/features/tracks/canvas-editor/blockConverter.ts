import type { CanvasBlock, CanvasBlockType, CalloutBlockProps } from './types';

function generateId(): string {
  return 'block_' + Math.random().toString(36).substring(2, 11);
}

/**
 * Parses lesson `body` string into structured `CanvasBlock[]`.
 * Supports both modern JSON serialized blocks and legacy Markdown string conversion.
 */
export function parseBodyToBlocks(body?: string | null): CanvasBlock[] {
  if (!body || !body.trim()) {
    return [
      {
        id: generateId(),
        type: 'paragraph',
        content: '',
        props: { spacing: 'normal', displayMode: 'block' },
      },
    ];
  }

  // 1. Try JSON parsing first (if stored as structured JSON blocks)
  try {
    const parsed = JSON.parse(body);
    if (Array.isArray(parsed)) {
      // Ensure each block has required properties
      return parsed.map((item: Partial<CanvasBlock>) => ({
        id: item.id || generateId(),
        type: (item.type || 'paragraph') as CanvasBlockType,
        content: item.content || '',
        props: item.props || { spacing: 'normal', displayMode: 'block' },
        children: item.children || undefined,
      }));
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed.blocks.map((item: Partial<CanvasBlock>) => ({
        id: item.id || generateId(),
        type: (item.type || 'paragraph') as CanvasBlockType,
        content: item.content || '',
        props: item.props || { spacing: 'normal', displayMode: 'block' },
        children: item.children || undefined,
      }));
    }
  } catch {
    // Not valid JSON, fall through to Markdown conversion
  }

  // 2. Fallback: Convert Markdown string to CanvasBlock[]
  const lines = body.split('\n');
  const blocks: CanvasBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    if (line.startsWith('# ')) {
      blocks.push({
        id: generateId(),
        type: 'heading',
        content: line.replace(/^#\s+/, ''),
        props: { level: 1, spacing: 'normal', displayMode: 'block' },
      });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({
        id: generateId(),
        type: 'heading',
        content: line.replace(/^##\s+/, ''),
        props: { level: 2, spacing: 'normal', displayMode: 'block' },
      });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({
        id: generateId(),
        type: 'heading',
        content: line.replace(/^###\s+/, ''),
        props: { level: 3, spacing: 'normal', displayMode: 'block' },
      });
      i++;
      continue;
    }

    // Fenced Code Block
    if (line.trim().startsWith('```')) {
      const firstLineTrimmed = line.trim();
      const language = firstLineTrimmed.slice(3).trim() || 'typescript';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push({
        id: generateId(),
        type: 'code',
        content: codeLines.join('\n'),
        props: { language, filename: '', spacing: 'normal', displayMode: 'block' },
      });
      continue;
    }

    // Callout (> [!variant])
    if (line.trim().startsWith('> [!')) {
      const match = line.trim().match(/^>\s*\[!([a-zA-Z0-9_-]+)\]\s*(.*)$/);
      const variant = (match?.[1]?.toLowerCase() || 'info') as CalloutBlockProps['variant'];
      const firstText = match?.[2] || '';
      const calloutLines: string[] = [firstText];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        calloutLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        id: generateId(),
        type: 'callout',
        content: calloutLines.filter(Boolean).join('\n'),
        props: { variant, spacing: 'normal', displayMode: 'block' },
      });
      continue;
    }

    // Simple Table (| col | col |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      // Parse markdown table into headers & rows
      const rows = tableLines
        .filter((l) => !/^[|\s:-]+$/.test(l))
        .map((l) =>
          l
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim())
        );

      const headers = rows[0] || ['Header 1', 'Header 2'];
      const dataRows = rows.slice(1);
      blocks.push({
        id: generateId(),
        type: 'table',
        content: '',
        props: {
          headers,
          rows: dataRows.length > 0 ? dataRows : [['Cell 1', 'Cell 2']],
          spacing: 'normal',
          displayMode: 'block',
        },
      });
      continue;
    }

    // Default: Paragraph block
    const paragraphLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      !lines[i].startsWith('# ') &&
      !lines[i].startsWith('## ') &&
      !lines[i].startsWith('### ') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('> [!') &&
      !lines[i].trim().startsWith('|')
    ) {
      if (!lines[i].trim() && paragraphLines[paragraphLines.length - 1]?.trim() === '') {
        i++;
        break;
      }
      paragraphLines.push(lines[i]);
      i++;
    }

    const textContent = paragraphLines.join('\n').trim();
    if (textContent) {
      blocks.push({
        id: generateId(),
        type: 'paragraph',
        content: textContent,
        props: { spacing: 'normal', displayMode: 'block' },
      });
    }
  }

  return blocks.length > 0
    ? blocks
    : [
        {
          id: generateId(),
          type: 'paragraph',
          content: '',
          props: { spacing: 'normal', displayMode: 'block' },
        },
      ];
}

/**
 * Serializes `CanvasBlock[]` array into string representation to store in lesson `body`.
 */
export function serializeBlocksToBody(blocks: CanvasBlock[]): string {
  return JSON.stringify(blocks, null, 2);
}

/**
 * Exports blocks to standard clean Markdown syntax.
 */
export function convertBlocksToMarkdown(blocks: CanvasBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading': {
          const level = block.props.level || 1;
          const prefix = '#'.repeat(level);
          return `${prefix} ${block.content || ''}`;
        }
        case 'code': {
          const lang = block.props.language || '';
          return `\`\`\`${lang}\n${block.content || ''}\n\`\`\``;
        }
        case 'callout': {
          const variant = block.props.variant || 'info';
          const lines = (block.content || '').split('\n');
          return `> [!${variant}]\n` + lines.map((l) => `> ${l}`).join('\n');
        }
        case 'table': {
          const headers: string[] = block.props.headers || ['Col 1', 'Col 2'];
          const rows: string[][] = block.props.rows || [];
          const headRow = `| ${headers.join(' | ')} |`;
          const sepRow = `| ${headers.map(() => '---').join(' | ')} |`;
          const dataRows = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
          return `${headRow}\n${sepRow}\n${dataRows}`;
        }
        case 'link': {
          const altText = block.props.altText || block.content || 'link';
          const url = block.props.url || '#';
          return `[${altText}](${url})`;
        }
        case 'list': {
          const items = block.props.items || [];
          const ordered = block.props.ordered;
          return items
            .map((item, idx) => {
              const indent = '  '.repeat(item.level || 0);
              const prefix = ordered ? `${idx + 1}. ` : '- ';
              return `${indent}${prefix}${item.content || ''}`;
            })
            .join('\n');
        }
        case 'container': {
          if (block.children && block.children.length > 0) {
            return convertBlocksToMarkdown(block.children);
          }
          return block.content || '';
        }
        default:
          return block.content || '';
      }
    })
    .join('\n\n');
}
