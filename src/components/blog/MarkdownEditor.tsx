"use client";

import { useRef, useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

type ToolbarItem =
  | { label: string; title: string; wrap?: [string, string]; prefix?: never; block?: never }
  | { label: string; title: string; prefix: string; wrap?: never; block?: never }
  | { label: string; title: string; block: string; wrap?: never; prefix?: never }
  | { label: string; title: string; wrap: [string, string]; prefix?: never; block?: never };

const TOOLBAR: ToolbarItem[] = [
  { label: "B",   title: "Bold",        wrap: ["**", "**"] },
  { label: "I",   title: "Italic",      wrap: ["*", "*"] },
  { label: "H2",  title: "Heading 2",   block: "## " },
  { label: "H3",  title: "Heading 3",   block: "### " },
  { label: "❝",   title: "Blockquote",  block: "> " },
  { label: "—",   title: "Bullet list", block: "- " },
  { label: "1.",  title: "Ordered list",block: "1. " },
  { label: "</>", title: "Inline code", wrap: ["`", "`"] },
  { label: "```", title: "Code block",  wrap: ["```\n", "\n```"] },
  { label: "🖼",  title: "Image",       wrap: ["![", "](https://example.com/image.jpg)"] },
  { label: "▶",   title: "YouTube video", wrap: ["\n", "\nhttps://www.youtube.com/watch?v=VIDEO_ID\n"] },
  { label: "🔗",  title: "Link",        wrap: ["[", "](https://example.com)"] },
];

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content in Markdown...",
  minHeight = 400,
}: Props) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyTool(item: ToolbarItem) {
    const el = ref.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    let next = value;
    let newStart = start;
    let newEnd = end;

    if (item.wrap) {
      const [pre, post] = item.wrap;
      next = value.slice(0, start) + pre + selected + post + value.slice(end);
      newStart = start + pre.length;
      newEnd = newStart + selected.length;
    } else if (item.block) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      next = value.slice(0, lineStart) + item.block + value.slice(lineStart);
      const offset = item.block.length;
      newStart = start + offset;
      newEnd = end + offset;
    }

    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newStart, newEnd);
    });
  }

  return (
    <>
      <style>{`
        .mde-root { border: 1.5px solid var(--gray-300, #d1d5db); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
        .mde-tabs { display: flex; border-bottom: 1.5px solid var(--gray-200, #e5e7eb); background: var(--gray-100, #f3f4f6); }
        .mde-tab {
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--gray-500, #6b7280);
          border-bottom: 2px solid transparent;
          margin-bottom: -1.5px;
          font-family: inherit;
          transition: color 0.15s;
        }
        .mde-tab.active { color: var(--primary, #c8102e); border-bottom-color: var(--primary, #c8102e); background: #fff; }
        .mde-toolbar { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 10px; border-bottom: 1px solid var(--gray-200, #e5e7eb); background: #fafaf9; }
        .mde-btn {
          padding: 4px 8px;
          font-size: 11.5px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          border: 1px solid var(--gray-300, #d1d5db);
          border-radius: 4px;
          background: #fff;
          cursor: pointer;
          color: var(--gray-700, #374151);
          line-height: 1.4;
          transition: all 0.12s;
          white-space: nowrap;
        }
        .mde-btn:hover { background: var(--gray-100, #f3f4f6); border-color: var(--gray-400, #9ca3af); }
        .mde-textarea {
          width: 100%;
          resize: none;
          border: none;
          outline: none;
          padding: 16px;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.7;
          color: var(--dark, #1a1a1a);
          background: #fff;
        }
        .mde-preview { padding: 16px 20px; background: #fff; overflow-y: auto; }
        .mde-preview-empty { padding: 40px 20px; text-align: center; color: var(--gray-400, #9ca3af); font-size: 14px; }
      `}</style>
      <div className="mde-root">
        <div className="mde-tabs">
          <button className={`mde-tab ${tab === "write" ? "active" : ""}`} onClick={() => setTab("write")}>Write</button>
          <button className={`mde-tab ${tab === "preview" ? "active" : ""}`} onClick={() => setTab("preview")}>Preview</button>
        </div>

        {tab === "write" && (
          <>
            <div className="mde-toolbar">
              {TOOLBAR.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className="mde-btn"
                  title={item.title}
                  onClick={() => applyTool(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <textarea
              ref={ref}
              className="mde-textarea"
              style={{ minHeight }}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
            />
          </>
        )}

        {tab === "preview" && (
          <div className="mde-preview" style={{ minHeight }}>
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="mde-preview-empty">Nothing to preview yet.</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
