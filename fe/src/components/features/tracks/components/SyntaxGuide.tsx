'use client';

import { useState } from 'react';

const SECTIONS = [
  {
    title: 'Frontmatter (Metadata)',
    desc: 'Đặt ở đầu file, giữa hai dòng ---. Khai báo thông tin bài học.',
    code: `---
duration: 35 min
difficulty: Beginner
xp: 120 XP
subtitle: Learn modern React
---`,
  },
  {
    title: 'Headings',
    code: `# Heading 1
## Heading 2
### Heading 3`,
  },
  {
    title: 'Inline Formatting',
    code: `**Bold text**
*Italic text*
<u>Underline text</u>
\`inline code\``,
  },
  {
    title: 'Links',
    code: `[Internal link](/react-basics)
[External link](https://react.dev)`,
  },
  {
    title: 'Images',
    code: `![Alt text](image-url.jpg)`,
  },
  {
    title: 'Lists',
    code: `- Unordered item
- Another item

1. Ordered item
2. Next item

- [ ] Task chưa hoàn thành
- [x] Task đã hoàn thành`,
  },
  {
    title: 'Tables',
    code: `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`,
  },
  {
    title: 'Blockquotes',
    code: `> Nội dung trích dẫn quan trọng.`,
  },
  {
    title: 'Code Blocks',
    items: [
      { label: 'Generic (ts/js/jsx/css/html/json)', code: '```ts\nconst msg: string = "Hello";\n```' },
      { label: 'File Display (title="...")', code: '```tsx title="Button.tsx"\nexport function Button() {}\n```' },
      { label: 'Terminal (bash/shell)', code: '```bash\nnpm install react\n```' },
      { label: 'Folder Tree', code: '```tree\nsrc/\n├── components/\n│   └── Header.tsx\n└── App.tsx\n```' },
    ],
  },
  {
    title: 'Callout Blocks',
    items: [
      { label: ':::info', code: ':::info\nThông tin quan trọng.\n:::' },
      { label: ':::objective', code: ':::objective\n- Mục tiêu bài học\n:::' },
      { label: ':::prerequisites', code: ':::prerequisites\n- Kiến thức yêu cầu\n:::' },
      { label: ':::exercise', code: ':::exercise\nNội dung bài tập.\n:::' },
      { label: ':::challenge', code: ':::challenge\nBài tập nâng cao.\n:::' },
      { label: ':::summary', code: ':::summary\nTổng kết bài học.\n:::' },
    ],
  },
  {
    title: 'Tabs',
    code: `:::tabs

@tab JavaScript
console.log("Hello");

@tab TypeScript
console.log("Hello" as string);

:::`,
  },
  {
    title: 'Details / Accordion',
    code: `:::details Why React?
React is a library for building UIs.
:::`,
  },
];

export function SyntaxGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Syntax Guide"
        className="p-1.5 hover:bg-surface-container-high rounded transition-colors cursor-pointer ml-auto"
      >
        <span className="material-symbols-outlined text-[20px] text-secondary block">help_outline</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl bg-surface h-full overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-surface border-b border-outline-variant px-6 py-4 flex items-center justify-between z-10">
              <h2 className="headline-sm text-on-surface">Markdown Syntax Guide</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-surface-container-high rounded transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-secondary">close</span>
              </button>
            </div>

            <div className="px-6 py-6 space-y-8">
              <p className="text-body-sm text-secondary">
                Tài liệu này mô tả cú pháp Markdown đặc biệt được hỗ trợ khi soạn thảo bài học.
                Click vào syntax để copy vào clipboard.
              </p>

              {SECTIONS.map((section, si) => (
                <section key={si}>
                  <h3 className="label-md text-on-surface font-semibold mb-3">{section.title}</h3>

                  {section.desc && (
                    <p className="text-body-sm text-secondary mb-3">{section.desc}</p>
                  )}

                  {'code' in section && section.code && (
                    <CopyBlock code={section.code} />
                  )}

                  {'items' in section && section.items && (
                    <div className="space-y-3">
                      {section.items.map((item, ii) => (
                        <div key={ii}>
                          <p className="text-label-sm text-secondary mb-1">{item.label}</p>
                          <CopyBlock code={item.code} />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative group">
      <pre className="p-4 bg-surface-container-high rounded-lg code-font text-sm overflow-x-auto text-on-surface-variant">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-surface rounded border border-outline-variant opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px] text-secondary">
          {copied ? 'check' : 'content_copy'}
        </span>
      </button>
    </div>
  );
}
