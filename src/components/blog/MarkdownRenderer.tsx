"use client";

import React from "react";
import ReactMarkdown, { Components } from "react-markdown";

interface Props {
  content: string;
}

const YOUTUBE_RE =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})(?:\S*)?/;

function extractYouTubeId(text: string): string | null {
  const m = text.match(YOUTUBE_RE);
  return m ? m[1] : null;
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="blg-yt-wrap">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

const components: Components = {
  p({ children }) {
    const childArr = React.Children.toArray(children);

    // If paragraph is a single plain-text YouTube URL, render embed
    if (childArr.length === 1 && typeof childArr[0] === "string") {
      const id = extractYouTubeId(childArr[0].trim());
      if (id) return <YouTubeEmbed videoId={id} />;
    }

    // If paragraph is a single link that is a YouTube URL, render embed
    if (childArr.length === 1 && React.isValidElement(childArr[0])) {
      const el = childArr[0] as React.ReactElement<{ href?: string }>;
      if (el.type === "a" && el.props.href) {
        const id = extractYouTubeId(el.props.href);
        if (id) return <YouTubeEmbed videoId={id} />;
      }
    }

    return <p>{children}</p>;
  },

  a({ href, children }) {
    if (href) {
      const id = extractYouTubeId(href);
      if (id) return <YouTubeEmbed videoId={id} />;
    }
    return <a href={href}>{children}</a>;
  },

  img({ src, alt }) {
    return (
      <span className="blg-img-wrap">
        <img src={src} alt={alt || ""} loading="lazy" />
        {alt && <span className="blg-img-caption">{alt}</span>}
      </span>
    );
  },
};

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

        .blg-yt-wrap {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%;
          margin: 1.5rem 0;
          border-radius: 8px;
          overflow: hidden;
          background: #000;
        }
        .blg-yt-wrap iframe {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border: none;
        }

        .blg-img-wrap {
          display: block;
          margin: 1.5rem 0;
          text-align: center;
        }
        .blg-img-wrap img {
          max-width: 100%;
          border-radius: 8px;
          margin: 0 auto;
        }
        .blg-img-caption {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: var(--gray-500, #6b7280);
          font-style: italic;
        }
      `}</style>
      <div className="blg-prose">
        <ReactMarkdown components={components}>{content}</ReactMarkdown>
      </div>
    </>
  );
}
