import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, getFeaturedPost } from "@/lib/actions/posts";
import PostCard from "@/components/blog/PostCard";
import { PostCategory } from "@prisma/client";

export const metadata: Metadata = {
  title: "News & Updates | PUDEMO",
  description: "Latest news, statements, and analysis from the People's United Democratic Movement.",
};

const CATEGORY_LABELS: Record<string, string> = {
  NEWS: "News", STATEMENT: "Statement", ANALYSIS: "Analysis",
  ANNOUNCEMENT: "Announcement", INTERVIEW: "Interview",
};

function formatDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);
  const category = params.category as PostCategory | undefined;
  const search = params.q?.trim() || undefined;

  const [featured, { posts, totalPages }] = await Promise.all([
    getFeaturedPost(),
    getPublishedPosts({ page, category, search }),
  ]);

  // Don't show featured post in the grid on page 1 if it's there
  const gridPosts = page === 1 && !category && !search
    ? posts.filter((p) => p.id !== featured?.id)
    : posts;

  const categories = Object.values(PostCategory);

  return (
    <>
      <style>{`
        .blg-page { min-height: 60vh; }

        /* ── Page hero ── */
        .blg-hero {
          background: linear-gradient(135deg, var(--dark, #1a1a1a) 0%, #2d1a1a 100%);
          padding: clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 1.5rem);
          text-align: center;
        }
        .blg-hero-eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--secondary, #ffd700);
          margin-bottom: 0.75rem;
        }
        .blg-hero-title {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 1rem;
        }
        .blg-hero-sub {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          color: rgba(255,255,255,0.7);
          max-width: 520px;
          margin: 0 auto;
        }

        /* ── Featured post ── */
        .blg-featured-wrap {
          background: var(--light, #f7f6f3);
          padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 1.5rem);
        }
        .blg-featured {
          max-width: 1200px;
          margin: 0 auto;
        }
        .blg-featured-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
          background: #fff;
          min-height: 380px;
        }
        @media (max-width: 768px) { .blg-featured-card { grid-template-columns: 1fr; } }
        .blg-featured-img {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #1a1a1a 0%, #c8102e 100%);
          min-height: 260px;
        }
        .blg-featured-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .blg-featured-img-placeholder {
          width: 100%; height: 100%; min-height: 260px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #c8102e 60%);
          font-size: 4rem; opacity: 0.4;
        }
        .blg-featured-body {
          padding: clamp(1.5rem, 4vw, 2.5rem);
          display: flex; flex-direction: column; justify-content: center; gap: 1rem;
        }
        .blg-featured-label {
          font-size: 0.7rem; font-weight: 800; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--primary, #c8102e);
        }
        .blg-featured-title {
          font-size: clamp(1.35rem, 3vw, 1.8rem);
          font-weight: 800; color: var(--dark, #1a1a1a);
          letter-spacing: -0.02em; line-height: 1.25;
        }
        .blg-featured-excerpt { font-size: 0.9375rem; color: var(--gray-600, #4b5563); line-height: 1.65; }
        .blg-featured-meta { font-size: 0.8125rem; color: var(--gray-400, #9ca3af); }

        /* ── Filter bar ── */
        .blg-filters-wrap {
          background: #fff;
          border-bottom: 1px solid var(--gray-200, #e5e7eb);
          position: sticky; top: 0; z-index: 10;
        }
        .blg-filters {
          max-width: 1200px; margin: 0 auto;
          padding: 0.75rem clamp(1rem, 4vw, 1.5rem);
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .blg-filter-pill {
          display: inline-flex; align-items: center;
          padding: 5px 14px; border-radius: 999px;
          font-size: 0.8125rem; font-weight: 600;
          text-decoration: none;
          border: 1.5px solid var(--gray-200, #e5e7eb);
          color: var(--gray-600, #4b5563);
          background: #fff;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .blg-filter-pill:hover, .blg-filter-pill.active {
          border-color: var(--primary, #c8102e);
          color: var(--primary, #c8102e);
          background: rgba(200,16,46,0.05);
        }
        .blg-search-form { display: flex; gap: 6px; margin-left: auto; }
        .blg-search-input {
          padding: 5px 12px;
          border: 1.5px solid var(--gray-200, #e5e7eb);
          border-radius: 999px;
          font-size: 0.8125rem;
          outline: none;
          width: 200px;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .blg-search-input:focus { border-color: var(--primary, #c8102e); }
        .blg-search-btn {
          padding: 5px 14px; border-radius: 999px;
          background: var(--primary, #c8102e); color: #fff;
          border: none; cursor: pointer; font-size: 0.8125rem; font-weight: 600;
          font-family: inherit;
        }
        @media (max-width: 600px) { .blg-search-form { margin-left: 0; width: 100%; } .blg-search-input { flex: 1; } }

        /* ── Grid ── */
        .blg-grid-wrap { padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 1.5rem); }
        .blg-grid-inner { max-width: 1200px; margin: 0 auto; }
        .blg-grid-heading {
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--gray-400, #9ca3af);
          margin-bottom: 1.25rem;
        }
        .blg-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) { .blg-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px)  { .blg-grid { grid-template-columns: 1fr; } }

        /* ── PostCard styles ── */
        .pc-card {
          background: #fff;
          border: 1px solid var(--gray-200, #e5e7eb);
          border-radius: 12px;
          overflow: hidden;
          display: flex; flex-direction: column;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .pc-card:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.1); transform: translateY(-4px); }
        .pc-img-wrap { position: relative; aspect-ratio: 16/9; overflow: hidden; }
        .pc-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
        .pc-card:hover .pc-img { transform: scale(1.04); }
        .pc-img-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, var(--light, #f7f6f3), #e5e3de);
          display: flex; align-items: center; justify-content: center;
        }
        .pc-badge {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 999px;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .pc-badge-over {
          position: absolute; top: 10px; left: 10px;
        }
        .pc-body { padding: 1rem 1.25rem 0.5rem; flex: 1; }
        .pc-title {
          font-size: 1rem; font-weight: 700;
          color: var(--dark, #1a1a1a); line-height: 1.35;
          margin-bottom: 0.5rem;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .pc-excerpt {
          font-size: 0.875rem; color: var(--gray-500, #6b7280);
          line-height: 1.6; margin: 0;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
        }
        .pc-footer {
          padding: 0.75rem 1.25rem 1rem;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid var(--gray-100, #f3f4f6);
          margin-top: 0.75rem;
        }
        .pc-author { font-size: 0.8125rem; font-weight: 600; color: var(--gray-700, #374151); }
        .pc-date   { font-size: 0.75rem; color: var(--gray-400, #9ca3af); }

        /* Compact card */
        .pc-compact {
          display: flex; gap: 12px; padding: 12px;
          border: 1px solid var(--gray-200, #e5e7eb); border-radius: 10px;
          background: #fff; transition: box-shadow 0.15s;
        }
        .pc-compact:hover { box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.07)); }
        .pc-compact-img { width: 64px; height: 64px; border-radius: 6px; overflow: hidden; flex-shrink: 0; }
        .pc-compact-img img { width: 100%; height: 100%; object-fit: cover; }
        .pc-compact-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .pc-compact-title { font-size: 0.875rem; font-weight: 700; color: var(--dark, #1a1a1a); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pc-compact-date  { font-size: 0.75rem; color: var(--gray-400, #9ca3af); }

        /* ── Pagination ── */
        .blg-pager { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 1.5rem 0 0.5rem; flex-wrap: wrap; }
        .blg-pager-link {
          padding: 7px 18px; border-radius: 8px;
          border: 1.5px solid var(--gray-200, #e5e7eb);
          font-size: 0.875rem; font-weight: 600;
          text-decoration: none; color: var(--gray-700, #374151);
          transition: all 0.15s;
        }
        .blg-pager-link:hover { border-color: var(--primary, #c8102e); color: var(--primary, #c8102e); }
        .blg-pager-link.disabled { opacity: 0.35; pointer-events: none; }
        .blg-pager-info { font-size: 0.875rem; color: var(--gray-400, #9ca3af); }

        /* ── Empty state ── */
        .blg-empty { text-align: center; padding: 4rem 1rem; color: var(--gray-400, #9ca3af); }
        .blg-empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
        .blg-empty-title { font-size: 1.125rem; font-weight: 700; color: var(--gray-600, #4b5563); margin-bottom: 0.5rem; }
        .blg-empty-sub { font-size: 0.9rem; }
      `}</style>

      <div className="blg-page">

        {/* Hero */}
        <section className="blg-hero">
          <span className="blg-hero-eyebrow">PUDEMO Press</span>
          <h1 className="blg-hero-title">News &amp; Updates</h1>
          <p className="blg-hero-sub">Statements, analysis, and news from the People's United Democratic Movement.</p>
        </section>

        {/* Featured post — only on page 1, no filters */}
        {featured && page === 1 && !category && !search && (
          <section className="blg-featured-wrap">
            <div className="blg-featured">
              <Link href={`/blog/${featured.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="blg-featured-card">
                  <div className="blg-featured-img">
                    {featured.coverImage
                      ? <img src={featured.coverImage} alt={featured.title} />
                      : <div className="blg-featured-img-placeholder">📰</div>
                    }
                  </div>
                  <div className="blg-featured-body">
                    <div className="blg-featured-label">
                      Featured · {CATEGORY_LABELS[featured.category] ?? featured.category}
                    </div>
                    <h2 className="blg-featured-title">{featured.title}</h2>
                    <p className="blg-featured-excerpt">{featured.excerpt}</p>
                    <div className="blg-featured-meta">
                      {featured.author.name} · {formatDate(featured.publishedAt)}
                    </div>
                    <div>
                      <span className="btn btn-primary" style={{ display: "inline-flex", marginTop: "0.5rem" }}>
                        Read Full Article →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Filter bar */}
        <div className="blg-filters-wrap">
          <div className="blg-filters">
            <Link
              href="/blog"
              className={`blg-filter-pill ${!category ? "active" : ""}`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${cat}`}
                className={`blg-filter-pill ${category === cat ? "active" : ""}`}
              >
                {CATEGORY_LABELS[cat]}
              </Link>
            ))}
            <form className="blg-search-form" action="/blog" method="GET">
              {category && <input type="hidden" name="category" value={category} />}
              <input
                name="q"
                defaultValue={search}
                className="blg-search-input"
                placeholder="Search posts…"
              />
              <button type="submit" className="blg-search-btn">Search</button>
            </form>
          </div>
        </div>

        {/* Grid */}
        <section className="blg-grid-wrap">
          <div className="blg-grid-inner">
            {search && (
              <p className="blg-grid-heading">
                Results for &quot;{search}&quot; {category ? `in ${CATEGORY_LABELS[category]}` : ""}
              </p>
            )}
            {gridPosts.length === 0 ? (
              <div className="blg-empty">
                <div className="blg-empty-icon">📭</div>
                <div className="blg-empty-title">No posts found</div>
                <div className="blg-empty-sub">
                  {search || category
                    ? "Try adjusting your filters or search term."
                    : "Check back soon for updates from PUDEMO."}
                </div>
              </div>
            ) : (
              <div className="blg-grid">
                {gridPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="blg-pager" aria-label="Pagination">
                <Link
                  href={`/blog?page=${page - 1}${category ? `&category=${category}` : ""}${search ? `&q=${search}` : ""}`}
                  className={`blg-pager-link ${page <= 1 ? "disabled" : ""}`}
                >
                  ← Previous
                </Link>
                <span className="blg-pager-info">Page {page} of {totalPages}</span>
                <Link
                  href={`/blog?page=${page + 1}${category ? `&category=${category}` : ""}${search ? `&q=${search}` : ""}`}
                  className={`blg-pager-link ${page >= totalPages ? "disabled" : ""}`}
                >
                  Next →
                </Link>
              </nav>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
