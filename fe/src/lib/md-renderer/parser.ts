import type { Block, Inline, ListItem, NestedListItem, CalloutVariant, TabBlock, Metadata } from './types';

export function parseFrontmatter(md: string): { metadata: Metadata | null; body: string } {
  const lines = md.split('\n');
  if (lines.length < 2 || lines[0].trim() !== '---') {
    return { metadata: null, body: md };
  }

  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIdx = i;
      break;
    }
  }

  if (endIdx === -1) {
    return { metadata: null, body: md };
  }

  const meta: Metadata = {};
  for (let i = 1; i < endIdx; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key === 'difficulty') meta.difficulty = value;
    else if (key === 'duration') meta.duration = value;
    else if (key === 'xp') meta.xp = value;
    else if (key === 'subtitle') meta.subtitle = value;
  }

  const body = lines.slice(endIdx + 1).join('\n');
  return { metadata: Object.keys(meta).length > 0 ? meta : null, body };
}

export function parseInline(text: string): Inline[] {
  const nodes: Inline[] = [];
  let i = 0;

  while (i < text.length) {
    // Image ![alt](src)
    if (text.startsWith('![', i)) {
      const closeBracket = text.indexOf(']', i + 2);
      if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
        const closeParen = text.indexOf(')', closeBracket + 2);
        if (closeParen !== -1) {
          const alt = text.slice(i + 2, closeBracket);
          const src = text.slice(closeBracket + 2, closeParen);
          nodes.push({ type: 'image', alt, src });
          i = closeParen + 1;
          continue;
        }
      }
    }

    // Link [text](url)
    if (text.startsWith('[', i)) {
      const closeBracket = text.indexOf(']', i + 1);
      if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
        const closeParen = text.indexOf(')', closeBracket + 2);
        if (closeParen !== -1) {
          const linkText = text.slice(i + 1, closeBracket);
          const href = text.slice(closeBracket + 2, closeParen);
          const external = href.startsWith('http://') || href.startsWith('https://');
          nodes.push({
            type: 'link',
            href,
            external,
            children: parseInline(linkText),
          });
          i = closeParen + 1;
          continue;
        }
      }
    }

    // Bold **text**
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        nodes.push({ type: 'bold', children: parseInline(text.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    // Underline <u>text</u>
    if (text.startsWith('<u>', i)) {
      const end = text.indexOf('</u>', i + 3);
      if (end !== -1) {
        nodes.push({ type: 'underline', children: parseInline(text.slice(i + 3, end)) });
        i = end + 4;
        continue;
      }
    }

    // Italic *text* (single asterisk, not double)
    if (text[i] === '*' && text[i + 1] !== '*') {
      const end = text.indexOf('*', i + 1);
      if (end !== -1) {
        nodes.push({ type: 'italic', children: parseInline(text.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    // Inline code `text`
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        nodes.push({ type: 'code', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Plain text
    let end = i + 1;
    while (end < text.length) {
      if (text[end] === '*' || text[end] === '`' || text[end] === '[' || text[end] === '<' || (text[end] === '!' && text[end + 1] === '[')) {
        break;
      }
      end++;
    }
    nodes.push({ type: 'text', value: text.slice(i, end) });
    i = end;
  }

  return nodes;
}

function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());
}

function parseContent(content: string): Inline[] {
  return parseInline(content.trim());
}

function isListItem(text: string): { ordered: boolean; content: string } | null {
  const ulMatch = text.match(/^[-*+]\s+(.+)$/);
  if (ulMatch) return { ordered: false, content: ulMatch[1] };
  const olMatch = text.match(/^(\d+)\.\s+(.+)$/);
  if (olMatch) return { ordered: true, content: olMatch[2] };
  return null;
}

export function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = [];
  const { body } = parseFrontmatter(md); // metadata is handled externally via export
  const lines = body.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (trimmed === '') {
      i++;
      continue;
    }

    // Custom callout blocks :::type ... :::
    if (trimmed.startsWith(':::')) {
      const rest = trimmed.slice(3).trim();
      const spaceIdx = rest.indexOf(' ');
      const blockType = spaceIdx === -1 ? rest : rest.slice(0, spaceIdx);
      const inlineTitle = spaceIdx === -1 ? '' : rest.slice(spaceIdx + 1).trim();
      const calloutLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        calloutLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing :::

      const validVariants: CalloutVariant[] = ['info', 'objective', 'prerequisites', 'exercise', 'challenge', 'summary'];

      if (blockType === 'tabs') {
        const tabs: TabBlock[] = [];
        let currentLabel = '';
        let currentContent: string[] = [];

        for (const cl of calloutLines) {
          const tabMatch = cl.trim().match(/^@tab\s+(.+)$/);
          if (tabMatch) {
            if (currentLabel) {
              tabs.push({ label: currentLabel, content: currentContent.join('\n').trim() });
            }
            currentLabel = tabMatch[1].trim();
            currentContent = [];
          } else {
            currentContent.push(cl);
          }
        }
        if (currentLabel) {
          tabs.push({ label: currentLabel, content: currentContent.join('\n').trim() });
        }

        if (tabs.length > 0) {
          blocks.push({ type: 'tabs', tabs });
        }
      } else if (blockType === 'details') {
        const innerContent = calloutLines.join('\n').trim();
        blocks.push({ type: 'details', summary: inlineTitle, children: parseInline(innerContent) });
      } else if (validVariants.includes(blockType as CalloutVariant)) {
        const content = calloutLines.join('\n').trim();
        const rawLines = content.split('\n');
        const listItems: ListItem[] = [];
        const inlineChildren: Inline[] = [];

        for (const rl of rawLines) {
          const trimmed = rl.trim();
          if (!trimmed) continue;
          const m = trimmed.match(/^[-*+]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/);
          if (m) {
            listItems.push({ checked: null, children: parseInline(m[1]) });
          } else {
            inlineChildren.push(...parseInline(trimmed));
          }
        }

        if (listItems.length > 0) {
          blocks.push({ type: 'callout', variant: blockType as CalloutVariant, children: inlineChildren, listItems });
        } else {
          blocks.push({ type: 'callout', variant: blockType as CalloutVariant, children: inlineChildren });
        }
      } else {
        // Unknown block type — render content as raw paragraphs
        const fallbackLines = [trimmed, ...calloutLines];
        for (const fl of fallbackLines) {
          blocks.push({ type: 'paragraph', children: parseContent(fl) });
        }
      }
      continue;
    }

    // Code block ```language
    if (trimmed.startsWith('```')) {
      const rest = trimmed.slice(3).trim();
      const langMatch = rest.match(/^(\S+?)(?:\s+title="([^"]*)")?$/);
      const language = langMatch?.[1] || '';
      const filename = langMatch?.[2] || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```

      const code = codeLines.join('\n');

      // Route to terminal, folderTree, or generic code
      if (language === 'bash' || language === 'shell') {
        blocks.push({ type: 'terminal', code });
      } else if (language === 'tree') {
        blocks.push({ type: 'folderTree', content: code });
      } else {
        blocks.push({ type: 'code', language, code, filename });
      }
      continue;
    }

    // Heading
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      blocks.push({ type: 'heading', level, children: parseContent(headingMatch[2]) });
      i++;
      continue;
    }

    // Horizontal rule (--- but not frontmatter)
    if (/^---\s*$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: 'blockquote', children: parseContent(quoteLines.join('\n')) });
      continue;
    }

    // Table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const headerRow = parseTableRow(trimmed);
      i++;
      // Skip separator row
      if (i < lines.length && /^[\s|:-]+$/.test(lines[i])) {
        i++;
      }
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        rows.push(parseTableRow(lines[i].trim()));
        i++;
      }
      blocks.push({ type: 'table', headers: headerRow, rows });
      continue;
    }

    // Nested list (stack-based, indent-sensitive)
    const listInfo = isListItem(trimmed);
    if (listInfo) {
      const baseIndent = lines[i].search(/\S/);
      const stack: { ordered: boolean; items: NestedListItem[]; indent: number }[] = [];

      while (i < lines.length) {
        const rawLine = lines[i];
        const trimmedLine = rawLine.trim();
        if (trimmedLine === '') break;

        const info = isListItem(trimmedLine);
        if (!info) {
          // Continuation: non-list line that is indented deeper than base
          if (rawLine.startsWith('  ') && trimmedLine !== '') {
            const top = stack[stack.length - 1];
            if (top && top.items.length > 0) {
              const lastItem = top.items[top.items.length - 1];
              const lastChild = lastItem.children[lastItem.children.length - 1];
              if (lastChild?.type === 'text') {
                lastChild.value += ' ' + trimmedLine;
              } else {
                lastItem.children.push({ type: 'text', value: trimmedLine });
              }
            }
            i++;
            continue;
          }
          break;
        }

        const indent = rawLine.search(/\S/);
        const relativeIndent = indent - baseIndent;

        let item: NestedListItem = { checked: null, children: parseContent(info.content) };
        const taskMatch = info.content.match(/^\[( |x|X)?\]\s+(.+)$/);
        if (taskMatch) {
          item.checked = taskMatch[1] === 'x' || taskMatch[1] === 'X' ? true : false;
          item.children = parseContent(taskMatch[2]);
        }

        if (stack.length === 0) {
          stack.push({ ordered: info.ordered, items: [item], indent: relativeIndent });
        } else {
          const top = stack[stack.length - 1];
          if (relativeIndent === top.indent) {
            top.items.push(item);
          } else if (relativeIndent > top.indent) {
            const parentItem = top.items[top.items.length - 1];
            parentItem.sublist = { ordered: info.ordered, items: [item] };
            stack.push({ ordered: info.ordered, items: parentItem.sublist.items, indent: relativeIndent });
          } else {
            while (stack.length > 0 && relativeIndent < stack[stack.length - 1].indent) {
              stack.pop();
            }
            if (stack.length > 0) {
              stack[stack.length - 1].items.push(item);
            }
          }
        }
        i++;
      }

      if (stack.length > 0) {
        blocks.push({ type: 'list', ordered: stack[0].ordered, items: stack[0].items });
      }
      continue;
    }

    // Paragraph (default)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (l === '') break;
      if (l.startsWith('```') || l.startsWith(':::')) break;
      if (l.startsWith('|') && l.endsWith('|')) break;
      if (l.startsWith('> ')) break;
      if (l.match(/^[-*+]\s+/)) break;
      if (l.match(/^\d+\.\s+/)) break;
      if (l.match(/^#{1,3}\s+/)) break;
      if (/^---\s*$/.test(l)) break;
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', children: parseContent(paraLines.join('\n')) });
    }
  }

  return blocks;
}
