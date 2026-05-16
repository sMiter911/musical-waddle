"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen, Plus, Trash2, ExternalLink, X, Upload,
  Link2, Eye, EyeOff, Edit2, Search, FileText, File,
  Loader2, CheckCircle,
} from "lucide-react";
import {
  getAllResourcesAdmin, createResource, updateResource,
  deleteResource, togglePublishResource,
} from "@/lib/actions/resources";
import type { AdminResourceRow } from "@/lib/actions/resources";

const CATEGORIES = ["General", "Education", "Legal", "Political", "Financial"] as const;

const CAT_COLORS: Record<string, string> = {
  General: "#6b6b6b", Education: "#1e40af",
  Legal: "#7c3aed", Political: "#1a6640", Financial: "#b45309",
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatBytes(b: number | null) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(type: string | null) {
  if (!type) return <File size={13} />;
  if (type.startsWith("image/")) return <span style={{ fontSize: 13 }}>🖼️</span>;
  if (type === "application/pdf") return <span style={{ fontSize: 13 }}>📄</span>;
  if (type.includes("word") || type.includes("document")) return <span style={{ fontSize: 13 }}>📝</span>;
  if (type.includes("sheet") || type.includes("excel")) return <span style={{ fontSize: 13 }}>📊</span>;
  if (type.includes("zip") || type.includes("compressed")) return <span style={{ fontSize: 13 }}>🗜️</span>;
  return <FileText size={13} />;
}

function isExternalUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function isUploadedFile(url: string) {
  return url.startsWith("data:") || url.includes("/uploads/");
}

// ─── Upload hook ──────────────────────────────────────────────────────────────

type UploadState = "idle" | "uploading" | "done" | "error";

function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ url: string; fileType: string; fileSize: number } | null>(null);
  const [uploadError, setUploadError] = useState("");

  const reset = () => {
    setUploadState("idle");
    setUploadProgress(0);
    setUploadResult(null);
    setUploadError("");
  };

  const upload = useCallback(async (file: File) => {
    setUploadState("uploading");
    setUploadProgress(10);
    setUploadError("");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      setUploadProgress(90);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Upload failed");
      }
      const data = await res.json();
      setUploadResult(data);
      setUploadState("done");
      setUploadProgress(100);
    } catch (err: any) {
      setUploadError(err.message ?? "Upload failed");
      setUploadState("error");
    }
  }, []);

  return { uploadState, uploadProgress, uploadResult, uploadError, upload, reset };
}

// ─── Resource Form Modal ──────────────────────────────────────────────────────

type FormMode = "add" | "edit";
type InputMode = "file" | "url";

interface ResourceFormProps {
  mode: FormMode;
  initial?: AdminResourceRow;
  onClose: () => void;
  onSaved: () => void;
}

function ResourceForm({ mode, initial, onClose, onSaved }: ResourceFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>(
    initial ? (isUploadedFile(initial.fileUrl) ? "file" : "url") : "file"
  );
  const [title, setTitle]           = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory]     = useState(initial?.category ?? "General");
  const [isPublished, setPublished] = useState(initial?.isPublished ?? true);
  const [tags, setTags]             = useState(initial?.tags?.join(", ") ?? "");
  const [urlInput, setUrlInput]     = useState(initial && !isUploadedFile(initial.fileUrl) ? initial.fileUrl : "");
  const [isDragging, setDragging]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadState, uploadResult, uploadError, upload, reset: resetUpload } = useFileUpload();

  function pickFile(file: File) {
    resetUpload();
    upload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) pickFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) { setFormError("Title is required."); return; }

    const fileUrl = inputMode === "file"
      ? uploadResult?.url ?? (initial?.fileUrl && isUploadedFile(initial.fileUrl) ? initial.fileUrl : "")
      : urlInput.trim();

    if (!fileUrl) {
      setFormError(inputMode === "file" ? "Please upload a file." : "URL is required.");
      return;
    }

    setSubmitting(true);
    try {
      const tagsArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        fileUrl,
        fileType:  uploadResult?.fileType,
        fileSize:  uploadResult?.fileSize,
        category,
        isPublished,
        tags: tagsArr,
      };

      if (mode === "add") {
        await createResource(payload);
      } else {
        await updateResource(initial!.id, payload);
      }
      onSaved();
    } catch (err: any) {
      setFormError(err.message ?? "Failed to save resource.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rf-overlay" onClick={onClose}>
      <div className="rf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <span className="rf-modal-title">{mode === "add" ? "Add Resource" : "Edit Resource"}</span>
          <button className="rf-close" onClick={onClose}><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit} className="rf-form">
          {/* Title */}
          <div className="rf-field">
            <label className="rf-label">Title *</label>
            <input className="rf-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource title…" maxLength={200} />
          </div>

          {/* Description */}
          <div className="rf-field">
            <label className="rf-label">Description</label>
            <textarea className="rf-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description…" rows={2} />
          </div>

          {/* Category + tags row */}
          <div className="rf-row">
            <div className="rf-field">
              <label className="rf-label">Category</label>
              <select className="rf-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="rf-field">
              <label className="rf-label">Tags (comma-separated)</label>
              <input className="rf-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. policy, 2024" />
            </div>
          </div>

          {/* File source toggle */}
          <div className="rf-field">
            <label className="rf-label">File Source</label>
            <div className="rf-toggle-row">
              <button type="button" className={`rf-toggle-btn ${inputMode === "file" ? "active" : ""}`} onClick={() => setInputMode("file")}>
                <Upload size={13} /> Upload File
              </button>
              <button type="button" className={`rf-toggle-btn ${inputMode === "url" ? "active" : ""}`} onClick={() => setInputMode("url")}>
                <Link2 size={13} /> External URL
              </button>
            </div>
          </div>

          {inputMode === "file" ? (
            <div
              className={`rf-drop-zone ${isDragging ? "dragging" : ""} ${uploadState === "done" ? "done" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
              {uploadState === "idle" && (
                <>
                  <Upload size={22} style={{ opacity: 0.35 }} />
                  <div className="rf-drop-text">Drag & drop or <span className="rf-drop-link">browse</span></div>
                  <div className="rf-drop-sub">PDF, DOCX, XLSX, images — max 12 MB</div>
                  {initial?.fileUrl && isUploadedFile(initial.fileUrl) && (
                    <div className="rf-drop-current">Current: {initial.fileUrl.startsWith("data:") ? initial.fileType ?? "uploaded file" : initial.fileUrl.split("/").pop()}</div>
                  )}
                </>
              )}
              {uploadState === "uploading" && (
                <><Loader2 size={22} className="animate-spin" style={{ opacity: 0.5 }} /><div className="rf-drop-text">Uploading…</div></>
              )}
              {uploadState === "done" && uploadResult && (
                <><CheckCircle size={22} color="#1a6640" /><div className="rf-drop-text" style={{ color: "#1a6640" }}>{uploadResult.fileType ?? "File uploaded"}</div><div className="rf-drop-sub">{formatBytes(uploadResult.fileSize)}</div></>
              )}
              {uploadState === "error" && (
                <><X size={22} color="#be123c" /><div className="rf-drop-text" style={{ color: "#be123c" }}>{uploadError}</div></>
              )}
            </div>
          ) : (
            <div className="rf-field">
              <label className="rf-label">URL *</label>
              <input className="rf-input" type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://…" />
            </div>
          )}

          {/* Publish toggle */}
          <label className="rf-publish-toggle">
            <div className={`rf-switch ${isPublished ? "on" : ""}`} onClick={() => setPublished(!isPublished)}>
              <div className="rf-switch-knob" />
            </div>
            <span>{isPublished ? "Published — visible to the public" : "Draft — not visible publicly"}</span>
          </label>

          {formError && <div className="rf-error">{formError}</div>}

          <div className="rf-modal-footer">
            <button type="button" className="rf-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="rf-btn-save" disabled={submitting || uploadState === "uploading"}>
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              {submitting ? "Saving…" : mode === "add" ? "Add Resource" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminResourcesPage() {
  const [resources, setResources]   = useState<AdminResourceRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("All");
  const [showForm, setShowForm]     = useState<false | "add" | AdminResourceRow>(false);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [toggling, setToggling]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setResources(await getAllResourcesAdmin()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = resources.filter((r) => {
    const matchCat = filterCat === "All" || r.category === filterCat;
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } finally { setDeleting(null); }
  }

  async function handleToggle(id: string) {
    setToggling(id);
    try {
      const next = await togglePublishResource(id);
      setResources((prev) => prev.map((r) => r.id === id ? { ...r, isPublished: next } : r));
    } finally { setToggling(null); }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        /* ── Page ── */
        .res-page { font-family:'Sora',sans-serif; color:#1a1a1a; display:flex; flex-direction:column; gap:1.75rem; -webkit-font-smoothing:antialiased; }
        .res-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; }
        .res-title { font-size:clamp(1.35rem,3vw,1.7rem); font-weight:800; letter-spacing:-0.04em; }
        .res-sub { font-size:13.5px; color:#6b6b6b; margin-top:2px; }
        .res-add-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; background:#1a6640; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:opacity 0.2s; white-space:nowrap; }
        .res-add-btn:hover { opacity:0.85; }

        /* ── Stats ── */
        .res-stats { display:flex; gap:12px; flex-wrap:wrap; }
        .res-stat { background:#fff; border:1px solid #e5e3de; border-radius:10px; padding:12px 18px; min-width:90px; box-shadow:0 1px 3px rgba(0,0,0,.03); }
        .res-stat-label { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#a0998e; }
        .res-stat-val { font-size:1.55rem; font-weight:800; letter-spacing:-0.04em; font-family:'JetBrains Mono',monospace; margin-top:2px; }

        /* ── Toolbar ── */
        .res-toolbar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .res-search-wrap { display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #e5e3de; border-radius:8px; padding:0 12px; flex:1; min-width:200px; max-width:320px; }
        .res-search-wrap:focus-within { border-color:#1a6640; }
        .res-search { border:none; outline:none; font-family:inherit; font-size:13px; background:transparent; padding:9px 0; flex:1; }
        .res-cat-pill { padding:7px 13px; border-radius:20px; border:1.5px solid #e5e3de; background:#fff; font-size:12.5px; font-weight:600; cursor:pointer; font-family:inherit; color:#4a4a4a; transition:all 0.15s; white-space:nowrap; }
        .res-cat-pill.active { border-color:#1a6640; color:#1a6640; background:rgba(26,102,64,0.06); }
        .res-cat-pill:hover { border-color:#1a6640; color:#1a6640; }

        /* ── Table ── */
        .res-table-wrap { background:#fff; border:1px solid #e5e3de; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.04); }
        .res-table { width:100%; border-collapse:collapse; font-size:13px; }
        .res-table th { padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#a0998e; background:#faf9f7; border-bottom:1px solid #e5e3de; white-space:nowrap; }
        .res-table td { padding:13px 14px; border-bottom:1px solid #f0ede8; vertical-align:middle; }
        .res-table tr:last-child td { border-bottom:none; }
        .res-table tr:hover td { background:#faf9f7; }
        .res-title-cell { font-weight:600; }
        .res-desc-cell { font-size:12px; color:#6b6b6b; margin-top:2px; max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .res-cat-badge { display:inline-flex; padding:2px 8px; border-radius:5px; font-size:10.5px; font-weight:700; letter-spacing:0.05em; white-space:nowrap; }
        .res-file-cell { display:flex; align-items:center; gap:5px; font-size:11.5px; font-family:'JetBrains Mono',monospace; color:#1e40af; }
        .res-file-cell a { color:inherit; text-decoration:none; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .res-file-cell a:hover { text-decoration:underline; }
        .res-size { font-size:11px; color:#a0998e; font-family:'JetBrains Mono',monospace; }
        .res-pub-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:5px; font-size:10.5px; font-weight:700; }
        .res-pub-yes { background:rgba(26,102,64,0.1); color:#1a6640; }
        .res-pub-no  { background:rgba(107,107,107,0.1); color:#6b6b6b; }
        .res-actions { display:flex; align-items:center; gap:5px; }
        .res-btn { display:inline-flex; align-items:center; gap:3px; padding:5px 9px; border-radius:6px; font-size:11.5px; font-weight:600; font-family:inherit; cursor:pointer; border:1.5px solid; transition:all 0.15s; }
        .res-btn-edit { color:#1a6640; border-color:rgba(26,102,64,0.25); background:rgba(26,102,64,0.06); }
        .res-btn-edit:hover { background:rgba(26,102,64,0.12); }
        .res-btn-pub { color:#6b6b6b; border-color:rgba(107,107,107,0.2); background:rgba(107,107,107,0.06); }
        .res-btn-pub:hover { background:rgba(107,107,107,0.12); }
        .res-btn-del { color:#be123c; border-color:rgba(190,18,60,0.2); background:rgba(190,18,60,0.06); }
        .res-btn-del:hover { background:rgba(190,18,60,0.14); }
        .res-btn:disabled { opacity:0.45; cursor:not-allowed; }
        .res-empty { padding:48px 24px; text-align:center; color:#a0998e; }
        .res-empty-text { font-size:13px; font-weight:600; margin-top:8px; }
        .res-loading { padding:48px 24px; text-align:center; color:#a0998e; font-size:13px; }

        /* ── Modal overlay ── */
        .rf-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:300; display:flex; align-items:center; justify-content:center; padding:20px; }
        .rf-modal { background:#fff; border-radius:14px; width:100%; max-width:540px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 64px rgba(0,0,0,0.2); font-family:'Sora',sans-serif; }
        .rf-modal-header { display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid #f0ede8; }
        .rf-modal-title { font-size:15px; font-weight:800; }
        .rf-close { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; border:none; background:transparent; cursor:pointer; color:#6b6b6b; transition:background 0.15s; }
        .rf-close:hover { background:#f0ede8; }
        .rf-form { display:flex; flex-direction:column; gap:14px; padding:20px 22px; }
        .rf-field { display:flex; flex-direction:column; gap:5px; }
        .rf-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media(max-width:480px) { .rf-row { grid-template-columns:1fr; } }
        .rf-label { font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#6b6b6b; }
        .rf-input, .rf-select, .rf-textarea { width:100%; padding:8px 11px; border:1.5px solid #e5e3de; border-radius:7px; font-family:inherit; font-size:13px; outline:none; transition:border-color 0.2s; background:#fff; box-sizing:border-box; }
        .rf-input:focus, .rf-select:focus, .rf-textarea:focus { border-color:#1a6640; }
        .rf-textarea { resize:vertical; }
        .rf-toggle-row { display:flex; gap:6px; }
        .rf-toggle-btn { display:inline-flex; align-items:center; gap:5px; padding:7px 14px; border-radius:7px; border:1.5px solid #e5e3de; background:#fff; font-family:inherit; font-size:12.5px; font-weight:600; cursor:pointer; color:#4a4a4a; transition:all 0.15s; }
        .rf-toggle-btn.active { border-color:#1a6640; color:#1a6640; background:rgba(26,102,64,0.07); }
        .rf-toggle-btn:hover { border-color:#1a6640; color:#1a6640; }

        /* Drop zone */
        .rf-drop-zone { border:2px dashed #d0ccc6; border-radius:10px; padding:28px 20px; display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; transition:all 0.2s; background:#faf9f7; }
        .rf-drop-zone:hover, .rf-drop-zone.dragging { border-color:#1a6640; background:rgba(26,102,64,0.03); }
        .rf-drop-zone.done { border-color:#1a6640; border-style:solid; background:rgba(26,102,64,0.04); }
        .rf-drop-text { font-size:13.5px; font-weight:600; color:#4a4a4a; }
        .rf-drop-link { color:#1a6640; text-decoration:underline; }
        .rf-drop-sub { font-size:11.5px; color:#a0998e; }
        .rf-drop-current { font-size:11px; color:#6b6b6b; font-family:'JetBrains Mono',monospace; margin-top:4px; }

        /* Publish toggle */
        .rf-publish-toggle { display:flex; align-items:center; gap:10px; cursor:pointer; font-size:13px; color:#4a4a4a; font-weight:500; }
        .rf-switch { width:36px; height:20px; border-radius:10px; background:#d0ccc6; position:relative; transition:background 0.2s; flex-shrink:0; cursor:pointer; }
        .rf-switch.on { background:#1a6640; }
        .rf-switch-knob { position:absolute; top:3px; left:3px; width:14px; height:14px; border-radius:50%; background:#fff; transition:transform 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.2); }
        .rf-switch.on .rf-switch-knob { transform:translateX(16px); }

        .rf-error { font-size:12px; color:#be123c; font-weight:600; }
        .rf-modal-footer { display:flex; gap:10px; justify-content:flex-end; padding-top:4px; }
        .rf-btn-cancel { padding:8px 16px; border-radius:7px; border:1.5px solid #e5e3de; background:#fff; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; color:#4a4a4a; }
        .rf-btn-cancel:hover { border-color:#c0b8b0; }
        .rf-btn-save { display:inline-flex; align-items:center; gap:5px; padding:8px 18px; background:#1a6640; color:#fff; border:none; border-radius:7px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:opacity 0.2s; }
        .rf-btn-save:hover { opacity:0.85; }
        .rf-btn-save:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>

      <div className="res-page">
        {/* Header */}
        <div className="res-header">
          <div>
            <div className="res-title">Resources</div>
            <div className="res-sub">Manage documents and materials available to members and the public.</div>
          </div>
          <button className="res-add-btn" onClick={() => setShowForm("add")}>
            <Plus size={15} /> Add Resource
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="res-stats">
            <div className="res-stat">
              <div className="res-stat-label">Total</div>
              <div className="res-stat-val">{resources.length}</div>
            </div>
            <div className="res-stat">
              <div className="res-stat-label">Published</div>
              <div className="res-stat-val" style={{ color: "#1a6640" }}>
                {resources.filter((r) => r.isPublished).length}
              </div>
            </div>
            <div className="res-stat">
              <div className="res-stat-label">Drafts</div>
              <div className="res-stat-val" style={{ color: "#6b6b6b" }}>
                {resources.filter((r) => !r.isPublished).length}
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="res-toolbar">
          <div className="res-search-wrap">
            <Search size={14} style={{ color: "#a0998e", flexShrink: 0 }} />
            <input
              className="res-search"
              placeholder="Search resources…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              className={`res-cat-pill ${filterCat === cat ? "active" : ""}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="res-table-wrap">
          {loading ? (
            <div className="res-loading">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="res-empty">
              <BookOpen size={32} strokeWidth={1.5} style={{ opacity: 0.3, margin: "0 auto" }} />
              <div className="res-empty-text">
                {search || filterCat !== "All" ? "No resources match your filters." : "No resources yet."}
              </div>
            </div>
          ) : (
            <table className="res-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Category</th>
                  <th>File / URL</th>
                  <th>Status</th>
                  <th>Added By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const color = CAT_COLORS[r.category] ?? "#6b6b6b";
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="res-title-cell">{r.title}</div>
                        {r.description && <div className="res-desc-cell">{r.description}</div>}
                        {r.tags.length > 0 && (
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                            {r.tags.map((t) => (
                              <span key={t} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "#f0ede8", color: "#6b6b6b", fontWeight: 600 }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="res-cat-badge" style={{ background: `${color}18`, color }}>
                          {r.category}
                        </span>
                      </td>
                      <td>
                        <div className="res-file-cell">
                          {fileIcon(r.fileType)}
                          <a href={`/api/resources/${r.id}/download`} target="_blank" rel="noopener noreferrer" title={r.fileUrl}>
                            {isExternalUrl(r.fileUrl) ? new URL(r.fileUrl).hostname : r.fileUrl.split("/").pop()}
                          </a>
                          {!r.fileUrl.startsWith("data:") && <ExternalLink size={10} style={{ flexShrink: 0 }} />}
                        </div>
                        {r.fileSize && <div className="res-size">{formatBytes(r.fileSize)}</div>}
                      </td>
                      <td>
                        <span className={`res-pub-badge ${r.isPublished ? "res-pub-yes" : "res-pub-no"}`}>
                          {r.isPublished ? <Eye size={10} /> : <EyeOff size={10} />}
                          {r.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: "#4a4a4a" }}>{r.authorName}</td>
                      <td style={{ fontSize: 12, color: "#6b6b6b", whiteSpace: "nowrap" }}>
                        {formatDate(r.createdAt)}
                      </td>
                      <td>
                        <div className="res-actions">
                          <button className="res-btn res-btn-edit" onClick={() => setShowForm(r)} title="Edit">
                            <Edit2 size={11} />
                          </button>
                          <button
                            className="res-btn res-btn-pub"
                            disabled={toggling === r.id}
                            onClick={() => handleToggle(r.id)}
                            title={r.isPublished ? "Unpublish" : "Publish"}
                          >
                            {toggling === r.id
                              ? <Loader2 size={11} className="animate-spin" />
                              : r.isPublished ? <EyeOff size={11} /> : <Eye size={11} />
                            }
                          </button>
                          <button
                            className="res-btn res-btn-del"
                            disabled={deleting === r.id}
                            onClick={() => handleDelete(r.id, r.title)}
                            title="Delete"
                          >
                            {deleting === r.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form modal */}
      {showForm !== false && (
        <ResourceForm
          mode={showForm === "add" ? "add" : "edit"}
          initial={showForm === "add" ? undefined : (showForm as AdminResourceRow)}
          onClose={() => setShowForm(false)}
          onSaved={async () => { setShowForm(false); await load(); }}
        />
      )}
    </>
  );
}
