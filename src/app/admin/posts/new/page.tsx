"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { createPost } from "@/lib/actions/posts";
import MarkdownEditor from "@/components/blog/MarkdownEditor";
import { PostCategory, PostStatus } from "@prisma/client";

const CATEGORY_LABELS: Record<string, string> = {
  NEWS: "News", STATEMENT: "Statement", ANALYSIS: "Analysis",
  ANNOUNCEMENT: "Announcement", INTERVIEW: "Interview",
};

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle]           = useState("");
  const [excerpt, setExcerpt]       = useState("");
  const [content, setContent]       = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory]     = useState<PostCategory>(PostCategory.NEWS);
  const [tags, setTags]             = useState("");
  const [status, setStatus]         = useState<PostStatus>(PostStatus.DRAFT);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");

  async function handleSave() {
    if (!title.trim())   { setError("Title is required."); return; }
    if (!excerpt.trim()) { setError("Excerpt is required."); return; }
    if (!content.trim()) { setError("Content is required."); return; }
    setError("");
    setSaving(true);
    try {
      const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
      await createPost({ title, excerpt, content, coverImage: coverImage || undefined, category, tags: tagArr, status });
      router.push("/admin/posts");
    } catch (e: any) {
      setError(e.message ?? "Failed to save post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .ped-page { font-family: 'Sora', sans-serif; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
        .ped-topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .ped-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #6b6b6b; text-decoration: none; padding: 6px 12px; border: 1.5px solid #e5e3de; border-radius: 7px; background: #fff; transition: all 0.15s; }
        .ped-back:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .ped-topbar-title { font-size: 1.3rem; font-weight: 800; letter-spacing: -0.03em; }
        .ped-topbar-actions { display: flex; align-items: center; gap: 8px; }
        .ped-error { background: rgba(190,18,60,0.08); border: 1px solid rgba(190,18,60,0.2); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #be123c; font-weight: 500; }

        .ped-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
        @media (max-width: 900px) { .ped-layout { grid-template-columns: 1fr; } }

        .ped-main { display: flex; flex-direction: column; gap: 16px; }
        .ped-card { background: #fff; border: 1px solid #e5e3de; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .ped-card-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

        .ped-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #a0998e; margin-bottom: 6px; }
        .ped-input {
          width: 100%; padding: 10px 14px;
          border: 1.5px solid #e5e3de; border-radius: 8px;
          font-family: inherit; font-size: 14px; outline: none;
          transition: border-color 0.2s; color: #1a1a1a;
        }
        .ped-input:focus { border-color: #1a6640; }
        .ped-input-title { font-size: 1.3rem; font-weight: 700; letter-spacing: -0.02em; padding: 12px 16px; }
        .ped-textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
        .ped-char-hint { font-size: 11px; color: #a0998e; text-align: right; margin-top: 4px; }

        .ped-sidebar { display: flex; flex-direction: column; gap: 16px; }
        .ped-sidebar-card { background: #fff; border: 1px solid #e5e3de; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .ped-sidebar-header { padding: 12px 16px; border-bottom: 1px solid #f0ede8; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #a0998e; }
        .ped-sidebar-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }

        .ped-select { width: 100%; padding: 9px 12px; border: 1.5px solid #e5e3de; border-radius: 8px; font-family: inherit; font-size: 13px; outline: none; background: #fff; cursor: pointer; color: #1a1a1a; transition: border-color 0.2s; }
        .ped-select:focus { border-color: #1a6640; }

        .ped-cover-preview { width: 100%; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; background: #f7f6f3; border: 1px dashed #e5e3de; display: flex; align-items: center; justify-content: center; margin-top: 8px; }
        .ped-cover-preview img { width: 100%; height: 100%; object-fit: cover; }
        .ped-cover-placeholder { font-size: 1.5rem; opacity: 0.3; }

        .ped-save-btn {
          width: 100%; padding: 11px;
          background: #1a6640; color: #fff;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: opacity 0.2s;
        }
        .ped-save-btn:hover:not(:disabled) { opacity: 0.85; }
        .ped-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ped-save-btn.publish { background: #c8102e; }
      `}</style>

      <div className="ped-page">
        <div className="ped-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/admin/posts" className="ped-back"><ArrowLeft size={14} /> Posts</Link>
            <span className="ped-topbar-title">New Post</span>
          </div>
          <div className="ped-topbar-actions">
            <button
              className="ped-save-btn"
              style={{ width: "auto", padding: "9px 20px" }}
              onClick={() => { setStatus(PostStatus.DRAFT); setTimeout(handleSave, 0); }}
              disabled={saving}
            >
              <Save size={14} /> Save Draft
            </button>
            <button
              className="ped-save-btn publish"
              style={{ width: "auto", padding: "9px 20px" }}
              onClick={() => { setStatus(PostStatus.PUBLISHED); setTimeout(handleSave, 0); }}
              disabled={saving}
            >
              Publish
            </button>
          </div>
        </div>

        {error && <div className="ped-error" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="ped-layout">
          {/* Left pane */}
          <div className="ped-main">
            <div className="ped-card">
              <div className="ped-card-body">
                <div>
                  <div className="ped-label">Title</div>
                  <input
                    className="ped-input ped-input-title"
                    placeholder="Post title…"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <div className="ped-label">Excerpt <span style={{ color: "#be123c" }}>*</span></div>
                  <textarea
                    className="ped-input ped-textarea"
                    placeholder="A brief summary shown in cards and search results…"
                    value={excerpt}
                    maxLength={300}
                    onChange={(e) => setExcerpt(e.target.value)}
                    style={{ minHeight: 70 }}
                  />
                  <div className="ped-char-hint">{excerpt.length}/300</div>
                </div>
              </div>
            </div>

            <div className="ped-card">
              <div className="ped-card-body">
                <div>
                  <div className="ped-label">Content</div>
                  <MarkdownEditor value={content} onChange={setContent} minHeight={480} />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="ped-sidebar">
            <div className="ped-sidebar-card">
              <div className="ped-sidebar-header">Publish</div>
              <div className="ped-sidebar-body">
                <div>
                  <div className="ped-label">Status</div>
                  <select className="ped-select" value={status} onChange={(e) => setStatus(e.target.value as PostStatus)}>
                    <option value={PostStatus.DRAFT}>Draft</option>
                    <option value={PostStatus.PUBLISHED}>Published</option>
                  </select>
                </div>
                <button
                  className={`ped-save-btn ${status === PostStatus.PUBLISHED ? "publish" : ""}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : status === PostStatus.PUBLISHED ? "Publish Post" : "Save Draft"}
                </button>
              </div>
            </div>

            <div className="ped-sidebar-card">
              <div className="ped-sidebar-header">Category &amp; Tags</div>
              <div className="ped-sidebar-body">
                <div>
                  <div className="ped-label">Category</div>
                  <select className="ped-select" value={category} onChange={(e) => setCategory(e.target.value as PostCategory)}>
                    {Object.values(PostCategory).map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="ped-label">Tags <span style={{ color: "#a0998e", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated)</span></div>
                  <input
                    className="ped-input"
                    placeholder="e.g. democracy, elections, eswatini"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="ped-sidebar-card">
              <div className="ped-sidebar-header">Cover Image</div>
              <div className="ped-sidebar-body">
                <div>
                  <div className="ped-label">Image URL</div>
                  <input
                    className="ped-input"
                    placeholder="https://…"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                </div>
                <div className="ped-cover-preview">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover preview" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <span className="ped-cover-placeholder">🖼️</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
