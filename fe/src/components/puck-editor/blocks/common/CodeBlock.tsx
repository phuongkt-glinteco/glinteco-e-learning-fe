"use client";

import React, { useState } from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const CodeBlock: ComponentConfig<LessonBlockProps["CodeBlock"]> = {
  fields: {
    category: {
      type: "select",
      label: "Nhóm định dạng",
      options: [
        { label: "Lập trình (Code)", value: "code" },
        { label: "Văn bản dữ liệu (Text/Config)", value: "text" },
        { label: "Dòng lệnh (Command)", value: "command" },
      ],
    },
    language: {
      type: "select",
      label: "Ngôn ngữ",
      options: [
        // Nhóm Code
        { label: "JavaScript (JS)", value: "js" },
        { label: "React JSX", value: "jsx" },
        { label: "TypeScript (TS)", value: "ts" },
        { label: "React TSX", value: "tsx" },
        { label: "Python", value: "python" },
        { label: "HTML", value: "html" },
        { label: "CSS", value: "css" },
        // Nhóm Text
        { label: "JSON", value: "json" },
        { label: "YAML", value: "yaml" },
        { label: "Markdown (MD)", value: "md" },
        { label: "Plain Text (TXT)", value: "txt" },
        // Nhóm Command
        { label: "Terminal / Bash", value: "terminal" },
        { label: "PowerShell", value: "powershell" },
        { label: "SQL", value: "sql" },
      ],
    },
    code: {
      type: "textarea",
      label: "Đoạn code / Câu lệnh",
    },
    showLineNumbers: {
      type: "radio",
      label: "Hiển thị số dòng",
      options: [
        { label: "Bật", value: true as any },
        { label: "Tắt", value: false as any },
      ],
    },
  },
  defaultProps: {
    category: "code",
    language: "ts",
    code: `// Ví dụ hàm TypeScript trong bài học\nfunction greet(name: string): string {\n  return \`Xin chào, \${name}!\`;\n}`,
    showLineNumbers: true,
  },
  render: ({ category, language, code, showLineNumbers }) => {
    return <CodeBlockRender category={category} language={language} code={code} showLineNumbers={showLineNumbers} />;
  },
};

// Internal render component hỗ trợ nút Copy
const CodeBlockRender: React.FC<LessonBlockProps["CodeBlock"]> = ({
  category,
  language,
  code,
  showLineNumbers,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const badgeCategoryLabel =
    category === "command"
      ? "CLI"
      : category === "text"
        ? "CONFIG"
        : "CODE";

  const lines = (code || "").split("\n");

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-lg text-slate-100">
      {/* Header thanh tiêu đề của đoạn Code */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/90 border-b border-slate-700/80 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">
            {badgeCategoryLabel}
          </span>
          <span className="text-slate-300 font-semibold uppercase">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
        >
          {copied ? "✓ Đã sao chép" : "Sao chép"}
        </button>
      </div>

      {/* Vùng hiển thị Code */}
      <div className="p-4 overflow-x-auto font-mono text-sm leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40">
                {showLineNumbers && (
                  <td className="w-8 pr-4 text-right text-slate-500 select-none align-top">
                    {idx + 1}
                  </td>
                )}
                <td className="whitespace-pre align-top text-slate-200">{line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
