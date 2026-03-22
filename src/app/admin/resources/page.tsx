"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, ExternalLink, X } from "lucide-react";
import {
  getAllResourcesAdmin,
  createResource,
  deleteResource,
} from "@/lib/actions/resources";

const RESOURCE_CATEGORIES = ["General", "Education", "Legal", "Political", "Financial"] as const;
import type { AdminResourceRow } from "@/lib/actions/resources";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function truncateUrl(url: string, max = 48) {
  try {
    const u = new URL(url);
    const display = u.hostname + u.pathname;
    return display.length > max ? display.slice(0, max) + "…" : display;
  } catch {
    return url.length > max ? url.slice(0, max) + "…" : url;
  }
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<AdminResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<string>("General");

  useEffect(() => {
    getAllResourcesAdmin()
      .then(setResources)
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setUrl("");
    setCategory("General");
    setFormError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setFormError("Title and URL are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await createResource({ title, description, url, category });
      const updated = await getAllResourcesAdmin();
      setResources(updated);
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message ?? "Failed to create resource.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  const CATEGORY_COLORS: Record<string, string> = {
    General: "#6b6b6b",
    Education: "#1e40af",
    Legal: "#7c3aed",
    Political: "#1a6640",
    Financial: "#b45309",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .res-page { font-family: 'Sora', sans-serif; color: #1a1a1a; display: flex; flex-direction: column; gap: 1.75rem; -webkit-font-smoothing: antialiased; }
        .res-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .res-title { font-size: clamp(1.35rem, 3vw, 1.7rem); font-weight: 800; letter-spacing: -0.04em; }
        .res-sub { font-size: 13.5px; color: #6b6b6b; margin-top: 2px; }
        .res-add-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: #1a6640; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 0.2s; }
        .res-add-btn:hover { opacity: 0.85; }

        /* Form card */
        .res-form-card { background: #fff; border: 1.5px solid #1a6640; border-radius: 12px; padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 2px 8px rgba(26,102,64,0.08); }
        .res-form-header { display: flex; justify-content: space-between; align-items: center; }
        .res-form-title { font-size: 14px; font-weight: 700; }
        .res-close-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent; cursor: pointer; color: #6b6b6b; transition: background 0.15s; }
        .res-close-btn:hover { background: #f0ede8; }
        .res-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 600px) { .res-form-grid { grid-template-columns: 1fr; } }
        .res-field { display: flex; flex-direction: column; gap: 5px; }
        .res-field-full { grid-column: 1 / -1; }
        .res-label { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #6b6b6b; }
        .res-input, .res-select, .res-textarea { width: 100%; padding: 8px 11px; border: 1.5px solid #e5e3de; border-radius: 7px; font-family: inherit; font-size: 13px; outline: none; transition: border-color 0.2s; box-sizing: border-box; background: #fff; }
        .res-input:focus, .res-select:focus, .res-textarea:focus { border-color: #1a6640; }
        .res-textarea { min-height: 72px; resize: vertical; }
        .res-form-error { font-size: 12px; color: #be123c; font-weight: 600; }
        .res-form-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .res-form-cancel { padding: 8px 16px; border: 1.5px solid #e5e3de; border-radius: 7px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; background: #fff; color: #4a4a4a; transition: all 0.15s; }
        .res-form-cancel:hover { border-color: #c0b8b0; }
        .res-form-submit { display: inline-flex; align-items: center; gap: 5px; padding: 8px 16px; background: #1a6640; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 0.2s; }
        .res-form-submit:hover { opacity: 0.85; }
        .res-form-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Table */
        .res-table-wrap { background: #fff; border: 1px solid #e5e3de; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .res-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .res-table th { padding: 11px 14px; text-align: left; font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #a0998e; background: #faf9f7; border-bottom: 1px solid #e5e3de; white-space: nowrap; }
        .res-table td { padding: 14px 14px; border-bottom: 1px solid #f0ede8; vertical-align: top; }
        .res-table tr:last-child td { border-bottom: none; }
        .res-table tr:hover td { background: #faf9f7; }
        .res-title-cell { font-weight: 600; color: #1a1a1a; }
        .res-desc-cell { font-size: 12px; color: #6b6b6b; margin-top: 2px; }
        .res-url-cell { display: flex; align-items: center; gap: 4px; font-size: 11.5px; font-family: 'JetBrains Mono', monospace; color: #1e40af; }
        .res-url-cell a { color: inherit; text-decoration: none; }
        .res-url-cell a:hover { text-decoration: underline; }
        .res-cat-badge { display: inline-flex; padding: 2px 8px; border-radius: 5px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; }
        .res-action-del { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; font-family: inherit; cursor: pointer; border: 1.5px solid rgba(190,18,60,0.2); background: rgba(190,18,60,0.08); color: #be123c; transition: all 0.15s; }
        .res-action-del:hover { background: rgba(190,18,60,0.15); }
        .res-action-del:disabled { opacity: 0.5; cursor: not-allowed; }
        .res-empty { padding: 48px 24px; text-align: center; color: #a0998e; }
        .res-empty-text { font-size: 13px; font-weight: 600; margin-top: 8px; }
        .res-loading { padding: 48px 24px; text-align: center; color: #a0998e; font-size: 13px; }

        /* Stats */
        .res-stats { display: flex; gap: 12px; flex-wrap: wrap; }
        .res-stat { background: #fff; border: 1px solid #e5e3de; border-radius: 10px; padding: 12px 18px; display: flex; flex-direction: column; gap: 2px; box-shadow: 0 1px 3px rgba(0,0,0,.03); min-width: 100px; }
        .res-stat-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #a0998e; }
        .res-stat-val { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.04em; font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="res-page">
        <div className="res-header">
          <div>
            <div className="res-title">Member Resources</div>
            <div className="res-sub">Manage resources available to active members.</div>
          </div>
          {!showForm && (
            <button className="res-add-btn" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Add Resource
            </button>
          )}
        </div>

        {/* Stats strip */}
        {!loading && (
          <div className="res-stats">
            <div className="res-stat">
              <span className="res-stat-label">Total</span>
              <span className="res-stat-val">{resources.length}</span>
            </div>
            {RESOURCE_CATEGORIES.map((cat) => (
              <div className="res-stat" key={cat}>
                <span className="res-stat-label">{cat}</span>
                <span className="res-stat-val" style={{ color: CATEGORY_COLORS[cat] ?? "#1a1a1a", fontSize: "1.3rem" }}>
                  {resources.filter((r) => r.category === cat).length}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <form className="res-form-card" onSubmit={handleSubmit}>
            <div className="res-form-header">
              <span className="res-form-title">Add New Resource</span>
              <button
                type="button"
                className="res-close-btn"
                onClick={() => { setShowForm(false); resetForm(); }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="res-form-grid">
              <div className="res-field res-field-full">
                <label className="res-label">Title *</label>
                <input
                  className="res-input"
                  placeholder="Resource title…"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  required
                />
              </div>

              <div className="res-field res-field-full">
                <label className="res-label">URL *</label>
                <input
                  className="res-input"
                  type="url"
                  placeholder="https://…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div className="res-field">
                <label className="res-label">Category</label>
                <select
                  className="res-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {RESOURCE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="res-field">
                <label className="res-label">Description (optional)</label>
                <input
                  className="res-input"
                  placeholder="Brief description…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                />
              </div>
            </div>

            {formError && <div className="res-form-error">{formError}</div>}

            <div className="res-form-actions">
              <button
                type="button"
                className="res-form-cancel"
                onClick={() => { setShowForm(false); resetForm(); }}
              >
                Cancel
              </button>
              <button type="submit" className="res-form-submit" disabled={submitting}>
                <Plus size={13} />
                {submitting ? "Adding…" : "Add Resource"}
              </button>
            </div>
          </form>
        )}

        {/* Table */}
        <div className="res-table-wrap">
          {loading ? (
            <div className="res-loading">Loading…</div>
          ) : resources.length === 0 ? (
            <div className="res-empty">
              <BookOpen size={32} strokeWidth={1.5} style={{ opacity: 0.3 }} />
              <div className="res-empty-text">No resources yet. Add the first one above.</div>
            </div>
          ) : (
            <table className="res-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Category</th>
                  <th>URL</th>
                  <th>Added By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => {
                  const color = CATEGORY_COLORS[r.category] ?? "#6b6b6b";
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="res-title-cell">{r.title}</div>
                        {r.description && <div className="res-desc-cell">{r.description}</div>}
                      </td>
                      <td>
                        <span
                          className="res-cat-badge"
                          style={{ background: `${color}18`, color }}
                        >
                          {r.category}
                        </span>
                      </td>
                      <td>
                        <div className="res-url-cell">
                          <a href={r.url} target="_blank" rel="noopener noreferrer">
                            {truncateUrl(r.url)}
                          </a>
                          <ExternalLink size={11} />
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: "#4a4a4a" }}>{r.authorName}</td>
                      <td style={{ fontSize: 12.5, color: "#6b6b6b", whiteSpace: "nowrap" }}>
                        {formatDate(r.createdAt)}
                      </td>
                      <td>
                        <button
                          className="res-action-del"
                          disabled={deleting === r.id}
                          onClick={() => handleDelete(r.id, r.title)}
                        >
                          <Trash2 size={12} />
                          {deleting === r.id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
