"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, Calendar, User,
  Trash2, AlertCircle, Loader2,
} from "lucide-react";
import { getMessage, deleteMessage } from "@/lib/actions/messages";
import type { MessageRow } from "@/lib/actions/messages";

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [message, setMessage]       = useState<MessageRow | null>(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    getMessage(id)
      .then((m) => {
        if (!m) setNotFound(true);
        else setMessage(m);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMessage(id);
      router.push("/admin/messages");
    } catch {
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .md-page { font-family:'Sora',sans-serif; color:#1a1a1a; max-width:760px; -webkit-font-smoothing:antialiased; }
        .md-back { display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; color:#6b6b6b; text-decoration:none; margin-bottom:1.5rem; transition:color 0.15s; }
        .md-back:hover { color:#1a1a1a; }
        .md-card { background:#fff; border:1px solid #e5e3de; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.05); }
        .md-card-header { padding:22px 28px; border-bottom:1px solid #f0ede8; display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; }
        .md-subject { font-size:1.3rem; font-weight:800; letter-spacing:-0.03em; color:#1a1a1a; }
        .md-del-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:8px; border:1.5px solid rgba(190,18,60,0.25); background:rgba(190,18,60,0.07); color:#be123c; font-family:inherit; font-size:12.5px; font-weight:700; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
        .md-del-btn:hover { background:rgba(190,18,60,0.14); }
        .md-meta { padding:18px 28px; border-bottom:1px solid #f0ede8; display:flex; flex-direction:column; gap:10px; background:#faf9f7; }
        .md-meta-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#4a4a4a; }
        .md-meta-icon { color:#a0998e; flex-shrink:0; }
        .md-meta-label { font-weight:700; color:#a0998e; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; min-width:60px; }
        .md-body { padding:28px; }
        .md-body-label { font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#a0998e; margin-bottom:10px; }
        .md-body-text { font-size:14px; line-height:1.75; color:#2a2a2a; white-space:pre-wrap; word-break:break-word; }

        /* Loading / not found */
        .md-center { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 24px; gap:12px; text-align:center; }
        .md-center-text { font-size:14px; font-weight:600; color:#6b6b6b; }

        /* Confirm modal */
        .md-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:200; display:flex; align-items:center; justify-content:center; padding:24px; }
        .md-modal { background:#fff; border-radius:14px; padding:28px; max-width:400px; width:100%; box-shadow:0 16px 48px rgba(0,0,0,0.18); }
        .md-modal-title { font-size:16px; font-weight:800; margin-bottom:8px; }
        .md-modal-body { font-size:13.5px; color:#4a4a4a; line-height:1.6; margin-bottom:20px; }
        .md-modal-actions { display:flex; gap:10px; justify-content:flex-end; }
        .md-modal-cancel { padding:8px 16px; border-radius:7px; border:1.5px solid #e5e3de; background:#fff; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; color:#4a4a4a; }
        .md-modal-cancel:hover { border-color:#c0b8b0; }
        .md-modal-del { display:inline-flex; align-items:center; gap:5px; padding:8px 16px; border-radius:7px; border:none; background:#be123c; color:#fff; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; transition:opacity 0.15s; }
        .md-modal-del:hover { opacity:0.85; }
        .md-modal-del:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>

      <div className="md-page">
        <Link href="/admin/messages" className="md-back">
          <ArrowLeft size={14} /> Back to Messages
        </Link>

        {loading ? (
          <div className="md-center">
            <Loader2 size={28} style={{ opacity: 0.4 }} className="animate-spin" />
            <div className="md-center-text">Loading message…</div>
          </div>
        ) : notFound ? (
          <div className="md-center">
            <AlertCircle size={32} style={{ opacity: 0.4, color: "#be123c" }} />
            <div className="md-center-text">Message not found.</div>
            <Link href="/admin/messages" className="md-back" style={{ marginBottom: 0 }}>
              Return to inbox
            </Link>
          </div>
        ) : message ? (
          <div className="md-card">
            {/* Header */}
            <div className="md-card-header">
              <div className="md-subject">{message.subject}</div>
              <button className="md-del-btn" onClick={() => setShowConfirm(true)}>
                <Trash2 size={13} /> Delete
              </button>
            </div>

            {/* Meta */}
            <div className="md-meta">
              <div className="md-meta-row">
                <User size={14} className="md-meta-icon" />
                <span className="md-meta-label">From</span>
                <span style={{ fontWeight: 600 }}>{message.name}</span>
              </div>
              <div className="md-meta-row">
                <Mail size={14} className="md-meta-icon" />
                <span className="md-meta-label">Email</span>
                <a href={`mailto:${message.email}`} style={{ color: "#1a6640", fontWeight: 600 }}>
                  {message.email}
                </a>
              </div>
              {message.phone && (
                <div className="md-meta-row">
                  <Phone size={14} className="md-meta-icon" />
                  <span className="md-meta-label">Phone</span>
                  <span>{message.phone}</span>
                </div>
              )}
              <div className="md-meta-row">
                <Calendar size={14} className="md-meta-icon" />
                <span className="md-meta-label">Sent</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                  {formatDateTime(message.createdAt)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="md-body">
              <div className="md-body-label">Message</div>
              <div className="md-body-text">{message.message}</div>
            </div>
          </div>
        ) : null}

        {/* Delete confirmation modal */}
        {showConfirm && (
          <div className="md-overlay" onClick={() => !deleting && setShowConfirm(false)}>
            <div className="md-modal" onClick={(e) => e.stopPropagation()}>
              <div className="md-modal-title">Delete this message?</div>
              <div className="md-modal-body">
                This will permanently delete the message from <strong>{message?.name}</strong>. This cannot be undone.
              </div>
              <div className="md-modal-actions">
                <button className="md-modal-cancel" onClick={() => setShowConfirm(false)} disabled={deleting}>
                  Cancel
                </button>
                <button className="md-modal-del" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
