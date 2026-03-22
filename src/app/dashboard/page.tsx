"use client";

import Link from "next/link";
import {
  User, Users, ClipboardList,
  CheckCircle2, AlertCircle, Camera, Download,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { getMemberProfile } from "@/lib/actions/profile";
import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface MemberData {
  name: string;
  firstName: string;
  lastName: string;
  membershipNumber: string;
  profileComplete: number;
  joinedDate: string;
  branch: string;
  structure: string;
  contactNumber: string;
  email: string;
  title: string;
  avatarUrl: string;
}

// ─── PUDEMO Logo Component ────────────────────────────────────────────────────
function PudemoLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/images/pudemo_logo.png"
      alt="PUDEMO"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '50%' }}
    />
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 16 }: { w?: string | number; h?: number }) {
  return (
    <div
      style={{ width: w, height: h, borderRadius: 6 }}
      className="dash-skeleton"
    />
  );
}

// ─── Helper: hex → rgb components ─────────────────────────────────────────────
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function shiftHue(hex: string, deg: number): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  h = ((h * 360 + deg) % 360) / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const nr = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const ng = Math.round(hue2rgb(p, q, h) * 255);
  const nb = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return "#" + [nr, ng, nb].map(v => v.toString(16).padStart(2, "0")).join("");
}

function generateInitialsAvatar(name: string, accent: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 200; canvas.height = 200;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 200, 200);
  grad.addColorStop(0, accent);
  grad.addColorStop(1, shiftHue(accent, 40));
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(100, 100, 100, 0, Math.PI * 2); ctx.fill();
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 72px Sora, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(initials, 100, 106);
  return canvas.toDataURL("image/png");
}

// ─── 3D Card Component ─────────────────────────────────────────────────────────
function MemberCard3D({ member, accent }: { member: MemberData | null; accent: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<string>("");

  const { r, g, b } = hexToRgb(accent);
  const glowColor = `rgba(${r},${g},${b},0.4)`;

  // Generate initials avatar when member loads
  useEffect(() => {
    if (member) {
      if (member.avatarUrl) {
        setAvatarSrc(member.avatarUrl);
      } else if (!avatarFile) {
        setAvatarSrc(generateInitialsAvatar(member.name || "Member", accent));
      }
    }
  }, [member, accent, avatarFile]);

  // 3D tilt
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect || !cardRef.current || !glossRef.current) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2;
    const rotY = ((x - cx) / cx) * 18;
    const rotX = ((cy - y) / cy) * 14;
    cardRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    const gx = (x / rect.width) * 100;
    const gy = (y / rect.height) * 100;
    glossRef.current.style.background = `radial-gradient(ellipse at ${gx}% ${gy}%, rgba(255,255,255,0.13) 0%, transparent 60%)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current || !glossRef.current) return;
    cardRef.current.style.transform = "rotateX(0) rotateY(0)";
    glossRef.current.style.background = "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 60%)";
  }, []);

  // Avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarFile(result);
      setAvatarSrc(result);
    };
    reader.readAsDataURL(file);
  };

  // Download
  const handleDownload = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;

    // Store original styles
    const originalTransition = card.style.transition;
    const originalTransform = card.style.transform;

    // Reset transforms and ensure proper rendering
    card.style.transition = "none";
    card.style.transform = "rotateX(0) rotateY(0)";

    setTimeout(async () => {
      const { default: html2canvas } = await import("html2canvas");

      try {
        const canvas = await html2canvas(card, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          logging: false,
          width: card.offsetWidth,
          height: card.offsetHeight,
          windowWidth: card.scrollWidth,
          windowHeight: card.scrollHeight,
          x: 0,
          y: 0,
        });

        const link = document.createElement("a");
        link.download = `${member?.membershipNumber || "pudemo-card"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Error generating card image:", error);
      } finally {
        // Restore original styles
        card.style.transition = originalTransition;
        card.style.transform = originalTransform;
      }
    }, 100);
  };

  if (!member) {
    return (
      <div className="card3d-scene-placeholder">
        <div className="card3d-empty-icon" />
        <p>Card will appear once profile is loaded</p>
      </div>
    );
  }

  return (
    <div className="card3d-wrapper">
      <div
        ref={sceneRef}
        className="card3d-scene"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={cardRef}
          className="card3d"
          style={{
            boxShadow: `0 30px 70px rgba(0,0,0,0.5), 0 0 90px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
        >
          {/* Gloss layer */}
          <div ref={glossRef} className="card3d-gloss" />

          {/* Accent stripe top */}
          <div
            className="card3d-stripe"
            style={{ background: `linear-gradient(90deg, ${accent} 0%, ${shiftHue(accent, 40)} 100%)` }}
          />

          {/* Card content */}
          <div className="card3d-content">
            {/* Header row: logo + org name */}
            <div className="card3d-org">
              <PudemoLogo size={36} />
              <div className="card3d-org-text">
                <span className="card3d-org-name">PUDEMO</span>
                <span className="card3d-org-sub">People's United Democratic Movement</span>
              </div>
            </div>

            <div className="card3d-divider" />

            {/* Avatar + name */}
            <div className="card3d-identity">
              <div className="card3d-avatar-ring" style={{ borderColor: accent, boxShadow: `0 0 20px ${glowColor}` }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt={member.name} className="card3d-avatar-img" />
                  : <div className="card3d-avatar-fallback"><User size={28} /></div>
                }
              </div>
              <div>
                <div className="card3d-member-title">{member.title && `${member.title} `}{member.name}</div>
                <div className="card3d-member-id" style={{ color: accent }}>
                  #{member.membershipNumber}
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="card3d-info-grid">
              {member.branch && (
                <div className="card3d-info-item">
                  <span className="card3d-info-key">Branch</span>
                  <span className="card3d-info-val">{member.branch}</span>
                </div>
              )}
              {member.structure && (
                <div className="card3d-info-item">
                  <span className="card3d-info-key">Region</span>
                  <span className="card3d-info-val">{member.structure}</span>
                </div>
              )}
              {member.contactNumber && (
                <div className="card3d-info-item">
                  <span className="card3d-info-key">Contact</span>
                  <span className="card3d-info-val">{member.contactNumber}</span>
                </div>
              )}
              {member.email && (
                <div className="card3d-info-item card3d-info-full">
                  <span className="card3d-info-key">Email</span>
                  <span className="card3d-info-val">{member.email}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="card3d-footer">
              <div
                className="card3d-accent-bar"
                style={{ background: accent, boxShadow: `0 0 14px ${glowColor}` }}
              />
              <span className="card3d-joined">Member since {member.joinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card actions */}
      <div className="card3d-actions">
        <label className="card3d-action-btn card3d-action-secondary" htmlFor="card-avatar-upload">
          <Camera size={15} /> Change Photo
          <input id="card-avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
        </label>
        <button className="card3d-action-btn card3d-action-download" onClick={handleDownload}>
          <Download size={15} /> Download Card
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardAccent, setCardAccent] = useState("#1a6640");

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: { onSuccess: () => { window.location.href = "/"; } },
    });
  };

  const loadData = useCallback(async () => {
    const profile = await getMemberProfile();
    if (profile) {
      setMember({
        name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || session?.user?.name || "Member",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        membershipNumber: profile.membershipNumber || "Pending",
        profileComplete: profile.completion || 0,
        joinedDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "Recently",
        branch: profile.branchName || "",
        structure: profile.structure || "",
        contactNumber: profile.contactNumber || "",
        email: session?.user?.email || "",
        title: profile.title || "",
        avatarUrl: profile.avatarUrl || "",
      });
    } else {
      setMember({
        name: session?.user?.name || "Member",
        firstName: "", lastName: "",
        membershipNumber: "Pending",
        profileComplete: 0,
        joinedDate: "Recently",
        branch: "", structure: "", contactNumber: "",
        email: session?.user?.email || "",
        title: "",
        avatarUrl: session?.user?.image || "",
      });
    }
    setLoading(false);
  }, [session]);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Root ── */
        .dash-root {
          font-family: 'Sora', sans-serif;
          background: #f7f6f3;
          min-height: 100vh;
          padding: clamp(1.5rem, 5vw, 3rem) clamp(1rem, 4vw, 1.5rem);
          color: #1a1a1a;
          -webkit-font-smoothing: antialiased;
        }
        .dash-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── Skeleton ── */
        .dash-skeleton {
          background: linear-gradient(90deg, #ede9e3 25%, #e4e0d9 50%, #ede9e3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        /* ── Header ── */
        .dash-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          margin-bottom: clamp(2rem, 5vw, 3rem);
        }
        .dash-header-left { display: flex; flex-direction: column; gap: 4px; }
        .dash-greeting {
          font-size: clamp(1.4rem, 4vw, 1.8rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 10px;
          line-height: 1.2;
        }
        .dash-verified {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px; height: 22px;
          background: #1a6640;
          border-radius: 50%;
          color: #fff;
          flex-shrink: 0;
        }
        .dash-member-id {
          font-size: 13px;
          color: #6b6b6b;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dash-member-id-tag {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          color: #1a1a1a;
          background: #f0ede8;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .dash-edit-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 600;
          color: #1a6640;
          text-decoration: none;
          margin-top: 4px;
          letter-spacing: 0.01em;
          transition: opacity 0.15s;
        }
        .dash-edit-link:hover { opacity: 0.7; }

        .dash-header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .dash-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          border: 1.5px solid #e0ddd8;
          background: #fff;
          color: #4a4a4a;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s;
        }
        .dash-btn:hover { border-color: #1a1a1a; color: #1a1a1a; background: #f7f6f3; }
        .dash-btn-danger { color: #c0392b; border-color: #e8c8c5; }
        .dash-btn-danger:hover { border-color: #c0392b; background: #fdf3f2; color: #c0392b; }

        /* ── Layout ── */
        .dash-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: clamp(1.5rem, 4vw, 2.5rem);
          align-items: start;
        }
        @media (max-width: 960px) {
          .dash-layout { grid-template-columns: 1fr; }
        }
        .dash-main { display: flex; flex-direction: column; gap: clamp(1.25rem, 3vw, 1.75rem); }
        .dash-sidebar { display: flex; flex-direction: column; gap: clamp(1.25rem, 3vw, 1.5rem); }

        /* ── Cards ── */
        .dash-card {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04);
          transition: box-shadow 0.2s;
        }
        .dash-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.06), 0 8px 28px rgba(0,0,0,.07); }
        .dash-card-body { padding: clamp(1.25rem, 3vw, 1.75rem); }

        /* ── Profile status ── */
        .profile-status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .profile-status-title {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .profile-status-pct {
          font-size: 13px;
          font-weight: 700;
          color: #1a6640;
          font-family: 'JetBrains Mono', monospace;
        }
        .progress-track {
          width: 100%;
          height: 8px;
          background: #f0ede8;
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #1a6640, #2ecc71);
          border-radius: 99px;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .profile-alert {
          background: #fffbf0;
          border: 1px solid #fde8c8;
          border-radius: 8px;
          padding: 14px 16px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .profile-alert-text { flex: 1; }
        .profile-alert-title {
          font-size: 13px;
          font-weight: 700;
          color: #78350f;
          margin-bottom: 4px;
        }
        .profile-alert-body {
          font-size: 12.5px;
          color: #92400e;
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .profile-alert-link {
          font-size: 12.5px;
          font-weight: 700;
          color: #1a6640;
          text-decoration: underline;
        }

        /* ── Quick actions grid ── */
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(1rem, 2vw, 1.25rem);
        }
        @media (max-width: 500px) { .quick-actions { grid-template-columns: 1fr; } }
        .quick-action-card {
          background: #fff;
          border: 1.5px solid #e5e3de;
          border-radius: 12px;
          padding: clamp(1.1rem, 2.5vw, 1.5rem);
          cursor: pointer;
          transition: all 0.18s;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .quick-action-card:hover {
          border-color: #1a6640;
          box-shadow: 0 4px 20px rgba(26,102,64,0.1);
          transform: translateY(-2px);
        }
        .quick-action-icon {
          width: 44px; height: 44px;
          background: #f0ede8;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1a1a1a;
          margin-bottom: 12px;
          transition: all 0.18s;
        }
        .quick-action-card:hover .quick-action-icon {
          background: #1a6640;
          color: #fff;
        }
        .quick-action-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 5px;
          letter-spacing: -0.01em;
        }
        .quick-action-desc {
          font-size: 12.5px;
          color: #6b6b6b;
          line-height: 1.5;
        }

        /* ── Member info panel ── */
        .member-info-card { padding: clamp(1.25rem, 3vw, 1.5rem); }
        .member-info-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a0998e;
          margin-bottom: 14px;
        }
        .member-info-rows { display: flex; flex-direction: column; gap: 10px; }
        .member-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #f0ede8;
        }
        .member-info-row:last-child { border-bottom: none; }
        .member-info-key {
          font-size: 12px;
          color: #6b6b6b;
          font-weight: 500;
          white-space: nowrap;
        }
        .member-info-val {
          font-size: 12.5px;
          font-weight: 600;
          color: #1a1a1a;
          text-align: right;
        }
        .member-info-empty {
          font-size: 12px;
          color: #b5b0a8;
          font-style: italic;
        }

        /* ── Membership status block ── */
        .membership-block {
          background: #1a1a1a;
          border-radius: 12px;
          padding: clamp(1.25rem, 3vw, 1.5rem);
          color: #fff;
        }
        .membership-block-title {
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .membership-block-body {
          font-size: 12.5px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 16px;
          line-height: 1.55;
        }
        .membership-renew-btn {
          width: 100%;
          padding: 9px;
          background: #2ecc71;
          color: #1a1a1a;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .membership-renew-btn:hover { background: #27ae60; }

        /* ── Help block ── */
        .help-block {
          border: 2px dashed #e0ddd8;
          border-radius: 12px;
          padding: clamp(1.25rem, 3vw, 1.5rem);
        }
        .help-block-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
        .help-block-body { font-size: 12.5px; color: #6b6b6b; margin-bottom: 12px; line-height: 1.5; }
        .help-link {
          font-size: 13px;
          font-weight: 700;
          color: #1a6640;
          text-decoration: none;
        }
        .help-link:hover { text-decoration: underline; }

        /* ── 3D Card Section ── */
        .card3d-section {
          background: #1a1a1a;
          border-radius: 12px;
          overflow: hidden;
        }
        .card3d-section-header {
          padding: 16px 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card3d-section-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }
        .card3d-accent-picker {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .card3d-accent-label {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
        }
        .card3d-color-input {
          -webkit-appearance: none;
          width: 28px; height: 28px;
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          cursor: pointer;
          background: transparent;
          padding: 2px;
        }
        .card3d-color-input::-webkit-color-swatch-wrapper { padding: 0; }
        .card3d-color-input::-webkit-color-swatch { border: none; border-radius: 3px; }

        .card3d-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 20px 20px 20px;
        }

        /* ── 3D scene ── */
        .card3d-scene {
          perspective: 1000px;
          width: 100%;
          max-width: 340px;
          height: 480px;
        }
        .card3d-scene-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 48px 20px;
          color: rgba(255,255,255,0.25);
          font-size: 13px;
          text-align: center;
        }
        .card3d-empty-icon {
          width: 48px; height: 48px;
          border: 2px dashed rgba(255,255,255,0.2);
          border-radius: 8px;
        }
        .card3d {
          width: 100%;
          height: 100%;
          position: relative;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e5e3de;
          transform-style: preserve-3d;
          transition: transform 0.12s ease-out;
          overflow: hidden;
          cursor: default;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 8px 40px rgba(0,0,0,0.06);
        }
        .card3d-gloss {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: radial-gradient(ellipse at 30% 20%, rgba(0,0,0,0.02) 0%, transparent 60%);
          pointer-events: none;
          z-index: 3;
          transition: background 0.15s ease-out;
        }
        .card3d-stripe {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          z-index: 2;
        }
        .card3d-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 20px;
          gap: 14px;
        }
        .card3d-org {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 8px;
        }
        .card3d-org-text { display: flex; flex-direction: column; gap: 1px; }
        .card3d-org-name {
          font-size: 14px;
          font-weight: 800;
          color: #1a1a1a;
          letter-spacing: 0.06em;
          line-height: 1;
        }
        .card3d-org-sub {
          font-size: 9px;
          color: #6b6b6b;
          letter-spacing: 0.03em;
          line-height: 1.3;
          max-width: 180px;
        }
        .card3d-divider {
          height: 1px;
          background: #e5e3de;
        }
        .card3d-identity { display: flex; align-items: center; gap: 14px; }
        .card3d-avatar-ring {
          width: 68px; height: 68px;
          border-radius: 50%;
          border: 2.5px solid;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f6f3;
        }
        .card3d-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .card3d-avatar-fallback { color: #a0998e; }
        .card3d-member-title {
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.01em;
          margin-bottom: 4px;
        }
        .card3d-member-id {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
        }
        .card3d-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          flex: 1;
        }
        .card3d-info-full { grid-column: span 2; }
        .card3d-info-item { display: flex; flex-direction: column; gap: 2px; }
        .card3d-info-key {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a0998e;
        }
        .card3d-info-val {
          font-size: 11.5px;
          color: #1a1a1a;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .card3d-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid #e5e3de;
        }
        .card3d-accent-bar {
          width: 36px; height: 3px;
          border-radius: 2px;
        }
        .card3d-joined {
          font-size: 10px;
          color: #6b6b6b;
          letter-spacing: 0.03em;
        }

        /* ── Card actions ── */
        .card3d-actions { display: flex; gap: 8px; width: 100%; max-width: 340px; }
        .card3d-action-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 12px;
          font-family: 'Sora', sans-serif;
          font-size: 12px;
          font-weight: 600;
          border-radius: 7px;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
        }
        .card3d-action-secondary {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .card3d-action-secondary:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .card3d-action-download {
          background: #2ecc71;
          color: #1a1a1a;
        }
        .card3d-action-download:hover { background: #27ae60; }

        .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

        /* ── Animate in ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .dash-root > * { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div className="dash-root">
        <div className="dash-container">
          {/* ── Header ── */}
          <header className="dash-header">
            <div className="dash-header-left">
              <div className="dash-greeting">
                {loading ? <Skeleton w={220} h={28} /> : (
                  <>
                    Welcome, {member?.name?.split(" ")[0] || "Member"}
                    {member?.profileComplete === 100 && (
                      <span className="dash-verified" title="Profile Complete">
                        <CheckCircle2 size={14} strokeWidth={3} />
                      </span>
                    )}
                  </>
                )}
              </div>
              {loading ? <Skeleton w={160} h={14} /> : (
                <div className="dash-member-id">
                  Member ID:&nbsp;
                  <span className="dash-member-id-tag">{member?.membershipNumber}</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Link href="/dashboard/profile" className="dash-edit-link">
                  <User size={12} /> Edit Profile
                </Link>
                {(session?.user as any)?.role === "admin" && (
                  <Link href="/admin" className="dash-edit-link">
                    <Users size={12} /> Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          </header>

          {/* ── Main layout ── */}
          <div className="dash-layout">

            {/* ── Left column ── */}
            <div className="dash-main">

              {/* Profile completion */}
              {!loading && member && member.profileComplete < 100 && (
                <div className="dash-card">
                  <div className="dash-card-body">
                    <div className="profile-status-header">
                      <span className="profile-status-title">Profile Status</span>
                      <span className="profile-status-pct">{member.profileComplete}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${member.profileComplete}%` }} />
                    </div>
                    <div className="profile-alert">
                      <AlertCircle size={18} style={{ color: "#d97706", marginTop: 2, flexShrink: 0 }} />
                      <div className="profile-alert-text">
                        <p className="profile-alert-title">Action Required: Complete your profile</p>
                        <p className="profile-alert-body">
                          Please provide your branch and contact details to access full member benefits.
                        </p>
                        <Link href="/dashboard/profile" className="profile-alert-link">Update Now →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Member details panel */}
              <div className="dash-card">
                <div className="member-info-card">
                  <div className="member-info-label">Your Details</div>
                  {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={14} />)}
                    </div>
                  ) : (
                    <div className="member-info-rows">
                      {[
                        { key: "Full Name", val: member?.name },
                        { key: "Branch", val: member?.branch },
                        { key: "Region", val: member?.structure },
                        { key: "Contact", val: member?.contactNumber },
                        { key: "Email", val: member?.email },
                        { key: "Member Since", val: member?.joinedDate },
                      ].map(({ key, val }) => (
                        <div key={key} className="member-info-row">
                          <span className="member-info-key">{key}</span>
                          {val
                            ? <span className="member-info-val">{val}</span>
                            : <span className="member-info-empty">Not set</span>
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="quick-actions">
                <Link href="/dashboard/resources" className="quick-action-card">
                  <div className="quick-action-icon"><ClipboardList size={22} /></div>
                  <div className="quick-action-title">Member Resources</div>
                  <div className="quick-action-desc">Access templates, policy briefs, and organizing guides.</div>
                </Link>
                <Link href="/dashboard/branch-updates" className="quick-action-card">
                  <div className="quick-action-icon"><Users size={22} /></div>
                  <div className="quick-action-title">Branch Updates</div>
                  <div className="quick-action-desc">See what's happening in your regional structure.</div>
                </Link>
              </div>
            </div>

            {/* ── Right sidebar ── */}
            <div className="dash-sidebar">

              {/* 3D Member Card */}
              <div className="card3d-section">
                <div className="card3d-section-header">
                  <span className="card3d-section-title">Your Member Card</span>
                  <div className="card3d-accent-picker">
                    <span className="card3d-accent-label">Colour</span>
                    <input
                      type="color" className="card3d-color-input"
                      value={cardAccent}
                      onChange={(e) => setCardAccent(e.target.value)}
                      title="Card accent colour"
                    />
                  </div>
                </div>
                <MemberCard3D member={member} accent={cardAccent} />
              </div>

              {/* Membership status */}
              <div className="membership-block">
                <div className="membership-block-title">
                  <CheckCircle2 size={16} style={{ color: "#2ecc71" }} />
                  Active Membership
                </div>
                <p className="membership-block-body">
                  Your membership is currently active. Next renewal: <strong>Jan 2027</strong>.
                </p>
                <button className="membership-renew-btn">Renew Now</button>
              </div>

              {/* Help */}
              <div className="help-block">
                <div className="help-block-title">Need Help?</div>
                <p className="help-block-body">
                  Contact our support branch for technical or membership issues.
                </p>
                <Link href="/contact" className="help-link">Message Secretariat →</Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}