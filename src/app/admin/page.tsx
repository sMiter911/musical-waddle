"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, FileText, Heart, Megaphone,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  TrendingUp,
} from "lucide-react";
import { getMemberStats, getMembershipGrowth } from "@/lib/actions/admin";
import { getPostStats } from "@/lib/actions/posts";
import type { ActivityItem } from "@/lib/actions/activity";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Stat {
  label: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  accent: string;        // CSS color for icon bg tint
  accentDark: string;    // CSS color for icon itself
}

const activityDot: Record<ActivityItem["type"], string> = {
  member:   "#1a6640",
  profile:  "#1e40af",
  donation: "#be123c",
  post:     "#b45309",
  branch:   "#7c3aed",
  resource: "#065f46",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalDonations: 0,
    totalVolunteers: 0,
    activeMembers: 0,
    pendingMembers: 0,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishedPosts, setPublishedPosts] = useState(0);
  const [growth, setGrowth] = useState<{
    labels: string[];
    counts: number[];
    maxCount: number;
    growthPct: number;
  } | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsData, growthData, postStatsData] = await Promise.all([
          getMemberStats(),
          getMembershipGrowth(),
          getPostStats(),
        ]);
        setStats(statsData);
        setGrowth(growthData);
        setPublishedPosts(postStatsData.publishedPosts);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    async function loadActivity() {
      try {
        const { getRecentActivity } = await import("@/lib/actions/activity");
        const data = await getRecentActivity(4);
        setActivity(data);
      } catch (error) {
        console.error("Failed to load activity:", error);
      }
    }
    loadActivity();
  }, []);

  const statCards: Stat[] = [
    { label: "Total Members",    value: loading ? "..." : stats.totalMembers.toString(), icon: Users,     trend: "+12%", accent: "rgba(26,102,64,0.08)",  accentDark: "#1a6640"  },
    { label: "Blog Posts",       value: loading ? "..." : publishedPosts.toString(), icon: FileText, trend: "+0", accent: "rgba(30,64,175,0.08)", accentDark: "#1e40af" },
    { label: "Donations",  value: loading ? "..." : stats.totalDonations.toString(),icon: Heart,     trend: "+8.4%",accent: "rgba(190,18,60,0.08)",  accentDark: "#be123c"  },
    { label: "New Volunteers",   value: loading ? "..." : stats.totalVolunteers.toString(),    icon: Megaphone, trend: "-5%",  accent: "rgba(180,83,9,0.08)",   accentDark: "#b45309"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .adm-page {
          font-family: 'Sora', sans-serif;
          color: #1a1a1a;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Page header ── */
        .adm-page-header { display: flex; flex-direction: column; gap: 4px; }
        .adm-page-title {
          font-size: clamp(1.35rem, 3vw, 1.7rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #1a1a1a;
          line-height: 1.2;
        }
        .adm-page-sub { font-size: 13.5px; color: #6b6b6b; }
        .adm-page-sub strong { color: #1a6640; font-weight: 700; }

        /* ── Stat cards grid ── */
        .adm-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) { .adm-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px)  { .adm-stats-grid { grid-template-columns: 1fr; } }

        .adm-stat-card {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          padding: 20px 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,.04);
          transition: box-shadow 0.2s, transform 0.2s;
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        .adm-stat-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,.08);
          transform: translateY(-2px);
        }
        .adm-stat-card:nth-child(1) { animation-delay: 0.05s; }
        .adm-stat-card:nth-child(2) { animation-delay: 0.1s;  }
        .adm-stat-card:nth-child(3) { animation-delay: 0.15s; }
        .adm-stat-card:nth-child(4) { animation-delay: 0.2s;  }

        .adm-stat-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .adm-stat-icon {
          width: 42px; height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .adm-stat-trend {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .adm-stat-trend.up   { color: #1a6640; background: rgba(26,102,64,0.08); }
        .adm-stat-trend.down { color: #be123c; background: rgba(190,18,60,0.08); }

        .adm-stat-bottom { display: flex; flex-direction: column; gap: 3px; }
        .adm-stat-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a0998e;
        }
        .adm-stat-value {
          font-size: clamp(1.5rem, 3vw, 1.9rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #1a1a1a;
          line-height: 1;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── Bottom grid ── */
        .adm-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 900px) { .adm-bottom-grid { grid-template-columns: 1fr; } }

        /* ── Chart card ── */
        .adm-chart-card {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.04);
          animation: fadeUp 0.4s 0.25s cubic-bezier(0.16,1,0.3,1) both;
        }
        .adm-chart-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f0ede8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .adm-chart-title {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .adm-chart-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #1a6640;
          font-weight: 600;
        }
        .adm-chart-body { padding: 28px 24px 24px; }
        .adm-chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          height: 180px;
        }
        .adm-chart-bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
          justify-content: flex-end;
        }
        .adm-chart-bar {
          width: 100%;
          border-radius: 4px 4px 0 0;
          background: linear-gradient(to top, #1a6640, #2ecc71);
          transition: opacity 0.15s;
          min-height: 4px;
        }
        .adm-chart-bar:hover { opacity: 0.75; }
        .adm-chart-bar-label {
          font-size: 9.5px;
          color: #a0998e;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .adm-chart-x {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          padding: 0 2px;
        }
        .adm-chart-legend {
          display: flex;
          gap: 16px;
          padding: 14px 24px;
          border-top: 1px solid #f0ede8;
        }
        .adm-chart-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #6b6b6b;
          font-weight: 500;
        }
        .adm-chart-legend-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
        }

        /* ── Activity card ── */
        .adm-activity-card {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.04);
          animation: fadeUp 0.4s 0.3s cubic-bezier(0.16,1,0.3,1) both;
        }
        .adm-activity-header {
          padding: 18px 20px 14px;
          border-bottom: 1px solid #f0ede8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .adm-activity-title { font-size: 13.5px; font-weight: 700; }
        .adm-activity-count {
          font-size: 11px;
          color: #a0998e;
          font-family: 'JetBrains Mono', monospace;
          background: #f7f6f3;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .adm-activity-list { padding: 8px 0; }
        .adm-activity-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 20px;
          transition: background 0.12s;
        }
        .adm-activity-item:hover { background: #faf9f7; }
        .adm-activity-dot-wrap {
          padding-top: 5px;
          flex-shrink: 0;
        }
        .adm-activity-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
        }
        .adm-activity-user {
          font-size: 13px;
          color: #1a1a1a;
          font-weight: 700;
        }
        .adm-activity-action {
          font-size: 13px;
          color: #4a4a4a;
          font-weight: 400;
        }
        .adm-activity-time {
          font-size: 11px;
          color: #a0998e;
          margin-top: 2px;
          font-family: 'JetBrains Mono', monospace;
        }
        .adm-activity-footer {
          padding: 12px 20px;
          border-top: 1px solid #f0ede8;
        }
        .adm-activity-more {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12.5px;
          font-weight: 700;
          color: #1a6640;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: 'Sora', sans-serif;
          transition: opacity 0.15s;
        }
        .adm-activity-more:hover { opacity: 0.7; }

        /* ── Summary row ── */
        .adm-summary-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          animation: fadeUp 0.4s 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }
        @media (max-width: 640px) { .adm-summary-row { grid-template-columns: 1fr; } }

        .adm-summary-item {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-decoration: none;
          color: #1a1a1a;
          transition: all 0.15s;
          box-shadow: 0 1px 3px rgba(0,0,0,.03);
        }
        .adm-summary-item:hover {
          border-color: #1a6640;
          box-shadow: 0 2px 12px rgba(26,102,64,0.1);
        }
        .adm-summary-item-label {
          font-size: 12px;
          color: #6b6b6b;
          font-weight: 500;
        }
        .adm-summary-item-val {
          font-size: 15px;
          font-weight: 800;
          color: #1a1a1a;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: -0.02em;
        }
        .adm-summary-item-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: rgba(26,102,64,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Section label ── */
        .adm-section-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a0998e;
          margin-bottom: 10px;
        }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      <div className="adm-page">

        {/* ── Page header ── */}
        <div className="adm-page-header">
          <h1 className="adm-page-title">Dashboard Overview</h1>
          <p className="adm-page-sub">
            Welcome back. Here's what's happening with <strong>PUDEMO</strong> today.
          </p>
        </div>

        {/* ── Quick summary strip ── */}
        <div>
          <div className="adm-section-label">At a Glance</div>
          <div className="adm-summary-row">
            {[
              { label: "Active This Week", val: loading ? "..." : stats.activeMembers.toString(), href: "/admin/members" },
              { label: "Pending Approvals", val: loading ? "..." : stats.pendingMembers.toString(),  href: "/admin/members" },
              { label: "Unread Messages",  val: "0",  href: "/admin" },
            ].map(({ label, val, href }) => (
              <a key={label} href={href} className="adm-summary-item">
                <div>
                  <div className="adm-summary-item-label">{label}</div>
                  <div className="adm-summary-item-val">{val}</div>
                </div>
                <div className="adm-summary-item-icon">
                  <ChevronRight size={14} color="#1a6640" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div>
          <div className="adm-section-label">Key Metrics</div>
          <div className="adm-stats-grid">
            {statCards.map((stat) => {
              const isUp = stat.trend.startsWith("+");
              return (
                <div key={stat.label} className="adm-stat-card">
                  <div className="adm-stat-top">
                    <div
                      className="adm-stat-icon"
                      style={{ background: stat.accent }}
                    >
                      <stat.icon size={20} color={stat.accentDark} />
                    </div>
                    <div className={`adm-stat-trend ${isUp ? "up" : "down"}`}>
                      {isUp
                        ? <ArrowUpRight size={13} />
                        : <ArrowDownRight size={13} />
                      }
                      {stat.trend}
                    </div>
                  </div>
                  <div className="adm-stat-bottom">
                    <div className="adm-stat-label">{stat.label}</div>
                    <div className="adm-stat-value">{stat.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Chart + Activity ── */}
        <div className="adm-bottom-grid">

          {/* Membership growth chart */}
          <div className="adm-chart-card">
            <div className="adm-chart-header">
              <span className="adm-chart-title">Membership Growth</span>
              <div className="adm-chart-meta">
                <TrendingUp size={14} />
                {loading || !growth
                  ? "Loading..."
                  : `${growth.growthPct >= 0 ? "+" : ""}${growth.growthPct}% this year`}
              </div>
            </div>
            <div className="adm-chart-body">
              <div className="adm-chart-bars">
                {(growth?.counts ?? Array(12).fill(0)).map((count, i) => {
                  const heightPct = growth
                    ? Math.round((count / growth.maxCount) * 100)
                    : 0;
                  const label = growth?.labels[i] ?? "";
                  return (
                    <div key={i} className="adm-chart-bar-wrap">
                      <div
                        className="adm-chart-bar"
                        style={{ height: `${heightPct}%` }}
                        title={`${label}: ${count} new member${count !== 1 ? "s" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="adm-chart-x">
                {(growth?.labels ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]).map(m => (
                  <span key={m} style={{ fontSize: "9.5px", color: "#a0998e", fontFamily: "'JetBrains Mono', monospace" }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div className="adm-chart-legend">
              <div className="adm-chart-legend-item">
                <div className="adm-chart-legend-dot" style={{ background: "#1a6640" }} />
                New members
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="adm-activity-card">
            <div className="adm-activity-header">
              <span className="adm-activity-title">Recent Activity</span>
              <span className="adm-activity-count">{activity.length} events</span>
            </div>
            <div className="adm-activity-list">
              {activity.length === 0 ? (
                <div style={{ padding: "32px 20px", textAlign: "center", color: "#a0998e" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>No recent activity</div>
                  <div style={{ fontSize: "12px" }}>Activity will appear here as members interact with the platform</div>
                </div>
              ) : (
                activity.map((act, i) => (
                  <div key={i} className="adm-activity-item">
                    <div className="adm-activity-dot-wrap">
                      <div
                        className="adm-activity-dot"
                        style={{ background: activityDot[act.type] }}
                      />
                    </div>
                    <div>
                      <div>
                        <span className="adm-activity-user">{act.user}</span>
                        {" "}
                        <span className="adm-activity-action">{act.action}</span>
                      </div>
                      <div className="adm-activity-time">{act.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="adm-activity-footer">
              <Link href="/admin/activity" className="adm-activity-more">
                View all activity <ChevronRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}