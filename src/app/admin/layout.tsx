"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Heart, Megaphone,
  Settings, LogOut, ShieldCheck,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: { onSuccess: () => { window.location.href = "/"; } },
    });
  };

  const sidebarLinks = [
    { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
    { href: "/admin/members",    label: "Members",    icon: Users           },
    { href: "/admin/donations",  label: "Donations",  icon: Heart           },
    { href: "/admin/volunteers", label: "Volunteers", icon: Megaphone       },
  ];

  const adminName = session?.user?.name || "Admin";
  const adminInitial = adminName[0]?.toUpperCase() ?? "A";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Shell ── */
        .adm-shell {
          display: flex;
          min-height: 100vh;
          font-family: 'Sora', sans-serif;
          background: #f7f6f3;
          color: #1a1a1a;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Sidebar ── */
        .adm-sidebar {
          width: 236px;
          flex-shrink: 0;
          background: #1a1a1a;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }
        @media (max-width: 768px) { .adm-sidebar { display: none; } }

        /* Sidebar brand */
        .adm-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          text-decoration: none;
        }
        .adm-brand-icon {
          width: 34px; height: 34px;
          background: #1a6640;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .adm-brand-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .adm-brand-title {
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.06em;
          line-height: 1;
        }
        .adm-brand-sub {
          font-size: 9.5px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.08em;
          font-weight: 500;
          text-transform: uppercase;
        }

        /* Nav items */
        .adm-nav {
          flex: 1;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }
        .adm-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: all 0.15s;
          border: 1px solid transparent;
          position: relative;
        }
        .adm-nav-item:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }
        .adm-nav-item.active {
          color: #fff;
          background: rgba(26,102,64,0.2);
          border-color: rgba(26,102,64,0.35);
          font-weight: 600;
        }
        .adm-nav-item.active svg { color: #2ecc71; }
        .adm-nav-item svg { flex-shrink: 0; }
        .adm-nav-dot {
          width: 5px; height: 5px;
          background: #2ecc71;
          border-radius: 50%;
          position: absolute;
          right: 12px;
        }

        /* Sidebar footer */
        .adm-sidebar-footer {
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .adm-sidebar-footer-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          transition: all 0.15s;
        }
        .adm-sidebar-footer-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .adm-sidebar-footer-btn.danger { color: rgba(239,68,68,0.7); }
        .adm-sidebar-footer-btn.danger:hover { color: #ef4444; background: rgba(239,68,68,0.08); }

        /* Sidebar admin badge */
        .adm-sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 12px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 4px;
        }
        .adm-sidebar-avatar {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: rgba(26,102,64,0.3);
          border: 1px solid rgba(26,102,64,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #2ecc71;
          flex-shrink: 0;
          font-family: 'JetBrains Mono', monospace;
        }
        .adm-sidebar-user-info { min-width: 0; }
        .adm-sidebar-user-name {
          font-size: 12.5px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .adm-sidebar-user-role {
          font-size: 10.5px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.04em;
        }

        /* ── Main column ── */
        .adm-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        /* Top bar */
        .adm-topbar {
          height: 56px;
          background: #fff;
          border-bottom: 1px solid #e5e3de;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 20;
          flex-shrink: 0;
        }

        /* Mobile brand in topbar */
        .adm-topbar-brand {
          display: none;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #1a1a1a;
        }
        @media (max-width: 768px) { .adm-topbar-brand { display: flex; } }
        .adm-topbar-brand span {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        /* Breadcrumb */
        .adm-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #a0998e;
        }
        .adm-breadcrumb-sep { opacity: 0.4; }
        .adm-breadcrumb-current {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 12px;
        }
        @media (max-width: 768px) { .adm-breadcrumb { display: none; } }

        /* Topbar right */
        .adm-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .adm-topbar-user-label {
          text-align: right;
          display: none;
        }
        @media (min-width: 640px) { .adm-topbar-user-label { display: block; } }
        .adm-topbar-user-name { font-size: 13px; font-weight: 700; color: #1a1a1a; }
        .adm-topbar-user-role { font-size: 11px; color: #a0998e; }
        .adm-topbar-avatar {
          width: 34px; height: 34px;
          border-radius: 8px;
          background: rgba(26,102,64,0.1);
          border: 1.5px solid rgba(26,102,64,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #1a6640;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── Content area ── */
        .adm-content {
          flex: 1;
          padding: clamp(1.5rem, 4vw, 2.5rem);
        }
      `}</style>

      <div className="adm-shell">
        {/* ── Sidebar ── */}
        <aside className="adm-sidebar">
          <Link href="/admin" className="adm-brand">
            <div className="adm-brand-icon">
              <ShieldCheck size={18} color="#fff" />
            </div>
            <div className="adm-brand-text">
              <span className="adm-brand-title">PUDEMO</span>
              <span className="adm-brand-sub">Admin Portal</span>
            </div>
          </Link>

          <nav className="adm-nav" aria-label="Admin navigation">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`adm-nav-item ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <link.icon size={17} />
                  {link.label}
                  {isActive && <span className="adm-nav-dot" />}
                </Link>
              );
            })}
          </nav>

          <div className="adm-sidebar-footer">
            <div className="adm-sidebar-user">
              <div className="adm-sidebar-avatar">{adminInitial}</div>
              <div className="adm-sidebar-user-info">
                <div className="adm-sidebar-user-name">{adminName}</div>
                <div className="adm-sidebar-user-role">System Admin</div>
              </div>
            </div>
            <Link href="/" className="adm-sidebar-footer-btn">
              <Settings size={16} /> Site Settings
            </Link>
            <button onClick={handleSignOut} className="adm-sidebar-footer-btn danger">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="adm-main">
          <header className="adm-topbar">
            <Link href="/admin" className="adm-topbar-brand">
              <ShieldCheck size={20} color="#1a6640" />
              <span>PUDEMO Admin</span>
            </Link>

            <div className="adm-breadcrumb" aria-label="Breadcrumb">
              <span>Admin</span>
              <span className="adm-breadcrumb-sep">/</span>
              <span className="adm-breadcrumb-current">
                {sidebarLinks.find(l => pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href)))?.label ?? "Dashboard"}
              </span>
            </div>

            <div className="adm-topbar-right">
              <div className="adm-topbar-user-label">
                <div className="adm-topbar-user-name">{adminName}</div>
                <div className="adm-topbar-user-role">System Administrator</div>
              </div>
              <div className="adm-topbar-avatar">{adminInitial}</div>
            </div>
          </header>

          <main className="adm-content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}