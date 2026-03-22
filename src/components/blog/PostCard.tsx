import Link from "next/link";
import type { PostSummary } from "@/lib/actions/posts";

const CATEGORY_LABELS: Record<string, string> = {
  NEWS: "News",
  STATEMENT: "Statement",
  ANALYSIS: "Analysis",
  ANNOUNCEMENT: "Announcement",
  INTERVIEW: "Interview",
};

function catColor(cat: string) {
  const map: Record<string, { bg: string; text: string }> = {
    NEWS:         { bg: "rgba(200,16,46,0.08)",  text: "#c8102e" },
    STATEMENT:    { bg: "rgba(26,102,64,0.08)",  text: "#1a6640" },
    ANALYSIS:     { bg: "rgba(30,64,175,0.08)",  text: "#1e40af" },
    ANNOUNCEMENT: { bg: "rgba(180,83,9,0.08)",   text: "#b45309" },
    INTERVIEW:    { bg: "rgba(107,114,128,0.1)",  text: "#374151" },
  };
  return map[cat] ?? { bg: "rgba(200,16,46,0.08)", text: "#c8102e" };
}

function formatDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  post: PostSummary;
  variant?: "default" | "compact";
}

export default function PostCard({ post, variant = "default" }: Props) {
  const color = catColor(post.category);
  const label = CATEGORY_LABELS[post.category] ?? post.category;

  if (variant === "compact") {
    return (
      <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div className="pc-compact">
          {post.coverImage && (
            <div className="pc-compact-img">
              <img src={post.coverImage} alt={post.title} />
            </div>
          )}
          <div className="pc-compact-body">
            <span className="pc-badge" style={{ background: color.bg, color: color.text }}>{label}</span>
            <div className="pc-compact-title">{post.title}</div>
            <div className="pc-compact-date">{formatDate(post.publishedAt)}</div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="pc-card">
      <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="pc-img-wrap">
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.title} className="pc-img" />
          ) : (
            <div className="pc-img-placeholder">
              <span style={{ fontSize: "2rem", opacity: 0.3 }}>📰</span>
            </div>
          )}
          <span className="pc-badge pc-badge-over" style={{ background: color.bg, color: color.text }}>{label}</span>
        </div>
        <div className="pc-body">
          <h3 className="pc-title">{post.title}</h3>
          <p className="pc-excerpt">{post.excerpt}</p>
        </div>
        <div className="pc-footer">
          <span className="pc-author">{post.author.name}</span>
          <span className="pc-date">{formatDate(post.publishedAt)}</span>
        </div>
      </Link>
    </div>
  );
}
