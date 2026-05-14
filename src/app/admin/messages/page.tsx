"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Inbox, Search, Mail, MailOpen, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getMessages, deleteMessage } from "@/lib/actions/messages";
import type { MessageRow } from "@/lib/actions/messages";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const PAGE_SIZE = 20;

export default function AdminMessagesPage() {
  const [messages, setMessages]     = useState<MessageRow[]>([]);
  const [total, setTotal]           = useState(0);
  const [unreadCount, setUnread]    = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage]             = useState(1);
  const [deleting, setDeleting]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMessages({ search, unreadOnly, page, pageSize: PAGE_SIZE });
      setMessages(data.messages);
      setTotal(data.total);
      setUnread(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [search, unreadOnly, page]);

  useEffect(() => { load(); }, [load]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, unreadOnly]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete message from "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setTotal((t) => t - 1);
    } finally {
      setDeleting(null);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .msg-page { font-family:'Sora',sans-serif; color:#1a1a1a; display:flex; flex-direction:column; gap:1.75rem; -webkit-font-smoothing:antialiased; }
        .msg-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; }
        .msg-title { font-size:clamp(1.35rem,3vw,1.7rem); font-weight:800; letter-spacing:-0.04em; }
        .msg-sub { font-size:13.5px; color:#6b6b6b; margin-top:2px; }
        .msg-badge { display:inline-flex; align-items:center; justify-content:center; padding:2px 9px; border-radius:999px; font-size:11px; font-weight:700; background:#be123c; color:#fff; margin-left:8px; vertical-align:middle; }

        /* Toolbar */
        .msg-toolbar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .msg-search-wrap { display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #e5e3de; border-radius:8px; padding:0 12px; flex:1; min-width:200px; max-width:360px; }
        .msg-search-wrap:focus-within { border-color:#1a6640; }
        .msg-search { border:none; outline:none; font-family:inherit; font-size:13px; background:transparent; padding:9px 0; flex:1; color:#1a1a1a; }
        .msg-filter-btn { padding:8px 14px; border-radius:7px; font-family:inherit; font-size:12.5px; font-weight:600; cursor:pointer; border:1.5px solid #e5e3de; background:#fff; color:#4a4a4a; transition:all 0.15s; white-space:nowrap; }
        .msg-filter-btn.active { background:#1a6640; color:#fff; border-color:#1a6640; }
        .msg-filter-btn:hover:not(.active) { border-color:#c0b8b0; }

        /* Stats */
        .msg-stats { display:flex; gap:12px; flex-wrap:wrap; }
        .msg-stat { background:#fff; border:1px solid #e5e3de; border-radius:10px; padding:12px 18px; min-width:90px; box-shadow:0 1px 3px rgba(0,0,0,.03); }
        .msg-stat-label { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#a0998e; }
        .msg-stat-val { font-size:1.55rem; font-weight:800; letter-spacing:-0.04em; font-family:'JetBrains Mono',monospace; margin-top:2px; }

        /* Table */
        .msg-table-wrap { background:#fff; border:1px solid #e5e3de; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.04); }
        .msg-table { width:100%; border-collapse:collapse; font-size:13px; }
        .msg-table th { padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#a0998e; background:#faf9f7; border-bottom:1px solid #e5e3de; white-space:nowrap; }
        .msg-table td { padding:14px 14px; border-bottom:1px solid #f0ede8; vertical-align:middle; }
        .msg-table tr:last-child td { border-bottom:none; }
        .msg-table tr.unread td { background:#fffbf5; }
        .msg-table tr:hover td { background:#faf9f7; }
        .msg-table tr.unread:hover td { background:#fef3c7; }
        .msg-name { font-weight:700; color:#1a1a1a; display:flex; align-items:center; gap:6px; }
        .msg-email { font-size:11.5px; color:#6b6b6b; margin-top:1px; }
        .msg-subject { font-size:13px; color:#1a1a1a; font-weight:500; max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .msg-date { font-size:11.5px; color:#6b6b6b; white-space:nowrap; }
        .msg-time { font-size:10.5px; color:#a0998e; margin-top:1px; font-family:'JetBrains Mono',monospace; }
        .msg-unread-dot { width:8px; height:8px; border-radius:50%; background:#be123c; flex-shrink:0; }
        .msg-status-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:5px; font-size:10.5px; font-weight:700; }
        .msg-status-unread { background:rgba(190,18,60,0.1); color:#be123c; }
        .msg-status-read { background:#f0ede8; color:#a0998e; }
        .msg-actions { display:flex; gap:6px; align-items:center; }
        .msg-view-btn { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:6px; font-size:11.5px; font-weight:600; text-decoration:none; color:#1a6640; border:1.5px solid rgba(26,102,64,0.25); background:rgba(26,102,64,0.06); transition:all 0.15s; white-space:nowrap; }
        .msg-view-btn:hover { background:rgba(26,102,64,0.12); }
        .msg-del-btn { display:inline-flex; align-items:center; padding:5px 8px; border-radius:6px; font-size:11.5px; font-weight:600; font-family:inherit; cursor:pointer; border:1.5px solid rgba(190,18,60,0.2); background:rgba(190,18,60,0.06); color:#be123c; transition:all 0.15s; }
        .msg-del-btn:hover { background:rgba(190,18,60,0.14); }
        .msg-del-btn:disabled { opacity:0.45; cursor:not-allowed; }

        /* Empty / loading */
        .msg-empty { padding:48px 24px; text-align:center; color:#a0998e; }
        .msg-empty-text { font-size:13px; font-weight:600; margin-top:8px; }
        .msg-loading { padding:48px 24px; text-align:center; color:#a0998e; font-size:13px; }

        /* Pagination */
        .msg-pagination { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
        .msg-pagination-info { font-size:12px; color:#6b6b6b; }
        .msg-pagination-btns { display:flex; gap:6px; }
        .msg-pg-btn { display:inline-flex; align-items:center; gap:4px; padding:6px 12px; border-radius:7px; border:1.5px solid #e5e3de; background:#fff; font-family:inherit; font-size:12.5px; font-weight:600; color:#4a4a4a; cursor:pointer; transition:all 0.15s; }
        .msg-pg-btn:hover:not(:disabled) { border-color:#1a6640; color:#1a6640; }
        .msg-pg-btn:disabled { opacity:0.4; cursor:not-allowed; }
      `}</style>

      <div className="msg-page">
        {/* Header */}
        <div className="msg-header">
          <div>
            <div className="msg-title">
              Messages
              {unreadCount > 0 && <span className="msg-badge">{unreadCount}</span>}
            </div>
            <div className="msg-sub">Public contact form submissions.</div>
          </div>
        </div>

        {/* Stats */}
        <div className="msg-stats">
          <div className="msg-stat">
            <div className="msg-stat-label">Total</div>
            <div className="msg-stat-val">{total}</div>
          </div>
          <div className="msg-stat">
            <div className="msg-stat-label">Unread</div>
            <div className="msg-stat-val" style={{ color: unreadCount > 0 ? "#be123c" : undefined }}>{unreadCount}</div>
          </div>
          <div className="msg-stat">
            <div className="msg-stat-label">Read</div>
            <div className="msg-stat-val">{total - unreadCount}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="msg-toolbar">
          <div className="msg-search-wrap">
            <Search size={14} style={{ color: "#a0998e", flexShrink: 0 }} />
            <input
              className="msg-search"
              placeholder="Search name, email, subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className={`msg-filter-btn ${unreadOnly ? "active" : ""}`}
            onClick={() => setUnreadOnly((v) => !v)}
          >
            {unreadOnly ? "Showing unread" : "All messages"}
          </button>
        </div>

        {/* Table */}
        <div className="msg-table-wrap">
          {loading ? (
            <div className="msg-loading">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="msg-empty">
              <Inbox size={36} strokeWidth={1.5} style={{ opacity: 0.3, margin: "0 auto" }} />
              <div className="msg-empty-text">
                {search || unreadOnly ? "No messages match your filters." : "No messages yet."}
              </div>
            </div>
          ) : (
            <table className="msg-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} className={m.isRead ? "" : "unread"}>
                    <td>
                      <div className="msg-name">
                        {!m.isRead && <span className="msg-unread-dot" />}
                        {m.name}
                      </div>
                      <div className="msg-email">{m.email}</div>
                    </td>
                    <td>
                      <div className="msg-subject">{m.subject}</div>
                    </td>
                    <td>
                      <span className={`msg-status-badge ${m.isRead ? "msg-status-read" : "msg-status-unread"}`}>
                        {m.isRead ? <MailOpen size={11} /> : <Mail size={11} />}
                        {m.isRead ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td>
                      <div className="msg-date">{formatDate(m.createdAt)}</div>
                      <div className="msg-time">{formatTime(m.createdAt)}</div>
                    </td>
                    <td>
                      <div className="msg-actions">
                        <Link href={`/admin/messages/${m.id}`} className="msg-view-btn">
                          View
                        </Link>
                        <button
                          className="msg-del-btn"
                          disabled={deleting === m.id}
                          onClick={() => handleDelete(m.id, m.name)}
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="msg-pagination">
            <span className="msg-pagination-info">
              Page {page} of {totalPages} &middot; {total} message{total !== 1 ? "s" : ""}
            </span>
            <div className="msg-pagination-btns">
              <button
                className="msg-pg-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <button
                className="msg-pg-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
