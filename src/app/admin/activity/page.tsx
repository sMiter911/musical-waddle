"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";
import {
  getActivityPage,
  getAllUsersForFilter,
} from "@/lib/actions/activity";
import type { ActivityItemFull, ActivityFilter, ActivityPageResult } from "@/lib/actions/activity";

const TYPE_OPTIONS = ["all", "member", "profile", "donation", "post", "branch", "resource"] as const;

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  member:   { bg: "rgba(26,102,64,0.1)",  color: "#1a6640" },
  profile:  { bg: "rgba(30,64,175,0.1)",  color: "#1e40af" },
  donation: { bg: "rgba(190,18,60,0.1)",  color: "#be123c" },
  post:     { bg: "rgba(180,83,9,0.1)",   color: "#b45309" },
  branch:   { bg: "rgba(124,58,237,0.1)", color: "#7c3aed" },
  resource: { bg: "rgba(6,95,70,0.1)",    color: "#065f46" },
};

function formatFullDate(d: Date) {
  return new Date(d).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function MetadataDisplay({ meta }: { meta: Record<string, unknown> | null }) {
  if (!meta || Object.keys(meta).length === 0) return <span style={{ color: "#c0b8b0" }}>—</span>;
  const entries = Object.entries(meta).slice(0, 3);
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#6b6b6b" }}>
      {entries.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(" · ")}
    </span>
  );
}

export default function AdminActivityPage() {
  const [result, setResult] = useState<ActivityPageResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);

  const [filterUserId, setFilterUserId] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAllUsersForFilter().then(setUsers).catch(() => {});
  }, []);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const filter: ActivityFilter = {
        page: p,
        pageSize: 25,
        userId: filterUserId || undefined,
        type: filterType,
        dateFrom: filterFrom || undefined,
        dateTo: filterTo || undefined,
      };
      const data = await getActivityPage(filter);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, [filterUserId, filterType, filterFrom, filterTo]);

  // Reload when filters change (reset to page 1)
  useEffect(() => {
    setPage(1);
  }, [filterUserId, filterType, filterFrom, filterTo]);

  useEffect(() => {
    load(page);
  }, [page, load]);

  function handleTypeClick(t: string) {
    setFilterType(t);
  }

  const items = result?.items ?? [];
  const totalPages = result?.totalPages ?? 1;
  const total = result?.total ?? 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .audit-page { font-family: 'Sora', sans-serif; color: #1a1a1a; display: flex; flex-direction: column; gap: 1.75rem; -webkit-font-smoothing: antialiased; }
        .audit-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .audit-title { font-size: clamp(1.35rem, 3vw, 1.7rem); font-weight: 800; letter-spacing: -0.04em; }
        .audit-sub { font-size: 13.5px; color: #6b6b6b; margin-top: 2px; }
        .audit-total { font-size: 12px; color: #a0998e; font-weight: 600; align-self: center; }

        /* Toolbar */
        .audit-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .audit-select { padding: 7px 10px; border: 1.5px solid #e5e3de; border-radius: 8px; font-family: inherit; font-size: 12.5px; font-weight: 500; outline: none; background: #fff; cursor: pointer; color: #1a1a1a; max-width: 220px; }
        .audit-select:focus { border-color: #1a6640; }
        .audit-date { padding: 7px 10px; border: 1.5px solid #e5e3de; border-radius: 8px; font-family: inherit; font-size: 12.5px; outline: none; background: #fff; color: #1a1a1a; }
        .audit-date:focus { border-color: #1a6640; }
        .audit-date-label { font-size: 11.5px; color: #6b6b6b; font-weight: 600; }
        .audit-pills { display: flex; gap: 4px; flex-wrap: wrap; }
        .audit-pill { padding: 5px 11px; border-radius: 6px; border: 1.5px solid #e5e3de; background: #fff; font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: inherit; color: #4a4a4a; transition: all 0.15s; text-transform: capitalize; }
        .audit-pill.active { border-color: #1a6640; color: #1a6640; background: rgba(26,102,64,0.06); }
        .audit-pill:hover { border-color: #1a6640; color: #1a6640; }

        /* Table */
        .audit-table-wrap { background: #fff; border: 1px solid #e5e3de; border-radius: 12px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .audit-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .audit-table th { padding: 11px 14px; text-align: left; font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #a0998e; background: #faf9f7; border-bottom: 1px solid #e5e3de; white-space: nowrap; }
        .audit-table td { padding: 13px 14px; border-bottom: 1px solid #f0ede8; vertical-align: middle; }
        .audit-table tr:last-child td { border-bottom: none; }
        .audit-table tr:hover td { background: #faf9f7; }
        .audit-user-name { font-weight: 600; color: #1a1a1a; font-size: 13px; }
        .audit-user-email { font-size: 11px; color: #a0998e; }
        .audit-action-text { color: #2d2d2d; max-width: 300px; }
        .audit-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 5px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em; text-transform: capitalize; white-space: nowrap; }
        .audit-time { font-size: 12px; color: #6b6b6b; white-space: nowrap; }
        .audit-time-ago { font-size: 10.5px; color: #a0998e; margin-top: 1px; }

        /* Pagination */
        .audit-pagination { display: flex; align-items: center; gap: 10px; justify-content: flex-end; }
        .audit-page-info { font-size: 13px; color: #6b6b6b; }
        .audit-page-btn { display: inline-flex; align-items: center; gap: 4px; padding: 7px 12px; border: 1.5px solid #e5e3de; border-radius: 7px; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; background: #fff; color: #1a1a1a; transition: all 0.15s; }
        .audit-page-btn:hover:not(:disabled) { border-color: #1a6640; color: #1a6640; }
        .audit-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* States */
        .audit-empty { padding: 48px 24px; text-align: center; color: #a0998e; }
        .audit-empty-text { font-size: 13px; font-weight: 600; margin-top: 8px; }
        .audit-loading { padding: 48px 24px; text-align: center; color: #a0998e; font-size: 13px; }
      `}</style>

      <div className="audit-page">
        <div className="audit-header">
          <div>
            <div className="audit-title">Activity Log</div>
            <div className="audit-sub">Full audit trail of all system events.</div>
          </div>
          {!loading && result && (
            <span className="audit-total">{total.toLocaleString()} total event{total !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="audit-toolbar">
            <select
              className="audit-select"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
            >
              <option value="">All users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            <span className="audit-date-label">From</span>
            <input
              className="audit-date"
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
            <span className="audit-date-label">To</span>
            <input
              className="audit-date"
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>

          <div className="audit-pills">
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t}
                className={`audit-pill${filterType === t ? " active" : ""}`}
                onClick={() => handleTypeClick(t)}
              >
                {t === "all" ? "All types" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="audit-table-wrap">
          {loading ? (
            <div className="audit-loading">Loading activity…</div>
          ) : items.length === 0 ? (
            <div className="audit-empty">
              <Activity size={32} strokeWidth={1.5} style={{ opacity: 0.3 }} />
              <div className="audit-empty-text">No activity matches these filters.</div>
            </div>
          ) : (
            <table className="audit-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Type</th>
                  <th>Metadata</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const tc = TYPE_COLORS[item.type] ?? { bg: "#f0ede8", color: "#6b6b6b" };
                  return (
                    <tr key={item.id}>
                      <td>
                        {item.user ? (
                          <>
                            <div className="audit-user-name">{item.user}</div>
                            {item.userEmail && (
                              <div className="audit-user-email">{item.userEmail}</div>
                            )}
                          </>
                        ) : (
                          <span style={{ color: "#a0998e", fontSize: 12, fontStyle: "italic" }}>
                            Deleted user
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="audit-action-text">{item.action}</span>
                      </td>
                      <td>
                        <span
                          className="audit-badge"
                          style={{ background: tc.bg, color: tc.color }}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td>
                        <MetadataDisplay meta={item.metadata} />
                      </td>
                      <td>
                        <div className="audit-time">{formatFullDate(item.createdAt)}</div>
                        <div className="audit-time-ago">{item.timeAgo}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && result && totalPages > 1 && (
          <div className="audit-pagination">
            <button
              className="audit-page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="audit-page-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="audit-page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
