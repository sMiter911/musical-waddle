"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { createBranchUpdate } from "@/lib/actions/branch-updates";

interface Branch {
  id: number;
  name: string;
}

interface Structure {
  structure: string;
  branches: Branch[];
}

export default function NewBranchUpdatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [branchId, setBranchId] = useState<number | "">("");
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/structures")
      .then((r) => r.json())
      .then((data: { id: number; name: string; branches: { id: number; name: string }[] }[]) => {
        setStructures(
          data.map((s) => ({ structure: s.name, branches: s.branches }))
        );
      })
      .catch(() => setError("Failed to load branches."));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || branchId === "") {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createBranchUpdate({ title, content, branchId: Number(branchId) });
      router.push("/admin/branch-updates");
    } catch (err: any) {
      setError(err.message ?? "Failed to create update.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .nbupd-page { font-family: 'Sora', sans-serif; color: #1a1a1a; max-width: 680px; display: flex; flex-direction: column; gap: 1.5rem; -webkit-font-smoothing: antialiased; }
        .nbupd-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #6b6b6b; text-decoration: none; transition: color 0.15s; }
        .nbupd-back:hover { color: #1a1a1a; }
        .nbupd-title { font-size: clamp(1.35rem, 3vw, 1.7rem); font-weight: 800; letter-spacing: -0.04em; }
        .nbupd-sub { font-size: 13.5px; color: #6b6b6b; margin-top: 2px; }
        .nbupd-card { background: #fff; border: 1px solid #e5e3de; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .nbupd-field { display: flex; flex-direction: column; gap: 6px; }
        .nbupd-label { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #6b6b6b; }
        .nbupd-input, .nbupd-select, .nbupd-textarea { width: 100%; padding: 9px 12px; border: 1.5px solid #e5e3de; border-radius: 8px; font-family: inherit; font-size: 13.5px; outline: none; transition: border-color 0.2s; box-sizing: border-box; background: #fff; color: #1a1a1a; }
        .nbupd-input:focus, .nbupd-select:focus, .nbupd-textarea:focus { border-color: #1a6640; }
        .nbupd-textarea { min-height: 180px; resize: vertical; }
        .nbupd-error { font-size: 12.5px; color: #be123c; font-weight: 600; background: rgba(190,18,60,0.06); border: 1px solid rgba(190,18,60,0.15); border-radius: 8px; padding: 10px 14px; }
        .nbupd-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .nbupd-cancel { padding: 9px 18px; border: 1.5px solid #e5e3de; border-radius: 8px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; background: #fff; color: #4a4a4a; text-decoration: none; display: inline-flex; align-items: center; transition: all 0.15s; }
        .nbupd-cancel:hover { border-color: #c0b8b0; }
        .nbupd-submit { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: #1a6640; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 0.2s; }
        .nbupd-submit:hover { opacity: 0.85; }
        .nbupd-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="nbupd-page">
        <Link href="/admin/branch-updates" className="nbupd-back">
          <ArrowLeft size={14} /> Back to Branch Updates
        </Link>

        <div>
          <div className="nbupd-title">New Branch Update</div>
          <div className="nbupd-sub">Post an announcement to a specific branch.</div>
        </div>

        <form className="nbupd-card" onSubmit={handleSubmit}>
          <div className="nbupd-field">
            <label className="nbupd-label">Branch *</label>
            <select
              className="nbupd-select"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value === "" ? "" : Number(e.target.value))}
              required
            >
              <option value="">Select a branch…</option>
              {structures.map((s) =>
                s.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {s.structure} — {b.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="nbupd-field">
            <label className="nbupd-label">Title *</label>
            <input
              className="nbupd-input"
              placeholder="Update title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className="nbupd-field">
            <label className="nbupd-label">Content *</label>
            <textarea
              className="nbupd-textarea"
              placeholder="Write your branch update here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {error && <div className="nbupd-error">{error}</div>}

          <div className="nbupd-actions">
            <Link href="/admin/branch-updates" className="nbupd-cancel">Cancel</Link>
            <button type="submit" className="nbupd-submit" disabled={loading}>
              <Send size={13} />
              {loading ? "Publishing…" : "Publish Update"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
