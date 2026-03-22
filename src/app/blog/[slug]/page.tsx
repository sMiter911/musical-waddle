import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedPostBySlug, getRelatedPosts } from "@/lib/actions/posts";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import CommentSection from "@/components/blog/CommentSection";
import PostCard from "@/components/blog/PostCard";

const CATEGORY_LABELS: Record<string, string> = {
  NEWS: "News", STATEMENT: "Statement", ANALYSIS: "Analysis",
  ANNOUNCEMENT: "Announcement", INTERVIEW: "Interview",
};

function catColor(cat: string) {
  const map: Record<string, { bg: string; text: string }> = {
    NEWS:         { bg: "rgba(200,16,46,0.12)",  text: "#c8102e" },
    STATEMENT:    { bg: "rgba(26,102,64,0.12)",  text: "#1a6640" },
    ANALYSIS:     { bg: "rgba(30,64,175,0.12)",  text: "#1e40af" },
    ANNOUNCEMENT: { bg: "rgba(180,83,9,0.12)",   text: "#b45309" },
    INTERVIEW:    { bg: "rgba(107,114,128,0.12)", text: "#374151" },
  };
  return map[cat] ?? { bg: "rgba(200,16,46,0.12)", text: "#c8102e" };
}

function formatDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | PUDEMO`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.id, post.category);
  const color = catColor(post.category);
  const mins = readingTime(post.content);

  return (
    <>
      <style>{`
        /* ── Post hero ── */
        .pd-hero {
          position: relative;
          min-height: 380px;
          display: flex; align-items: flex-end;
          overflow: hidden;
          background: var(--dark, #1a1a1a);
        }
        .pd-hero-img { position: absolute; inset: 0; z-index: 0; }
        .pd-hero-img img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0.45; }
        .pd-hero-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to top, rgba(26,26,26,0.95) 0%, rgba(26,26,26,0.4) 60%, transparent 100%);
        }
        .pd-hero-body {
          position: relative; z-index: 2;
          width: 100%; max-width: 820px;
          margin: 0 auto;
          padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 1.5rem) clamp(2.5rem, 6vw, 4rem);
        }
        .pd-hero-badge {
          display: inline-flex; align-items: center;
          padding: 4px 12px; border-radius: 999px;
          font-size: 0.7rem; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .pd-hero-title {
          font-size: clamp(1.75rem, 5vw, 2.75rem);
          font-weight: 800; color: #fff;
          letter-spacing: -0.03em; line-height: 1.2;
          margin-bottom: 1.25rem;
        }
        .pd-hero-meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .pd-hero-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--primary, #c8102e);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.3);
        }
        .pd-hero-author { font-size: 0.9rem; font-weight: 600; color: #fff; }
        .pd-hero-date   { font-size: 0.875rem; color: rgba(255,255,255,0.65); }
        .pd-hero-read   { font-size: 0.875rem; color: rgba(255,255,255,0.65); }
        .pd-hero-sep    { color: rgba(255,255,255,0.3); }

        /* ── Article body ── */
        .pd-article-wrap { background: #fff; padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 1.5rem); }
        .pd-article { max-width: 820px; margin: 0 auto; }

        /* ── Tags ── */
        .pd-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--gray-200, #e5e7eb); }
        .pd-tag {
          padding: 4px 12px; border-radius: 999px;
          background: var(--light, #f7f6f3);
          border: 1px solid var(--gray-200, #e5e7eb);
          font-size: 0.8rem; font-weight: 600; color: var(--gray-600, #4b5563);
        }

        /* ── Back link ── */
        .pd-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.875rem; font-weight: 600; color: var(--primary, #c8102e);
          text-decoration: none; margin-bottom: 2.5rem;
          padding: 6px 14px; border: 1.5px solid rgba(200,16,46,0.2);
          border-radius: 999px; background: rgba(200,16,46,0.04);
          transition: all 0.15s;
        }
        .pd-back:hover { background: rgba(200,16,46,0.1); }

        /* ── Related posts ── */
        .pd-related-wrap { background: var(--light, #f7f6f3); padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 1.5rem); }
        .pd-related { max-width: 1200px; margin: 0 auto; }
        .pd-related-heading { font-size: 1.25rem; font-weight: 800; color: var(--dark, #1a1a1a); margin-bottom: 1.5rem; letter-spacing: -0.02em; }
        .pd-related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 900px)  { .pd-related-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px)  { .pd-related-grid { grid-template-columns: 1fr; } }
      `}</style>

      <article>
        {/* Hero */}
        <div className="pd-hero">
          {post.coverImage && (
            <div className="pd-hero-img">
              <img src={post.coverImage} alt={post.title} />
            </div>
          )}
          <div className="pd-hero-overlay" />
          <div className="pd-hero-body">
            <span
              className="pd-hero-badge"
              style={{ background: color.bg, color: color.text }}
            >
              {CATEGORY_LABELS[post.category] ?? post.category}
            </span>
            <h1 className="pd-hero-title">{post.title}</h1>
            <div className="pd-hero-meta">
              <div className="pd-hero-avatar">
                {post.author.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <span className="pd-hero-author">{post.author.name}</span>
              <span className="pd-hero-sep">·</span>
              <span className="pd-hero-date">{formatDate(post.publishedAt)}</span>
              <span className="pd-hero-sep">·</span>
              <span className="pd-hero-read">{mins} min read</span>
            </div>
          </div>
        </div>

        {/* Article */}
        <div className="pd-article-wrap">
          <div className="pd-article">
            <Link href="/blog" className="pd-back">← Back to News</Link>

            <MarkdownRenderer content={post.content} />

            {post.tags.length > 0 && (
              <div className="pd-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="pd-tag">#{tag}</span>
                ))}
              </div>
            )}

            <CommentSection postId={post.id} initialComments={post.comments} />
          </div>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="pd-related-wrap">
          <div className="pd-related">
            <h2 className="pd-related-heading">More in {CATEGORY_LABELS[post.category] ?? post.category}</h2>
            <div className="pd-related-grid">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
