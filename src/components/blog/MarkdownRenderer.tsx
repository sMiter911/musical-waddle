"use client";

import ReactMarkdown from "react-markdown";

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <>
      <style>{`
        .blg-prose { color: var(--gray-800, #1f2937); line-height: 1.8; font-size: 1.0625rem; }
        .blg-prose h1, .blg-prose h2, .blg-prose h3, .blg-prose h4 {
          color: var(--dark, #1a1a1a);
          font-weight: 700;
          line-height: 1.3;
          margin: 2rem 0 0.75rem;
        }
        .blg-prose h1 { font-size: clamp(1.5rem, 4vw, 2rem); }
        .blg-prose h2 { font-size: clamp(1.25rem, 3vw, 1.6rem); }
        .blg-prose h3 { font-size: clamp(1.1rem, 2.5vw, 1.3rem); }
        .blg-prose h4 { font-size: 1.1rem; }
        .blg-prose p  { margin: 0 0 1.25rem; }
        .blg-prose a  { color: var(--primary, #c8102e); text-decoration: underline; text-underline-offset: 3px; }
        .blg-prose a:hover { opacity: 0.8; }
        .blg-prose strong { font-weight: 700; color: var(--dark, #1a1a1a); }
        .blg-prose em { font-style: italic; }
        .blg-prose ul, .blg-prose ol { padding-left: 1.5rem; margin: 0 0 1.25rem; }
        .blg-prose li { margin-bottom: 0.4rem; }
        .blg-prose blockquote {
          border-left: 4px solid var(--primary, #c8102e);
          background: var(--light, #f7f6f3);
          margin: 1.5rem 0;
          padding: 1rem 1.25rem;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: var(--gray-700, #374151);
        }
        .blg-prose blockquote p { margin: 0; }
        .blg-prose code {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 0.15em 0.4em;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 0.875em;
          color: #c8102e;
        }
        .blg-prose pre {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .blg-prose pre code {
          background: none;
          border: none;
          padding: 0;
          color: #e5e7eb;
          font-size: 0.9rem;
        }
        .blg-prose hr {
          border: none;
          border-top: 2px solid var(--gray-200, #e5e7eb);
          margin: 2.5rem 0;
        }
        .blg-prose img { max-width: 100%; border-radius: 8px; margin: 1rem 0; }
        .blg-prose table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
        .blg-prose th, .blg-prose td {
          border: 1px solid var(--gray-200, #e5e7eb);
          padding: 0.6rem 0.9rem;
          text-align: left;
        }
        .blg-prose th { background: var(--light, #f7f6f3); font-weight: 600; }
      `}</style>
      <div className="blg-prose">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </>
  );
}
