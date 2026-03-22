"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Plus, Trash2 } from "lucide-react";
import { getAllBranchUpdatesAdmin, deleteBranchUpdate } from "@/lib/actions/branch-updates";
import type { AdminBranchUpdateRow } from "@/lib/actions/branch-updates";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminBranchUpdatesPage() {
  const [updates, setUpdates] = useState<AdminBranchUpdateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllBranchUpdatesAdmin()
      .then(setUpdates)
      .finally(() => setLoading(false));
  }, []);

  const filtered = updates.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.title.toLowerCase().includes(q) ||
      u.branchName.toLowerCase().includes(q) ||
      u.structureName.toLowerCase().includes(q)
    );
  });

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteBranchUpdate(id);
      setUpdates((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .bupd-page { font-family: 'Sora', sans-serif; color: #1a1a1a; display: flex; flex-direction: column; gap: 1.75rem; -webkit-font-smoothing: antialiased; }
        .bupd-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .bupd-title { font-size: clamp(1.35rem, 3vw, 1.7rem); font-weight: 800; letter-spacing: -0.04em; }
        .bupd-sub { font-size: 13.5px; color: #6b6b6b; margin-top: 2px; }
        .bupd-new-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: #1a6640; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; text-decoration: none; transition: opacity 0.2s; }
        .bupd-new-btn:hover { opacity: 0.85; }
        .bupd-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .bupd-search { padding: 8px 12px; border: 1.5px solid #e5e3de; border-radius: 8px; font-family: inherit; font-size: 13px; outline: none; width: 260px; transition: border-color 0.2s; }
        .bupd-search:focus { border-color: #1a6640; }
        .bupd-count { font-size: 12px; color: #a0998e; font-weight: 600; }
        .bupd-table-wrap { background: #fff; border: 1px solid #e5e3de; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .bupd-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .bupd-table th { padding: 11px 14px; text-align: left; font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #a0998e; background: #faf9f7; border-bottom: 1px solid #e5e3de; white-space: nowrap; }
        .bupd-table td { padding: 14px 14px; border-bottom: 1px solid #f0ede8; vertical-align: top; }
        .bupd-table tr:last-child td { border-bottom: none; }
        .bupd-table tr:hover td { background: #faf9f7; }
        .bupd-title-cell { font-weight: 600; color: #1a1a1a; }
        .bupd-content-cell { font-size: 12px; color: #6b6b6b; max-width: 320px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .bupd-branch-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; background: rgba(26,102,64,0.1); color: #1a6640; white-space: nowrap; }
        .bupd-region { font-size: 11.5px; color: #a0998e; margin-top: 2px; }
        .bupd-action-del { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; font-family: inherit; cursor: pointer; border: 1.5px solid rgba(190,18,60,0.2); background: rgba(190,18,60,0.08); color: #be123c; transition: all 0.15s; }
        .bupd-action-del:hover { background: rgba(190,18,60,0.15); }
        .bupd-action-del:disabled { opacity: 0.5; cursor: not-allowed; }
        .bupd-empty { padding: 48px 24px; text-align: center; color: #a0998e; }
        .bupd-empty-icon { font-size: 2rem; margin-bottom: 8px; opacity: 0.4; }
        .bupd-empty-text { font-size: 13px; font-weight: 600; }
        .bupd-loading { padding: 48px 24px; text-align: center; color: #a0998e; font-size: 13px; }
      `}</style>

      <div className="bupd-page">
        <div className="bupd-header">
          <div>
            <div className="bupd-title">Branch Updates</div>
            <div className="bupd-sub">Post and manage regional branch announcements.</div>
          </div>
          <Link href="/admin/branch-updates/new" className="bupd-new-btn">
            <Plus size={15} /> New Update
          </Link>
        </div>

        <div className="bupd-toolbar">
          <input
            className="bupd-search"
            placeholder="Search by title or branch…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {!loading && (
            <span className="bupd-count">{filtered.length} update{filtered.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        <div className="bupd-table-wrap">
          {loading ? (
            <div className="bupd-loading">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="bupd-empty">
              <div className="bupd-empty-icon">📢</div>
              <div className="bupd-empty-text">
                {search ? "No updates match your search." : "No branch updates yet. Create the first one."}
              </div>
            </div>
          ) : (
            <table className="bupd-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Branch</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="bupd-title-cell">{u.title}</div>
                      <div className="bupd-content-cell">{u.content}</div>
                    </td>
                    <td>
                      <span className="bupd-branch-badge">{u.branchName}</span>
                      <div className="bupd-region">{u.structureName}</div>
                    </td>
                    <td style={{ fontSize: 13, color: "#4a4a4a" }}>{u.authorName}</td>
                    <td style={{ fontSize: 12.5, color: "#6b6b6b", whiteSpace: "nowrap" }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td>
                      <button
                        className="bupd-action-del"
                        disabled={deleting === u.id}
                        onClick={() => handleDelete(u.id, u.title)}
                      >
                        <Trash2 size={12} />
                        {deleting === u.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
