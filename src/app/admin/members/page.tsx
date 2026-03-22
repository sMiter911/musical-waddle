"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Search, Download, UserPlus,
  Mail, MoreVertical, ChevronUp, ChevronDown,
  CheckCircle2, Clock, XCircle, Users, Eye, Trash2, RefreshCw,
} from "lucide-react";
import { getAllMembers, softDeleteMember, reactivateMember } from "@/lib/actions/admin";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  region: string;
  branch: string;
  status: "Active" | "Pending" | "Inactive" | "Deleted";
  joined: string;
  rawDate: Date;
  deletedAt: Date | null;
}

const STATUS_CONFIG = {
  Active:   { icon: CheckCircle2, color: "#1a6640", bg: "rgba(26,102,64,0.09)",  border: "rgba(26,102,64,0.2)"  },
  Pending:  { icon: Clock,        color: "#b45309", bg: "rgba(180,83,9,0.09)",   border: "rgba(180,83,9,0.2)"   },
  Inactive: { icon: XCircle,      color: "#6b6b6b", bg: "rgba(107,107,107,0.08)",border: "rgba(107,107,107,0.2)"},
  Deleted:  { icon: Trash2,       color: "#be123c", bg: "rgba(190,18,60,0.08)",  border: "rgba(190,18,60,0.2)"  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  ["#1a6640", "rgba(26,102,64,0.12)"],
  ["#1e40af", "rgba(30,64,175,0.1)"],
  ["#b45309", "rgba(180,83,9,0.1)"],
  ["#be123c", "rgba(190,18,60,0.1)"],
  ["#5b21b6", "rgba(91,33,182,0.1)"],
];
function avatarColor(id: string): [string, string] {
  const idx = parseInt(id.replace(/\D/g, "")) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] as [string, string];
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All Regions");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<keyof Member>("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await getAllMembers();
        setMembers(data);
      } catch (error) {
        console.error("Failed to load members:", error);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  // Get unique regions from members
  const regions = ["All Regions", ...Array.from(new Set(members.map(m => m.region)))];

  const toggleSort = (field: keyof Member) => {
    if (sortField === field) setSortAsc(a => !a);
    else { setSortField(field); setSortAsc(true); }
  };

  const filtered = members
    .filter(m => {
      const q = search.toLowerCase();
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
      const matchRegion = region === "All Regions" || m.region === region;
      const matchStatus = statusFilter === "All" || m.status === statusFilter;
      return matchSearch && matchRegion && matchStatus;
    })
    .sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const counts = {
    total: members.length,
    active: members.filter(m => m.status === "Active").length,
    pending: members.filter(m => m.status === "Pending").length,
    inactive: members.filter(m => m.status === "Inactive").length,
    deleted: members.filter(m => m.status === "Deleted").length,
  };

  async function handleSoftDelete(userId: string) {
    if (!confirm("Soft-delete this member? Their account will be suspended but can be reactivated.")) return;
    setActionLoading(userId);
    setOpenMenu(null);
    try {
      await softDeleteMember(userId);
      setMembers(prev => prev.map(m =>
        m.userId === userId ? { ...m, status: "Deleted" as const, deletedAt: new Date() } : m
      ));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReactivate(userId: string) {
    if (!confirm("Reactivate this member's account?")) return;
    setActionLoading(userId);
    setOpenMenu(null);
    try {
      await reactivateMember(userId);
      // Reload to get recalculated status
      const fresh = await getAllMembers();
      setMembers(fresh as Member[]);
    } finally {
      setActionLoading(null);
    }
  }

  const SortIcon = ({ field }: { field: keyof Member }) => (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 0, marginLeft: 4, opacity: sortField === field ? 1 : 0.3 }}>
      <ChevronUp size={10} style={{ color: sortField === field && sortAsc ? "#1a6640" : "#a0998e", display: "block" }} />
      <ChevronDown size={10} style={{ color: sortField === field && !sortAsc ? "#1a6640" : "#a0998e", display: "block", marginTop: -2 }} />
    </span>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .mem-page {
          font-family: 'Sora', sans-serif;
          color: #1a1a1a;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Page header ── */
        .mem-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
        }
        .mem-title {
          font-size: clamp(1.3rem, 3vw, 1.65rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #1a1a1a;
          margin-bottom: 3px;
        }
        .mem-sub { font-size: 13.5px; color: #6b6b6b; }
        .mem-header-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .mem-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          border: 1.5px solid #e0ddd8;
          background: #fff;
          color: #4a4a4a;
          text-decoration: none;
        }
        .mem-btn:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .mem-btn-primary {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
        }
        .mem-btn-primary:hover { background: #333; border-color: #333; color: #fff; }

        /* ── Stat strip ── */
        .mem-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }
        @media (max-width: 900px) { .mem-stats { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px) { .mem-stats { grid-template-columns: repeat(2, 1fr); } }

        .mem-stat {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,.03);
          animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }
        .mem-stat:nth-child(1) { animation-delay: 0.04s; }
        .mem-stat:nth-child(2) { animation-delay: 0.08s; }
        .mem-stat:nth-child(3) { animation-delay: 0.12s; }
        .mem-stat:nth-child(4) { animation-delay: 0.16s; }
        .mem-stat-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a0998e;
        }
        .mem-stat-val {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #1a1a1a;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1;
        }

        /* ── Table card ── */
        .mem-card {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04);
          animation: fadeUp 0.4s 0.2s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* ── Toolbar ── */
        .mem-toolbar {
          padding: 14px 18px;
          border-bottom: 1px solid #f0ede8;
          background: #faf9f7;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .mem-search-wrap {
          position: relative;
          flex: 1;
          min-width: 220px;
        }
        .mem-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0998e;
          pointer-events: none;
        }
        .mem-search {
          width: 100%;
          padding: 8px 12px 8px 36px;
          font-family: 'Sora', sans-serif;
          font-size: 13.5px;
          background: #fff;
          border: 1.5px solid #e0ddd8;
          border-radius: 8px;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .mem-search::placeholder { color: #b5b0a8; }
        .mem-search:focus { border-color: #1a1a1a; box-shadow: 0 0 0 3px rgba(26,26,26,0.07); }

        .mem-select {
          padding: 8px 32px 8px 12px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          background: #fff;
          border: 1.5px solid #e0ddd8;
          border-radius: 8px;
          color: #1a1a1a;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b6b6b'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 9px center;
          background-size: 15px;
          transition: border-color 0.15s;
        }
        .mem-select:focus { outline: none; border-color: #1a1a1a; }

        /* Status filter pills */
        .mem-status-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .mem-pill {
          padding: 5px 12px;
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 600;
          border: 1.5px solid #e0ddd8;
          background: #fff;
          color: #6b6b6b;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Sora', sans-serif;
        }
        .mem-pill:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .mem-pill.active { background: #1a1a1a; border-color: #1a1a1a; color: #fff; }
        .mem-pill.active-green { background: rgba(26,102,64,0.1); border-color: rgba(26,102,64,0.3); color: #1a6640; }
        .mem-pill.active-amber { background: rgba(180,83,9,0.1); border-color: rgba(180,83,9,0.3); color: #b45309; }
        .mem-pill.active-gray  { background: rgba(107,107,107,0.08); border-color: rgba(107,107,107,0.25); color: #4a4a4a; }
        .mem-pill.active-red   { background: rgba(190,18,60,0.08); border-color: rgba(190,18,60,0.25); color: #be123c; }

        /* ── Table ── */
        .mem-table-wrap { overflow-x: auto; }
        .mem-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .mem-th {
          padding: 11px 18px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #a0998e;
          border-bottom: 1px solid #f0ede8;
          white-space: nowrap;
          cursor: pointer;
          user-select: none;
          transition: color 0.12s;
          background: #faf9f7;
        }
        .mem-th:hover { color: #1a1a1a; }
        .mem-th-inner { display: inline-flex; align-items: center; }
        .mem-th-right { text-align: right; }

        .mem-tr {
          border-bottom: 1px solid #f7f6f3;
          transition: background 0.12s;
        }
        .mem-tr:last-child { border-bottom: none; }
        .mem-tr:hover { background: #faf9f7; }

        .mem-td { padding: 14px 18px; vertical-align: middle; }

        /* Member ID cell */
        .mem-id {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: #a0998e;
          letter-spacing: 0.04em;
          background: #f7f6f3;
          border: 1px solid #e5e3de;
          border-radius: 5px;
          padding: 3px 7px;
          display: inline-block;
        }

        /* Name + avatar cell */
        .mem-name-cell { display: flex; align-items: center; gap: 11px; }
        .mem-avatar {
          width: 34px; height: 34px;
          border-radius: 8px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11.5px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.03em;
        }
        .mem-name { font-size: 13.5px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
        .mem-email {
          font-size: 11.5px;
          color: #a0998e;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Region */
        .mem-region { font-size: 13px; color: #4a4a4a; }

        /* Date */
        .mem-date {
          font-size: 12px;
          color: #6b6b6b;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }

        /* Status badge */
        .mem-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          white-space: nowrap;
          border: 1px solid;
        }

        /* Actions */
        .mem-action-btn {
          width: 32px; height: 32px;
          border-radius: 7px;
          border: 1.5px solid transparent;
          background: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #a0998e;
          transition: all 0.15s;
          margin-left: auto;
          position: relative;
        }
        .mem-action-btn:hover { background: #f7f6f3; border-color: #e0ddd8; color: #1a1a1a; }
        .mem-action-btn.open { background: #f0ede8; border-color: #e0ddd8; color: #1a1a1a; }

        /* Dropdown menu */
        .mem-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 9px;
          box-shadow: 0 4px 20px rgba(0,0,0,.1);
          z-index: 50;
          min-width: 160px;
          overflow: hidden;
          animation: popIn 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to   { opacity: 1; transform: none; }
        }
        .mem-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #1a1a1a;
          cursor: pointer;
          transition: background 0.1s;
          border: none;
          background: none;
          width: 100%;
          font-family: 'Sora', sans-serif;
          text-align: left;
        }
        .mem-dropdown-item:hover { background: #faf9f7; }
        .mem-dropdown-item.danger { color: #c0392b; }
        .mem-dropdown-item.danger:hover { background: #fdf3f2; }
        .mem-dropdown-divider { height: 1px; background: #f0ede8; }

        /* Empty state */
        .mem-empty {
          padding: 56px 24px;
          text-align: center;
          color: #a0998e;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .mem-empty-icon {
          width: 48px; height: 48px;
          background: #f0ede8;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c5bfb8;
        }
        .mem-empty-title { font-size: 14px; font-weight: 700; color: #4a4a4a; }
        .mem-empty-sub { font-size: 12.5px; }

        /* Footer */
        .mem-table-footer {
          padding: 12px 18px;
          border-top: 1px solid #f0ede8;
          background: #faf9f7;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #a0998e;
          gap: 12px;
          flex-wrap: wrap;
        }
        .mem-table-footer strong { color: #1a1a1a; font-family: 'JetBrains Mono', monospace; }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      <div className="mem-page" onClick={() => { setOpenMenu(null); setMenuPos(null); }}>

        {/* ── Header ── */}
        <div className="mem-header">
          <div>
            <h1 className="mem-title">Member Directory</h1>
            <p className="mem-sub">View and manage the membership records of PUDEMO.</p>
          </div>
          <div className="mem-header-actions">
            <button className="mem-btn">
              <Download size={16} /> Export CSV
            </button>
            <button className="mem-btn mem-btn-primary">
              <UserPlus size={16} /> Add Member
            </button>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="mem-stats">
          {[
            { label: "Total Members", val: counts.total },
            { label: "Active", val: counts.active, accent: "#1a6640" },
            { label: "Pending Review", val: counts.pending, accent: "#b45309" },
            { label: "Inactive", val: counts.inactive, accent: "#6b6b6b" },
            { label: "Deleted", val: counts.deleted, accent: "#be123c" },
          ].map(({ label, val, accent }) => (
            <div key={label} className="mem-stat">
              <span className="mem-stat-label">{label}</span>
              <span className="mem-stat-val" style={accent ? { color: accent } : undefined}>{val}</span>
            </div>
          ))}
        </div>

        {/* ── Table card ── */}
        <div className="mem-card">

          {/* Toolbar */}
          <div className="mem-toolbar">
            <div className="mem-search-wrap">
              <Search size={16} className="mem-search-icon" />
              <input
                type="text"
                className="mem-search"
                placeholder="Search by name, ID or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="mem-select"
              value={region}
              onChange={e => setRegion(e.target.value)}
            >
              {regions.map(r => <option key={r}>{r}</option>)}
            </select>

            <div className="mem-status-pills">
              {(["All", "Active", "Pending", "Inactive", "Deleted"] as const).map(s => {
                const isActive = statusFilter === s;
                const cls =
                  !isActive ? "" :
                    s === "Active" ? "active-green" :
                      s === "Pending" ? "active-amber" :
                        s === "Inactive" ? "active-gray" :
                          s === "Deleted" ? "active-red" : "active";
                return (
                  <button
                    key={s}
                    className={`mem-pill ${cls}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="mem-table-wrap">
            {loading ? (
              <div className="mem-empty">
                <div className="mem-empty-icon"><Users size={22} /></div>
                <div className="mem-empty-title">Loading members...</div>
              </div>
            ) : (
              <table className="mem-table">
                <thead>
                  <tr>
                    {([
                      { key: "id", label: "Member ID" },
                      { key: "name", label: "Name" },
                      { key: "region", label: "Region" },
                      { key: "joined", label: "Joined" },
                      { key: "status", label: "Status" },
                    ] as { key: keyof Member; label: string }[]).map(col => (
                      <th
                        key={col.key}
                        className="mem-th"
                        onClick={() => toggleSort(col.key)}
                      >
                        <span className="mem-th-inner">
                          {col.label}
                          <SortIcon field={col.key} />
                        </span>
                      </th>
                    ))}
                    <th className="mem-th mem-th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="mem-empty">
                          <div className="mem-empty-icon"><Users size={22} /></div>
                          <div className="mem-empty-title">No members found</div>
                          <div className="mem-empty-sub">Try adjusting your search or filters</div>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((member) => {
                    const { icon: StatusIcon, color, bg, border } = STATUS_CONFIG[member.status];
                    const [avatarText, avatarBg] = avatarColor(member.id);
                    const isOpen = openMenu === member.id;

                    return (
                      <tr key={member.id} className="mem-tr">
                        {/* ID */}
                        <td className="mem-td">
                          <span className="mem-id">{member.id}</span>
                        </td>

                        {/* Name */}
                        <td className="mem-td">
                          <div className="mem-name-cell">
                            <div
                              className="mem-avatar"
                              style={{ background: avatarBg, color: avatarText }}
                            >
                              {getInitials(member.name)}
                            </div>
                            <div>
                              <div className="mem-name">{member.name}</div>
                              <div className="mem-email">
                                <Mail size={11} />
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Region */}
                        <td className="mem-td">
                          <span className="mem-region">{member.region}</span>
                        </td>

                        {/* Joined */}
                        <td className="mem-td">
                          <span className="mem-date">{member.joined}</span>
                        </td>

                        {/* Status */}
                        <td className="mem-td">
                          <span
                            className="mem-badge"
                            style={{ color, background: bg, borderColor: border }}
                          >
                            <StatusIcon size={11} />
                            {member.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="mem-td" onClick={e => e.stopPropagation()}>
                          <button
                            className={`mem-action-btn ${isOpen ? "open" : ""}`}
                            onClick={e => {
                              if (isOpen) {
                                setOpenMenu(null);
                                setMenuPos(null);
                              } else {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
                                setOpenMenu(member.id);
                              }
                            }}
                            aria-label="Member actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          {!loading && (
            <div className="mem-table-footer">
              <span>
                Showing <strong>{filtered.length}</strong> of <strong>{members.length}</strong> members
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                {counts.active} active · {counts.pending} pending · {counts.inactive} inactive · {counts.deleted} deleted
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Fixed dropdown — renders outside table so it's never clipped */}
      {openMenu && menuPos && (() => {
        const member = members.find(m => m.id === openMenu);
        if (!member) return null;
        return (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 49 }}
              onClick={() => { setOpenMenu(null); setMenuPos(null); }}
            />
            <div
              className="mem-dropdown"
              style={{ position: "fixed", top: menuPos.top, right: menuPos.right, zIndex: 50 }}
              onClick={e => e.stopPropagation()}
            >
              <Link href={`/admin/members/${member.userId}`} className="mem-dropdown-item">
                <Eye size={14} /> View Profile
              </Link>
              <button className="mem-dropdown-item">Edit Details</button>
              <button className="mem-dropdown-item">
                <Mail size={14} /> Send Email
              </button>
              <div className="mem-dropdown-divider" />
              {member.status === "Deleted" ? (
                <button
                  className="mem-dropdown-item"
                  disabled={actionLoading === member.userId}
                  style={{ color: "#1a6640" }}
                  onClick={() => handleReactivate(member.userId)}
                >
                  <RefreshCw size={14} />
                  {actionLoading === member.userId ? "Reactivating…" : "Reactivate"}
                </button>
              ) : (
                <button
                  className="mem-dropdown-item danger"
                  disabled={actionLoading === member.userId}
                  onClick={() => handleSoftDelete(member.userId)}
                >
                  <Trash2 size={14} />
                  {actionLoading === member.userId ? "Deleting…" : "Soft Delete"}
                </button>
              )}
            </div>
          </>
        );
      })()}
    </>
  );
}