"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import { getUpdatesForMember } from "@/lib/actions/branch-updates";
import type { MemberBranchUpdate } from "@/lib/actions/branch-updates";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function timeAgo(d: Date) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(d);
}

export default function BranchUpdatesPage() {
  const [updates, setUpdates] = useState<MemberBranchUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [noBranch, setNoBranch] = useState(false);

  useEffect(() => {
    getUpdatesForMember()
      .then((data) => {
        setUpdates(data);
        if (data.length === 0) {
          // Could still be no branch — we handle empty gracefully
        }
      })
      .catch((err) => {
        if (err?.message === "NO_BRANCH") setNoBranch(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        .bupd-m-page { font-family: 'Sora', sans-serif; color: #1a1a1a; max-width: 760px; margin: 0 auto; padding: 32px 20px; display: flex; flex-direction: column; gap: 2rem; -webkit-font-smoothing: antialiased; }
        .bupd-m-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #6b6b6b; text-decoration: none; transition: color 0.15s; }
        .bupd-m-back:hover { color: #1a1a1a; }
        .bupd-m-hero { display: flex; align-items: flex-start; gap: 14px; }
        .bupd-m-hero-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(26,102,64,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .bupd-m-title { font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; letter-spacing: -0.04em; }
        .bupd-m-sub { font-size: 13.5px; color: #6b6b6b; margin-top: 3px; }
        .bupd-m-list { display: flex; flex-direction: column; gap: 1px; }
        .bupd-m-card { background: #fff; border: 1px solid #e5e3de; border-radius: 12px; padding: 22px 24px; display: flex; flex-direction: column; gap: 10px; transition: box-shadow 0.15s; }
        .bupd-m-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
        .bupd-m-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
        .bupd-m-card-title { font-size: 16px; font-weight: 700; color: #1a1a1a; }
        .bupd-m-card-branch { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; background: rgba(26,102,64,0.1); color: #1a6640; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
        .bupd-m-card-content { font-size: 14px; color: #3a3a3a; line-height: 1.65; white-space: pre-wrap; }
        .bupd-m-card-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #a0998e; flex-wrap: wrap; }
        .bupd-m-card-sep { width: 3px; height: 3px; border-radius: 50%; background: #c0b8b0; }
        .bupd-m-empty { padding: 56px 24px; text-align: center; background: #fff; border: 1px solid #e5e3de; border-radius: 12px; }
        .bupd-m-empty-icon { font-size: 2.5rem; margin-bottom: 10px; opacity: 0.3; }
        .bupd-m-empty-title { font-size: 15px; font-weight: 700; color: #3a3a3a; margin-bottom: 4px; }
        .bupd-m-empty-sub { font-size: 13px; color: #a0998e; }
        .bupd-m-loading { padding: 48px; text-align: center; color: #a0998e; font-size: 14px; }
        .bupd-m-no-branch { padding: 40px 24px; text-align: center; background: rgba(180,83,9,0.05); border: 1.5px solid rgba(180,83,9,0.2); border-radius: 12px; }
        .bupd-m-no-branch-title { font-size: 15px; font-weight: 700; color: #92400e; margin-bottom: 6px; }
        .bupd-m-no-branch-sub { font-size: 13px; color: #92400e; opacity: 0.8; }
        .bupd-m-no-branch-link { display: inline-flex; margin-top: 14px; padding: 8px 16px; background: #b45309; color: #fff; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; transition: opacity 0.2s; }
        .bupd-m-no-branch-link:hover { opacity: 0.85; }
      `}</style>

      <div className="bupd-m-page">
        <Link href="/dashboard" className="bupd-m-back">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="bupd-m-hero">
          <div className="bupd-m-hero-icon">
            <Bell size={22} color="#1a6640" />
          </div>
          <div>
            <div className="bupd-m-title">Branch Updates</div>
            <div className="bupd-m-sub">News and announcements from your branch.</div>
          </div>
        </div>

        {loading ? (
          <div className="bupd-m-loading">Loading updates…</div>
        ) : noBranch ? (
          <div className="bupd-m-no-branch">
            <div className="bupd-m-no-branch-title">No branch assigned</div>
            <div className="bupd-m-no-branch-sub">
              Complete your profile and select a branch to see updates from your branch.
            </div>
            <Link href="/dashboard/profile" className="bupd-m-no-branch-link">
              Complete Profile
            </Link>
          </div>
        ) : updates.length === 0 ? (
          <div className="bupd-m-empty">
            <div className="bupd-m-empty-icon">📢</div>
            <div className="bupd-m-empty-title">No updates yet</div>
            <div className="bupd-m-empty-sub">
              Your branch hasn't posted any updates. Check back soon.
            </div>
          </div>
        ) : (
          <div className="bupd-m-list">
            {updates.map((u) => (
              <div key={u.id} className="bupd-m-card">
                <div className="bupd-m-card-header">
                  <div className="bupd-m-card-title">{u.title}</div>
                  <span className="bupd-m-card-branch">
                    <Bell size={10} /> {u.branchName}
                  </span>
                </div>
                <div className="bupd-m-card-content">{u.content}</div>
                <div className="bupd-m-card-meta">
                  <span>{u.structureName}</span>
                  <span className="bupd-m-card-sep" />
                  <span>Posted by {u.authorName}</span>
                  <span className="bupd-m-card-sep" />
                  <span>{timeAgo(u.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
