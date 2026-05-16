"use client";

import { useState, useEffect, useCallback } from "react";
import { getPublicResources } from "@/lib/actions/resources";
import type { PublicResourceRow } from "@/lib/actions/resources";
import { Search, BookOpen, Download, ExternalLink, FileText, File } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "General", "Education", "Legal", "Political", "Financial"] as const;

const CAT_STYLES: Record<string, { bg: string; color: string }> = {
  General:   { bg: "rgba(107,107,107,0.1)",  color: "#4a4a4a" },
  Education: { bg: "rgba(30,64,175,0.1)",    color: "#1e40af" },
  Legal:     { bg: "rgba(124,58,237,0.1)",   color: "#7c3aed" },
  Political: { bg: "rgba(26,102,64,0.1)",    color: "#1a6640" },
  Financial: { bg: "rgba(180,83,9,0.1)",     color: "#b45309" },
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatBytes(b: number | null) {
  if (!b) return null;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(type: string | null): string {
  if (!type) return "File";
  if (type === "application/pdf") return "PDF";
  if (type.includes("word") || type.includes("document")) return "Word Doc";
  if (type.includes("sheet") || type.includes("excel")) return "Spreadsheet";
  if (type.startsWith("image/")) return "Image";
  if (type.includes("zip")) return "Archive";
  if (type.startsWith("text/")) return "Text";
  return "File";
}

function FileIcon({ type }: { type: string | null }) {
  const label = fileTypeLabel(type);
  const colors: Record<string, string> = {
    "PDF": "#be123c", "Word Doc": "#1e40af", "Spreadsheet": "#1a6640",
    "Image": "#7c3aed", "Archive": "#b45309",
  };
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 10,
      background: `${colors[label] ?? "#6b6b6b"}14`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <FileText size={20} color={colors[label] ?? "#6b6b6b"} strokeWidth={1.5} />
    </div>
  );
}

function isExternal(url: string) {
  return (url.startsWith("http://") || url.startsWith("https://")) && !url.startsWith("data:");
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e3de", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
      {[["70%", 16], ["100%", 12], ["100%", 12], ["55%", 12]].map(([w, h], i) => (
        <div key={i} className="skel-line" style={{ width: w as string, height: h as number }} />
      ))}
    </div>
  );
}

// ─── Resource card ────────────────────────────────────────────────────────────

function ResourceCard({ r }: { r: PublicResourceRow }) {
  const style = CAT_STYLES[r.category] ?? CAT_STYLES.General;
  const size = formatBytes(r.fileSize);
  const fileLabel = fileTypeLabel(r.fileType);

  return (
    <div className="pub-card">
      <div className="pub-card-top">
        <FileIcon type={r.fileType} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pub-card-title">{r.title}</div>
          <div className="pub-card-meta">
            <span className="pub-cat-badge" style={{ background: style.bg, color: style.color }}>
              {r.category}
            </span>
            <span className="pub-file-type">{fileLabel}</span>
            {size && <span className="pub-file-size">{size}</span>}
          </div>
        </div>
      </div>

      {r.description && <p className="pub-card-desc">{r.description}</p>}

      {r.tags.length > 0 && (
        <div className="pub-tags">
          {r.tags.map((t) => (
            <span key={t} className="pub-tag">{t}</span>
          ))}
        </div>
      )}

      <div className="pub-card-footer">
        <span className="pub-card-date">{formatDate(r.createdAt)}</span>
        <a
          href={`/api/resources/${r.id}/download`}
          target="_blank"
          rel="noopener noreferrer"
          className="pub-download-btn"
        >
          <Download size={13} />
          Download
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicResourcesPage() {
  const [resources, setResources]   = useState<PublicResourceRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicResources({
        search: debouncedSearch || undefined,
        category: category !== "All" ? category : undefined,
      });
      setResources(data);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  useEffect(() => { load(); }, [load]);

  return (
    <main>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        .pub-res { font-family:'Sora',sans-serif; -webkit-font-smoothing:antialiased; }

        /* Search bar */
        .pub-search-wrap { max-width:520px; margin:0 auto; position:relative; }
        .pub-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#a0998e; pointer-events:none; }
        .pub-search-input { width:100%; padding:13px 14px 13px 42px; border:2px solid #e5e3de; border-radius:12px; font-family:inherit; font-size:14px; outline:none; transition:border-color 0.2s; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,.04); }
        .pub-search-input:focus { border-color:#1a6640; }

        /* Category pills */
        .pub-cats { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
        .pub-cat-pill { padding:7px 16px; border-radius:20px; border:1.5px solid #e5e3de; background:#fff; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; color:#4a4a4a; transition:all 0.15s; }
        .pub-cat-pill.active { border-color:#1a6640; color:#1a6640; background:rgba(26,102,64,0.07); }
        .pub-cat-pill:hover { border-color:#1a6640; color:#1a6640; }

        /* Grid */
        .pub-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }

        /* Card */
        .pub-card { background:#fff; border:1px solid #e5e3de; border-radius:14px; padding:20px; display:flex; flex-direction:column; gap:12px; transition:box-shadow 0.2s, border-color 0.2s; }
        .pub-card:hover { box-shadow:0 6px 24px rgba(0,0,0,0.08); border-color:#c0b8b0; }
        .pub-card-top { display:flex; align-items:flex-start; gap:12px; }
        .pub-card-title { font-size:15px; font-weight:700; color:#1a1a1a; line-height:1.35; }
        .pub-card-meta { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:5px; }
        .pub-cat-badge { display:inline-flex; padding:2px 8px; border-radius:4px; font-size:10.5px; font-weight:700; }
        .pub-file-type { font-size:10.5px; font-weight:600; color:#a0998e; }
        .pub-file-size { font-size:10.5px; color:#c0b8b0; }
        .pub-card-desc { font-size:13.5px; color:#4a4a4a; line-height:1.6; margin:0; }
        .pub-tags { display:flex; gap:5px; flex-wrap:wrap; }
        .pub-tag { font-size:10.5px; font-weight:600; padding:2px 7px; border-radius:4px; background:#f0ede8; color:#6b6b6b; }
        .pub-card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:4px; }
        .pub-card-date { font-size:11.5px; color:#a0998e; }
        .pub-download-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; background:#1a6640; color:#fff; border-radius:8px; font-size:12.5px; font-weight:700; text-decoration:none; transition:opacity 0.2s; white-space:nowrap; }
        .pub-download-btn:hover { opacity:0.85; }

        /* Skeleton */
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .skel-line { border-radius:6px; background:linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%); background-size:400px; animation:shimmer 1.4s infinite; }

        /* Empty */
        .pub-empty { padding:72px 24px; text-align:center; background:#fff; border:1px solid #e5e3de; border-radius:14px; }
        .pub-empty-title { font-size:16px; font-weight:700; color:#3a3a3a; margin:12px 0 6px; }
        .pub-empty-sub { font-size:13.5px; color:#a0998e; }

        /* Result count */
        .pub-result-count { font-size:13px; color:#6b6b6b; font-weight:500; }
      `}</style>

      <section className="section mt-12 pub-res">
        <div className="container">
          <SectionHeading
            title="Resources"
            subtitle="Party documents, policy guides, and materials for members and supporters."
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "2.5rem" }}>
            {/* Search */}
            <div className="pub-search-wrap">
              <Search size={18} className="pub-search-icon" />
              <input
                className="pub-search-input"
                placeholder="Search resources…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category filter */}
            <div className="pub-cats">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`pub-cat-pill ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Result count */}
            {!loading && (
              <div className="pub-result-count">
                {resources.length} resource{resources.length !== 1 ? "s" : ""}
                {category !== "All" ? ` in ${category}` : ""}
                {debouncedSearch ? ` matching "${debouncedSearch}"` : ""}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="pub-grid">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : resources.length === 0 ? (
              <div className="pub-empty">
                <BookOpen size={40} strokeWidth={1.5} style={{ opacity: 0.25, margin: "0 auto" }} />
                <div className="pub-empty-title">No resources found</div>
                <div className="pub-empty-sub">
                  {search || category !== "All"
                    ? "Try adjusting your search or filter."
                    : "Resources will appear here once they are published."}
                </div>
              </div>
            ) : (
              <div className="pub-grid">
                {resources.map((r) => <ResourceCard key={r.id} r={r} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
