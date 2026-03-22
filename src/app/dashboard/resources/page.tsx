"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { getResourcesForMember } from "@/lib/actions/resources";
import type { MemberResourceRow } from "@/lib/actions/resources";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  General:   { bg: "rgba(107,107,107,0.1)",  color: "#4a4a4a" },
  Education: { bg: "rgba(30,64,175,0.1)",    color: "#1e40af" },
  Legal:     { bg: "rgba(124,58,237,0.1)",   color: "#7c3aed" },
  Political: { bg: "rgba(26,102,64,0.1)",    color: "#1a6640" },
  Financial: { bg: "rgba(180,83,9,0.1)",     color: "#b45309" },
};

export default function MemberResourcesPage() {
  const [resources, setResources] = useState<MemberResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    getResourcesForMember()
      .then(setResources)
      .catch((err) => {
        if (err?.message === "INCOMPLETE_PROFILE") setAccessError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(resources.map((r) => r.category)))];

  const filtered =
    activeCategory === "All"
      ? resources
      : resources.filter((r) => r.category === activeCategory);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        .res-m-page { font-family: 'Sora', sans-serif; color: #1a1a1a; max-width: 900px; margin: 0 auto; padding: 32px 20px; display: flex; flex-direction: column; gap: 2rem; -webkit-font-smoothing: antialiased; }
        .res-m-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #6b6b6b; text-decoration: none; transition: color 0.15s; }
        .res-m-back:hover { color: #1a1a1a; }
        .res-m-hero { display: flex; align-items: flex-start; gap: 14px; }
        .res-m-hero-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(26,102,64,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .res-m-title { font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; letter-spacing: -0.04em; }
        .res-m-sub { font-size: 13.5px; color: #6b6b6b; margin-top: 3px; }

        /* Access denied */
        .res-m-access-denied { padding: 48px 32px; text-align: center; background: rgba(180,83,9,0.05); border: 1.5px solid rgba(180,83,9,0.2); border-radius: 14px; }
        .res-m-access-title { font-size: 17px; font-weight: 800; color: #92400e; margin-bottom: 8px; }
        .res-m-access-sub { font-size: 13.5px; color: #92400e; opacity: 0.85; max-width: 420px; margin: 0 auto; line-height: 1.6; }
        .res-m-access-link { display: inline-flex; margin-top: 18px; padding: 10px 20px; background: #b45309; color: #fff; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; transition: opacity 0.2s; }
        .res-m-access-link:hover { opacity: 0.85; }

        /* Filters */
        .res-m-filters { display: flex; gap: 6px; flex-wrap: wrap; }
        .res-m-pill { padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e5e3de; background: #fff; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; color: #4a4a4a; transition: all 0.15s; }
        .res-m-pill.active { border-color: #1a6640; color: #1a6640; background: rgba(26,102,64,0.06); }
        .res-m-pill:hover { border-color: #1a6640; color: #1a6640; }

        /* Grid */
        .res-m-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .res-m-card { background: #fff; border: 1px solid #e5e3de; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: box-shadow 0.15s, border-color 0.15s; }
        .res-m-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); border-color: #c0b8b0; }
        .res-m-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .res-m-card-title { font-size: 14.5px; font-weight: 700; color: #1a1a1a; flex: 1; }
        .res-m-cat-badge { display: inline-flex; padding: 2px 9px; border-radius: 20px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap; flex-shrink: 0; }
        .res-m-desc { font-size: 13px; color: #6b6b6b; line-height: 1.55; flex: 1; }
        .res-m-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 4px; }
        .res-m-date { font-size: 11.5px; color: #a0998e; }
        .res-m-open-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px; background: #1a6640; color: #fff; border-radius: 7px; font-size: 12.5px; font-weight: 700; text-decoration: none; transition: opacity 0.2s; }
        .res-m-open-btn:hover { opacity: 0.85; }

        /* States */
        .res-m-empty { padding: 56px 24px; text-align: center; background: #fff; border: 1px solid #e5e3de; border-radius: 12px; }
        .res-m-empty-title { font-size: 15px; font-weight: 700; color: #3a3a3a; margin-bottom: 4px; margin-top: 10px; }
        .res-m-empty-sub { font-size: 13px; color: #a0998e; }
        .res-m-loading { padding: 48px; text-align: center; color: #a0998e; font-size: 14px; }
      `}</style>

      <div className="res-m-page">
        <Link href="/dashboard" className="res-m-back">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="res-m-hero">
          <div className="res-m-hero-icon">
            <BookOpen size={22} color="#1a6640" />
          </div>
          <div>
            <div className="res-m-title">Member Resources</div>
            <div className="res-m-sub">
              Party documents, guides, and materials for active members.
            </div>
          </div>
        </div>

        {loading ? (
          <div className="res-m-loading">Loading resources…</div>
        ) : accessError ? (
          <div className="res-m-access-denied">
            <div className="res-m-access-title">Profile Incomplete</div>
            <div className="res-m-access-sub">
              Member resources are available to active members only. Complete your profile
              to unlock access to all party resources and materials.
            </div>
            <Link href="/dashboard/profile" className="res-m-access-link">
              Complete My Profile
            </Link>
          </div>
        ) : (
          <>
            {categories.length > 2 && (
              <div className="res-m-filters">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`res-m-pill${activeCategory === cat ? " active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="res-m-empty">
                <BookOpen size={36} strokeWidth={1.5} style={{ opacity: 0.25 }} />
                <div className="res-m-empty-title">No resources available</div>
                <div className="res-m-empty-sub">
                  Resources will appear here once they are uploaded by administrators.
                </div>
              </div>
            ) : (
              <div className="res-m-grid">
                {filtered.map((r) => {
                  const style = CATEGORY_STYLES[r.category] ?? CATEGORY_STYLES.General;
                  return (
                    <div key={r.id} className="res-m-card">
                      <div className="res-m-card-header">
                        <div className="res-m-card-title">{r.title}</div>
                        <span
                          className="res-m-cat-badge"
                          style={{ background: style.bg, color: style.color }}
                        >
                          {r.category}
                        </span>
                      </div>
                      {r.description && (
                        <div className="res-m-desc">{r.description}</div>
                      )}
                      <div className="res-m-card-footer">
                        <span className="res-m-date">Added {formatDate(r.createdAt)}</span>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="res-m-open-btn"
                        >
                          Open <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
