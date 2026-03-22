"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FileText, Plus, Edit2, Trash2, Eye, ChevronUp, ChevronDown } from "lucide-react";
import { getAllPostsAdmin, deletePost, getPostStats } from "@/lib/actions/posts";
import type { AdminPostRow } from "@/lib/actions/posts";
import { PostStatus, PostCategory } from "@prisma/client";

const CATEGORY_LABELS: Record<string, string> = {
  NEWS: "News", STATEMENT: "Statement", ANALYSIS: "Analysis",
  ANNOUNCEMENT: "Announcement", INTERVIEW: "Interview",
};

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

type SortKey = "title" | "category" | "status" | "publishedAt" | "createdAt" | "commentCount";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPostRow[]>([]);
  const [stats, setStats] = useState({ totalPosts: 0, publishedPosts: 0, draftPosts: 0, totalComments: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PostStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | PostCategory>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [rows, st] = await Promise.all([getAllPostsAdmin(), getPostStats()]);
        setPosts(rows);
        setStats(st);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let rows = [...posts];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.title.toLowerCase().includes(q) || r.authorName.toLowerCase().includes(q));
    }
    if (statusFilter !== "ALL") rows = rows.filter((r) => r.status === statusFilter);
    if (categoryFilter !== "ALL") rows = rows.filter((r) => r.category === categoryFilter);

    rows.sort((a, b) => {
      let av: any = a[sortKey], bv: any = b[sortKey];
      if (av instanceof Date || (typeof av === "string" && av.match(/^\d{4}/))) {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return rows;
  }, [posts, search, statusFilter, categoryFilter, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  async function handleDelete(postId: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(postId);
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setStats((s) => ({
        ...s,
        totalPosts: s.totalPosts - 1,
        publishedPosts: posts.find((p) => p.id === postId)?.status === PostStatus.PUBLISHED
          ? s.publishedPosts - 1 : s.publishedPosts,
        draftPosts: posts.find((p) => p.id === postId)?.status === PostStatus.DRAFT
          ? s.draftPosts - 1 : s.draftPosts,
      }));
    } finally {
      setDeleting(null);
    }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ opacity: 0.25, marginLeft: 4 }}>↕</span>;
    return sortAsc
      ? <ChevronUp size={12} style={{ marginLeft: 4 }} />
      : <ChevronDown size={12} style={{ marginLeft: 4 }} />;
  }

  const statItems = [
    { label: "Total Posts",    value: stats.totalPosts    },
    { label: "Published",      value: stats.publishedPosts },
    { label: "Drafts",         value: stats.draftPosts    },
    { label: "Total Comments", value: stats.totalComments },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .blgadm-page { font-family: 'Sora', sans-serif; color: #1a1a1a; display: flex; flex-direction: column; gap: 1.75rem; -webkit-font-smoothing: antialiased; }

        .blgadm-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .blgadm-title { font-size: clamp(1.35rem, 3vw, 1.7rem); font-weight: 800; letter-spacing: -0.04em; }
        .blgadm-sub { font-size: 13.5px; color: #6b6b6b; margin-top: 2px; }

        .blgadm-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 900px)  { .blgadm-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px)  { .blgadm-stats { grid-template-columns: 1fr; } }
        .blgadm-stat {
          background: #fff; border: 1px solid #e5e3de; border-radius: 10px;
          padding: 14px 18px; display: flex; flex-direction: column; gap: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,.04);
        }
        .blgadm-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #a0998e; }
        .blgadm-stat-val { font-size: 1.7rem; font-weight: 800; letter-spacing: -0.04em; font-family: 'JetBrains Mono', monospace; color: #1a1a1a; }

        .blgadm-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .blgadm-search { padding: 8px 12px; border: 1.5px solid #e5e3de; border-radius: 8px; font-family: inherit; font-size: 13px; outline: none; width: 220px; transition: border-color 0.2s; }
        .blgadm-search:focus { border-color: #1a6640; }
        .blgadm-pills { display: flex; gap: 4px; }
        .blgadm-pill { padding: 6px 12px; border-radius: 6px; border: 1.5px solid #e5e3de; background: #fff; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; color: #4a4a4a; transition: all 0.15s; }
        .blgadm-pill.active, .blgadm-pill:hover { border-color: #1a6640; color: #1a6640; background: rgba(26,102,64,0.06); }
        .blgadm-select { padding: 7px 10px; border: 1.5px solid #e5e3de; border-radius: 8px; font-family: inherit; font-size: 12px; font-weight: 600; outline: none; background: #fff; cursor: pointer; color: #4a4a4a; }

        .blgadm-table-wrap { background: #fff; border: 1px solid #e5e3de; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .blgadm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .blgadm-table th { padding: 11px 14px; text-align: left; font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #a0998e; background: #faf9f7; border-bottom: 1px solid #e5e3de; cursor: pointer; white-space: nowrap; user-select: none; }
        .blgadm-table th:hover { color: #1a1a1a; }
        .blgadm-table td { padding: 13px 14px; border-bottom: 1px solid #f0ede8; vertical-align: middle; }
        .blgadm-table tr:last-child td { border-bottom: none; }
        .blgadm-table tr:hover td { background: #faf9f7; }

        .blgadm-title-cell { font-weight: 600; color: #1a1a1a; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .blgadm-slug-cell { font-size: 11px; color: #a0998e; font-family: 'JetBrains Mono', monospace; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .blgadm-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap; }
        .blgadm-badge-published { background: rgba(26,102,64,0.1); color: #1a6640; }
        .blgadm-badge-draft     { background: rgba(180,83,9,0.1);  color: #b45309; }

        .blgadm-actions { display: flex; gap: 6px; align-items: center; }
        .blgadm-action { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; font-family: inherit; cursor: pointer; border: 1.5px solid transparent; transition: all 0.15s; text-decoration: none; white-space: nowrap; }
        .blgadm-action-edit  { background: rgba(26,102,64,0.08);  color: #1a6640; border-color: rgba(26,102,64,0.2);  }
        .blgadm-action-edit:hover  { background: rgba(26,102,64,0.15); }
        .blgadm-action-view  { background: rgba(30,64,175,0.08);  color: #1e40af; border-color: rgba(30,64,175,0.2);  }
        .blgadm-action-view:hover  { background: rgba(30,64,175,0.15); }
        .blgadm-action-del   { background: rgba(190,18,60,0.08);  color: #be123c; border-color: rgba(190,18,60,0.2);  }
        .blgadm-action-del:hover   { background: rgba(190,18,60,0.15); }

        .blgadm-empty { padding: 48px 24px; text-align: center; color: #a0998e; }
        .blgadm-empty-icon { font-size: 2rem; margin-bottom: 8px; opacity: 0.4; }
        .blgadm-empty-text { font-size: 13px; font-weight: 600; }

        .blgadm-new-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: #1a6640; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; text-decoration: none; transition: opacity 0.2s; }
        .blgadm-new-btn:hover { opacity: 0.85; }
      `}</style>

      <div className="blgadm-page">
        {/* Header */}
        <div className="blgadm-header">
          <div>
            <div className="blgadm-title">Blog Posts</div>
            <div className="blgadm-sub">Manage all news, statements, and articles.</div>
          </div>
          <Link href="/admin/posts/new" className="blgadm-new-btn">
            <Plus size={15} /> New Post
          </Link>
        </div>

        {/* Stats */}
        <div className="blgadm-stats">
          {statItems.map((s) => (
            <div key={s.label} className="blgadm-stat">
              <div className="blgadm-stat-label">{s.label}</div>
              <div className="blgadm-stat-val">{loading ? "—" : s.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="blgadm-toolbar">
          <input
            className="blgadm-search"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="blgadm-pills">
            {(["ALL", PostStatus.PUBLISHED, PostStatus.DRAFT] as const).map((s) => (
              <button
                key={s}
                className={`blgadm-pill ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "ALL" ? "All" : s === PostStatus.PUBLISHED ? "Published" : "Drafts"}
              </button>
            ))}
          </div>
          <select
            className="blgadm-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
          >
            <option value="ALL">All Categories</option>
            {Object.values(PostCategory).map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="blgadm-table-wrap">
          <table className="blgadm-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort("title")}>Title <SortIcon k="title" /></th>
                <th onClick={() => toggleSort("category")}>Category <SortIcon k="category" /></th>
                <th onClick={() => toggleSort("status")}>Status <SortIcon k="status" /></th>
                <th>Author</th>
                <th onClick={() => toggleSort("publishedAt")}>Published <SortIcon k="publishedAt" /></th>
                <th onClick={() => toggleSort("commentCount")}>Comments <SortIcon k="commentCount" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "#a0998e" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="blgadm-empty">
                      <div className="blgadm-empty-icon">📭</div>
                      <div className="blgadm-empty-text">No posts found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div className="blgadm-title-cell" title={post.title}>{post.title}</div>
                      <div className="blgadm-slug-cell">{post.slug}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#4a4a4a" }}>
                        {CATEGORY_LABELS[post.category]}
                      </span>
                    </td>
                    <td>
                      <span className={`blgadm-badge ${post.status === PostStatus.PUBLISHED ? "blgadm-badge-published" : "blgadm-badge-draft"}`}>
                        {post.status === PostStatus.PUBLISHED ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td style={{ color: "#6b6b6b" }}>{post.authorName}</td>
                    <td style={{ color: "#6b6b6b", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
                      {formatDate(post.publishedAt)}
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", textAlign: "center" }}>
                      {post.commentCount}
                    </td>
                    <td>
                      <div className="blgadm-actions">
                        <Link href={`/admin/posts/${post.id}/edit`} className="blgadm-action blgadm-action-edit">
                          <Edit2 size={11} /> Edit
                        </Link>
                        {post.status === PostStatus.PUBLISHED && (
                          <Link href={`/blog/${post.slug}`} target="_blank" className="blgadm-action blgadm-action-view">
                            <Eye size={11} /> View
                          </Link>
                        )}
                        <button
                          className="blgadm-action blgadm-action-del"
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deleting === post.id}
                        >
                          <Trash2 size={11} /> {deleting === post.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
