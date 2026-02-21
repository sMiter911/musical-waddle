"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ChevronLeft, Mail, Phone, MapPin, Calendar, Briefcase,
  User as UserIcon, CheckCircle2, AlertCircle, Shield,
  CreditCard, ExternalLink, Clock, Building2, Home,
  IdCard, Award, TrendingUp, MoreHorizontal,
} from "lucide-react";
import { getMemberProfileById, getMemberActivityById } from "@/lib/actions/admin";

interface ActivityItem {
  id: string;
  action: string;
  type: string;
  time: string;
  fullDate: Date;
}

interface ProfileData {
  id: string;
  membershipNumber: string;
  title: string | null;
  firstName: string;
  lastName: string;
  gender: string | null;
  identityNumber: string | null;
  dateOfBirth: Date | null;
  contactNumber: string | null;
  countryName: string | null;
  streetAddress: string | null;
  city: string | null;
  homeArea: string | null;
  postalCode: string | null;
  employment: string | null;
  companyName: string | null;
  avatarUrl: string | null;
  completion: number;
  structure: string;
  branchName: string;
  user: {
    email: string;
    name: string;
    image: string | null;
  };
  createdAt: Date;
}

export default function AdminMemberProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMemberProfileById(userId);
        setProfile(data as any);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  useEffect(() => {
    if (activeTab === "activity" && activity.length === 0) {
      async function loadActivity() {
        setLoadingActivity(true);
        try {
          const data = await getMemberActivityById(userId);
          setActivity(data as any);
        } catch (error) {
          console.error("Failed to load activity:", error);
        } finally {
          setLoadingActivity(false);
        }
      }
      loadActivity();
    }
  }, [activeTab, userId, activity.length]);

  if (loading) {
    return (
      <div className="prof-loading">
        <div className="prof-spinner" />
        <p>Loading member profile...</p>
        <style>{`
          .prof-loading {
            height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            color: #a0998e;
            font-family: 'Sora', sans-serif;
          }
          .prof-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f0ede8;
            border-top-color: #1a6640;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="prof-error">
        <div className="prof-error-icon">
          <AlertCircle size={32} />
        </div>
        <h1>Member Not Found</h1>
        <p>The requested membership record could not be retrieved from the registry.</p>
        <Link href="/admin/members" className="prof-error-btn">
          <ChevronLeft size={16} /> Return to Directory
        </Link>
        <style>{`
          .prof-error {
            height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            text-align: center;
            font-family: 'Sora', sans-serif;
          }
          .prof-error-icon {
            width: 72px;
            height: 72px;
            border-radius: 16px;
            background: rgba(190,18,60,0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #be123c;
          }
          .prof-error h1 {
            font-weight: 800;
            letter-spacing: -0.04em;
            font-size: 24px;
            margin: 8px 0 4px;
          }
          .prof-error p { color: #6b6b6b; max-width: 400px; }
          .prof-error-btn {
            margin-top: 1rem;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 20px;
            background: #1a1a1a;
            color: #fff;
            border-radius: 8px;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            transition: background 0.15s;
          }
          .prof-error-btn:hover { background: #333; }
        `}</style>
      </div>
    );
  }

  const fullName = `${profile.title ? profile.title + " " : ""}${profile.firstName} ${profile.lastName}`.trim() || profile.user.name;
  const initials = `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase();
  const isComplete = profile.completion === 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .prof-page {
          font-family: 'Sora', sans-serif;
          color: #1a1a1a;
          max-width: 1140px;
          margin: 0 auto;
          animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* ── Breadcrumb ── */
        .prof-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 13px;
        }
        .prof-breadcrumb-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #6b6b6b;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.15s;
        }
        .prof-breadcrumb-link:hover { color: #1a1a1a; }
        .prof-breadcrumb-sep { color: #e0ddd8; font-weight: 300; }
        .prof-breadcrumb-current { color: #1a1a1a; font-weight: 700; }

        /* ── Layout ── */
        .prof-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 960px) { .prof-layout { grid-template-columns: 1fr; } }

        /* ── Sidebar Card ── */
        .prof-sidebar {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.03);
          position: sticky;
          top: 20px;
        }

        .prof-sidebar-header {
          padding: 24px 24px 20px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #fff;
          position: relative;
        }
        .prof-completion-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .prof-completion-badge.complete {
          background: rgba(46,204,113,0.2);
          color: #2ecc71;
          border: 1px solid rgba(46,204,113,0.3);
        }
        .prof-completion-badge.incomplete {
          background: rgba(244,63,94,0.15);
          color: #f87171;
          border: 1px solid rgba(244,63,94,0.25);
        }

        .prof-avatar-wrap {
          width: 88px;
          height: 88px;
          border-radius: 16px;
          background: #fff;
          border: 3px solid rgba(255,255,255,0.2);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .prof-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .prof-avatar-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1a6640, #27ae60);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 28px;
          font-weight: 800;
          color: #fff;
        }

        .prof-name {
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
          line-height: 1.2;
        }
        .prof-email {
          font-size: 12.5px;
          color: rgba(255,255,255,0.65);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
        }

        .prof-progress-wrap {
          background: rgba(255,255,255,0.1);
          height: 6px;
          border-radius: 99px;
          overflow: hidden;
        }
        .prof-progress-fill {
          height: 100%;
          background: #2ecc71;
          border-radius: 99px;
          transition: width 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .prof-progress-label {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin-top: 6px;
          font-family: 'JetBrains Mono', monospace;
        }

        .prof-sidebar-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

        .prof-meta-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .prof-meta-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .prof-meta-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #f7f6f3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b6b6b;
          flex-shrink: 0;
        }
        .prof-meta-text { flex: 1; padding-top: 4px; }
        .prof-meta-label {
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #a0998e;
          margin-bottom: 3px;
        }
        .prof-meta-val {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.4;
        }
        .prof-meta-empty { color: #b5b0a8; font-style: italic; font-weight: 400; }

        .prof-id-card {
          background: linear-gradient(135deg, #1a6640 0%, #27ae60 100%);
          padding: 14px 16px;
          border-radius: 10px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 4px;
        }
        .prof-id-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.7;
          margin-bottom: 4px;
        }
        .prof-id-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .prof-sidebar-divider { height: 1px; background: #f0ede8; }

        .prof-sidebar-actions {
          padding: 16px 20px;
          background: #faf9f7;
          border-top: 1px solid #f0ede8;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .prof-sidebar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          border: 1.5px solid;
          background: none;
          text-decoration: none;
        }
        .prof-sidebar-btn-primary {
          background: #1a1a1a;
          border-color: #1a1a1a;
          color: #fff;
        }
        .prof-sidebar-btn-primary:hover { background: #333; border-color: #333; }
        .prof-sidebar-btn-secondary {
          border-color: #e0ddd8;
          color: #4a4a4a;
        }
        .prof-sidebar-btn-secondary:hover { border-color: #1a1a1a; color: #1a1a1a; background: #fff; }

        /* ── Main content ── */
        .prof-main { display: flex; flex-direction: column; gap: 16px; }

        .prof-tabs {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          padding: 6px;
          display: inline-flex;
          gap: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,.03);
        }
        .prof-tab {
          padding: 8px 18px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          background: none;
          color: #6b6b6b;
        }
        .prof-tab:hover { color: #1a1a1a; background: #f7f6f3; }
        .prof-tab.active { color: #fff; background: #1a1a1a; }

        .prof-content-card {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.03);
        }

        .prof-section {
          padding: 28px;
          border-bottom: 1px solid #f7f6f3;
        }
        .prof-section:last-child { border-bottom: none; }

        .prof-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f7f6f3;
        }
        .prof-section-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f7f6f3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1a6640;
        }
        .prof-section-title {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #1a1a1a;
        }

        .prof-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 700px) { .prof-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .prof-grid { grid-template-columns: 1fr; } }

        .prof-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .prof-field-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #a0998e;
        }
        .prof-field-val {
          font-size: 13.5px;
          font-weight: 500;
          color: #1a1a1a;
          line-height: 1.5;
        }
        .prof-field-empty {
          font-size: 13px;
          color: #b5b0a8;
          font-style: italic;
        }

        .prof-alert {
          background: #fffbf0;
          border: 1px solid #fde8c8;
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 16px;
        }
        .prof-alert-icon { color: #d97706; flex-shrink: 0; margin-top: 2px; }
        .prof-alert-text { flex: 1; }
        .prof-alert-title {
          font-size: 13px;
          font-weight: 700;
          color: #78350f;
          margin-bottom: 4px;
        }
        .prof-alert-body { font-size: 12.5px; color: #92400e; line-height: 1.5; }

        /* ── Timeline ── */
        .prof-timeline {
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
        }
        .prof-timeline::before {
          content: '';
          position: absolute;
          left: 41px;
          top: 32px;
          bottom: 32px;
          width: 2px;
          background: #f0ede8;
        }

        .prof-tl-item {
          display: flex;
          gap: 24px;
          padding: 16px 0;
          position: relative;
        }
        .prof-tl-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #1a6640;
          position: relative;
          z-index: 10;
          margin-top: 4px;
          flex-shrink: 0;
          margin-left: 3px;
        }
        .prof-tl-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .prof-tl-title {
          font-size: 13.5px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.4;
        }
        .prof-tl-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          color: #a0998e;
          font-family: 'JetBrains Mono', monospace;
        }
        .prof-tl-tag {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 1px 6px;
          border-radius: 4px;
          background: #f7f6f3;
          color: #6b6b6b;
        }
        .prof-tl-tag.member { background: rgba(26,102,64,0.1); color: #1a6640; }
        .prof-tl-tag.profile { background: rgba(30,64,175,0.1); color: #1e40af; }
        .prof-tl-tag.donation { background: rgba(190,18,60,0.1); color: #be123c; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>

      <div className="prof-page">
        {/* Breadcrumb */}
        <nav className="prof-breadcrumb" aria-label="Breadcrumb">
          <Link href="/admin/members" className="prof-breadcrumb-link">
            <ChevronLeft size={14} /> Member Directory
          </Link>
          <span className="prof-breadcrumb-sep">/</span>
          <span className="prof-breadcrumb-current">Profile</span>
        </nav>

        <div className="prof-layout">
          {/* ── Sidebar ── */}
          <aside className="prof-sidebar">
            <div className="prof-sidebar-header">
              <div
                className={`prof-completion-badge ${isComplete ? "complete" : "incomplete"}`}
              >
                {profile.completion}%
              </div>

              <div className="prof-avatar-wrap">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={fullName}
                    className="prof-avatar-img"
                  />
                ) : (
                  <div className="prof-avatar-fallback">{initials}</div>
                )}
              </div>

              <h1 className="prof-name">{fullName}</h1>
              <div className="prof-email">
                <Mail size={13} />
                {profile.user.email}
              </div>

              <div className="prof-progress-wrap">
                <div
                  className="prof-progress-fill"
                  style={{ width: `${profile.completion}%` }}
                />
              </div>
              <div className="prof-progress-label">
                Profile completion · {isComplete ? "Verified" : "Incomplete"}
              </div>
            </div>

            <div className="prof-sidebar-body">
              {/* Membership ID */}
              <div className="prof-id-card">
                <div>
                  <div className="prof-id-label">Member ID</div>
                  <div className="prof-id-number">
                    {profile.membershipNumber}
                  </div>
                </div>
                <IdCard size={24} style={{ opacity: 0.5 }} />
              </div>

              <div className="prof-sidebar-divider" />

              {/* Quick facts */}
              <div className="prof-meta-group">
                <div className="prof-meta-item">
                  <div className="prof-meta-icon">
                    <MapPin size={15} />
                  </div>
                  <div className="prof-meta-text">
                    <div className="prof-meta-label">Region</div>
                    <div className="prof-meta-val">
                      {profile.structure || (
                        <span className="prof-meta-empty">Not assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="prof-meta-item">
                  <div className="prof-meta-icon">
                    <Building2 size={15} />
                  </div>
                  <div className="prof-meta-text">
                    <div className="prof-meta-label">Branch</div>
                    <div className="prof-meta-val">
                      {profile.branchName || (
                        <span className="prof-meta-empty">Unallocated</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="prof-meta-item">
                  <div className="prof-meta-icon">
                    <Calendar size={15} />
                  </div>
                  <div className="prof-meta-text">
                    <div className="prof-meta-label">Joined</div>
                    <div className="prof-meta-val">
                      {new Date(profile.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="prof-sidebar-actions">
              <button className="prof-sidebar-btn prof-sidebar-btn-primary">
                <Shield size={15} /> Manage Access
              </button>
              <button className="prof-sidebar-btn prof-sidebar-btn-secondary">
                <CreditCard size={15} /> Issue ID Card
              </button>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="prof-main">
            {/* Tabs */}
            <div className="prof-tabs" role="tablist">
              <button
                className={`prof-tab ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
                role="tab"
                aria-selected={activeTab === "overview"}
              >
                Overview
              </button>
              <button
                className={`prof-tab ${activeTab === "activity" ? "active" : ""}`}
                onClick={() => setActiveTab("activity")}
                role="tab"
                aria-selected={activeTab === "activity"}
              >
                Activity Log
              </button>
            </div>

            {/* Content */}
            {activeTab === "overview" ? (
              <div className="prof-content-card">
                {/* Personal Information */}
                <section className="prof-section">
                  <div className="prof-section-header">
                    <div className="prof-section-icon">
                      <UserIcon size={18} />
                    </div>
                    <h2 className="prof-section-title">Personal Information</h2>
                  </div>

                  <div className="prof-grid">
                    <div className="prof-field">
                      <span className="prof-field-label">Title</span>
                      <span className="prof-field-val">
                        {profile.title || (
                          <span className="prof-field-empty">Not specified</span>
                        )}
                      </span>
                    </div>

                    <div className="prof-field">
                      <span className="prof-field-label">First Name</span>
                      <span className="prof-field-val">{profile.firstName}</span>
                    </div>

                    <div className="prof-field">
                      <span className="prof-field-label">Last Name</span>
                      <span className="prof-field-val">{profile.lastName}</span>
                    </div>

                    <div className="prof-field">
                      <span className="prof-field-label">Gender</span>
                      <span className="prof-field-val">
                        {profile.gender || (
                          <span className="prof-field-empty">Not specified</span>
                        )}
                      </span>
                    </div>

                    <div className="prof-field">
                      <span className="prof-field-label">National ID</span>
                      <span className="prof-field-val">
                        {profile.identityNumber || (
                          <span className="prof-field-empty">Not provided</span>
                        )}
                      </span>
                    </div>

                    <div className="prof-field">
                      <span className="prof-field-label">Date of Birth</span>
                      <span className="prof-field-val">
                        {profile.dateOfBirth ? (
                          new Date(profile.dateOfBirth).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "long", year: "numeric" }
                          )
                        ) : (
                          <span className="prof-field-empty">Not provided</span>
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Contact & Location */}
                <section className="prof-section">
                  <div className="prof-section-header">
                    <div className="prof-section-icon">
                      <Phone size={18} />
                    </div>
                    <h2 className="prof-section-title">Contact & Location</h2>
                  </div>

                  <div className="prof-grid">
                    <div className="prof-field">
                      <span className="prof-field-label">Phone Number</span>
                      <span className="prof-field-val">
                        {profile.contactNumber || (
                          <span className="prof-field-empty">Not provided</span>
                        )}
                      </span>
                    </div>

                    <div className="prof-field">
                      <span className="prof-field-label">Country</span>
                      <span className="prof-field-val">
                        {profile.countryName || (
                          <span className="prof-field-empty">Not specified</span>
                        )}
                      </span>
                    </div>

                    <div className="prof-field">
                      <span className="prof-field-label">City</span>
                      <span className="prof-field-val">
                        {profile.city || (
                          <span className="prof-field-empty">Not provided</span>
                        )}
                      </span>
                    </div>

                    <div className="prof-field" style={{ gridColumn: "span 2" }}>
                      <span className="prof-field-label">Street Address</span>
                      <span className="prof-field-val">
                        {profile.streetAddress || (
                          <span className="prof-field-empty">Not provided</span>
                        )}
                      </span>
                    </div>

                    <div className="prof-field">
                      <span className="prof-field-label">Home Area</span>
                      <span className="prof-field-val">
                        {profile.homeArea || (
                          <span className="prof-field-empty">Not specified</span>
                        )}
                      </span>
                    </div>

                    <div className="prof-field">
                      <span className="prof-field-label">Postal Code</span>
                      <span className="prof-field-val">
                        {profile.postalCode || (
                          <span className="prof-field-empty">Not provided</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {!profile.streetAddress && (
                    <div className="prof-alert">
                      <AlertCircle size={18} className="prof-alert-icon" />
                      <div className="prof-alert-text">
                        <div className="prof-alert-title">
                          Incomplete address information
                        </div>
                        <div className="prof-alert-body">
                          Member has not yet provided complete residential address
                          details.
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Professional Background */}
                <section className="prof-section">
                  <div className="prof-section-header">
                    <div className="prof-section-icon">
                      <Briefcase size={18} />
                    </div>
                    <h2 className="prof-section-title">
                      Professional Background
                    </h2>
                  </div>

                  <div className="prof-grid">
                    <div className="prof-field">
                      <span className="prof-field-label">Employment Status</span>
                      <span className="prof-field-val">
                        {profile.employment || "Not specified"}
                      </span>
                    </div>

                    {profile.employment === "Yes" && (
                      <div className="prof-field" style={{ gridColumn: "span 2" }}>
                        <span className="prof-field-label">
                          Organization / Company
                        </span>
                        <span className="prof-field-val">
                          {profile.companyName || (
                            <span className="prof-field-empty">
                              Not disclosed
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            ) : (
              <div className="prof-content-card">
                <section className="prof-section">
                  <div className="prof-section-header">
                    <div className="prof-section-icon">
                      <Clock size={18} />
                    </div>
                    <h2 className="prof-section-title">Activity Timeline</h2>
                  </div>

                  <div className="prof-timeline">
                    {loadingActivity ? (
                      <div style={{ padding: "40px 0", textAlign: "center", color: "#a0998e" }}>
                        <div className="prof-spinner" style={{ margin: "0 auto 12px", width: "24px", height: "24px" }} />
                        <p style={{ fontSize: "13px" }}>Retrieving activity logs...</p>
                      </div>
                    ) : activity.length === 0 ? (
                      <div
                        style={{
                          padding: "48px 24px",
                          textAlign: "center",
                          color: "#a0998e",
                        }}
                      >
                        <TrendingUp size={32} style={{ margin: "0 auto 12px" }} />
                        <p style={{ fontSize: "14px", fontWeight: 600 }}>
                          No activity found
                        </p>
                        <p style={{ fontSize: "12.5px", marginTop: "6px" }}>
                          This member has no recorded actions in the system yet.
                        </p>
                      </div>
                    ) : (
                      activity.map((item) => (
                        <div key={item.id} className="prof-tl-item">
                          <div
                            className="prof-tl-dot"
                            style={{
                              borderColor:
                                item.type === "member" ? "#1a6640" :
                                  item.type === "profile" ? "#1e40af" :
                                    item.type === "donation" ? "#be123c" : "#e0ddd8"
                            }}
                          />
                          <div className="prof-tl-content">
                            <div className="prof-tl-title">{item.action}</div>
                            <div className="prof-tl-meta">
                              <span className={`prof-tl-tag ${item.type}`}>
                                {item.type}
                              </span>
                              <span>{item.time}</span>
                              <span style={{ opacity: 0.5 }}>
                                {new Date(item.fullDate).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}