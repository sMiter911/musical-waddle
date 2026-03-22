"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, Bell, MessageSquare, Reply, Megaphone } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import {
  getUnreadCount,
  getRecentNotifications,
  markAllRead,
  type NotificationRow,
} from "@/lib/actions/notifications";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/blog", label: "News" },
  { href: "/contributions", label: "Contributions" },
  { href: "/contact", label: "Contact" },
];

function formatRelative(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Self-contained component — each instance has its own ref and state, so
// rendering it in both the desktop and mobile slots doesn't cause ref conflicts.
function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUnreadCount().then(setUnreadCount).catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  async function toggle() {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (!loaded) {
      const rows = await getRecentNotifications();
      setNotifications(rows);
      setLoaded(true);
    }
    if (unreadCount > 0) {
      markAllRead()
        .then(() => setUnreadCount(0))
        .catch(() => {});
    }
  }

  function navigate(n: NotificationRow) {
    setOpen(false);
    if (n.type === "BRANCH_UPDATE") {
      router.push("/dashboard/branch-updates");
    } else if (n.postSlug) {
      router.push(`/blog/${n.postSlug}`);
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        style={{
          position: "relative",
          background: "none",
          border: "1px solid var(--gray-200)",
          borderRadius: 8,
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--gray-600)",
          transition: "all 0.15s",
        }}
        className="hover:border-primary/40 hover:text-primary hover:bg-primary/5"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: -5, right: -5,
            background: "var(--primary, #c8102e)",
            color: "#fff",
            borderRadius: "50%",
            width: 17, height: 17,
            fontSize: 10, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1,
            border: "2px solid #fff",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 320,
          background: "#fff",
          border: "1px solid var(--gray-200)",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 100,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--gray-100)",
            fontWeight: 700, fontSize: 13,
            color: "var(--dark)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>Notifications</span>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={() => {
                  markAllRead();
                  setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
                  setUnreadCount(0);
                }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 11, color: "var(--primary)", fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => navigate(n)}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--gray-50)",
                    textDecoration: "none",
                    background: n.isRead ? "transparent" : "rgba(200,16,46,0.04)",
                    transition: "background 0.15s",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "inherit",
                  }}
                  className="hover:bg-light"
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background:
                      n.type === "REPLY" ? "rgba(30,64,175,0.1)" :
                      n.type === "BRANCH_UPDATE" ? "rgba(26,102,64,0.1)" :
                      "rgba(200,16,46,0.08)",
                    color:
                      n.type === "REPLY" ? "#1e40af" :
                      n.type === "BRANCH_UPDATE" ? "#1a6640" :
                      "var(--primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 2,
                  }}>
                    {n.type === "REPLY" ? <Reply size={14} /> :
                     n.type === "BRANCH_UPDATE" ? <Megaphone size={14} /> :
                     <MessageSquare size={14} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, color: "var(--dark)", lineHeight: 1.4,
                      fontWeight: n.isRead ? 400 : 600,
                    }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 3 }}>
                      {formatRelative(new Date(n.createdAt))}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "var(--primary)", flexShrink: 0, marginTop: 6,
                    }} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => { setMounted(true); }, []);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: { onSuccess: () => { window.location.href = "/"; } },
    });
  };

  return (
    <>
      <div className="flag-stripe" />
      <header
        style={{
          position: "sticky", top: 0, zIndex: 1000,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--gray-200)",
        }}
      >
        <nav
          style={{
            maxWidth: 1200, margin: "0 auto",
            padding: "0 clamp(0.75rem, 4vw, 1.5rem)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: "clamp(60px, 12vw, 80px)",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              fontWeight: 800, fontSize: "clamp(1rem, 3vw, 1.25rem)",
              color: "var(--dark)", textDecoration: "none",
            }}
            className="hidden sm:flex"
          >
            <Image
              src="/images/pudemo_logo.png"
              alt="PUDEMO Logo"
              width={80} height={80}
              style={{ width: "80px", height: "80px", objectFit: "contain" }}
              priority quality={100}
            />
          </Link>

          {/* Desktop Nav */}
          <ul style={{ alignItems: "center", gap: "1.5rem", listStyle: "none" }} className="hidden lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{ fontSize: "0.938rem", fontWeight: 500, color: "var(--gray-600)", transition: "color var(--transition)", position: "relative" }}
                  className="hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: "clamp(0.75rem, 2vw, 1.5rem)" }}>
            {mounted && session ? (
              <>
                <NotificationBell />
                <Link
                  href={(session.user as any).role === "admin" ? "/admin" : "/dashboard"}
                  style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--dark)" }}
                  className="hover:text-primary flex items-center gap-1"
                >
                  <LayoutDashboard size={18} />
                  Portal
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn btn-dark"
                  style={{
                    padding: "clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)",
                    fontSize: "0.875rem", background: "var(--primary)", borderColor: "var(--primary)",
                  }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="btn btn-dark"
                style={{
                  padding: "clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)",
                  fontSize: "0.875rem", background: "var(--primary)", borderColor: "var(--primary)",
                }}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1 lg:hidden">
            {mounted && session && (
              <>
                <NotificationBell />
                <Link
                  href={(session.user as any).role === "admin" ? "/admin" : "/dashboard"}
                  className="p-2 text-primary border border-primary/20 bg-primary/5 rounded-lg transition-colors flex items-center gap-1"
                  aria-label="Portal"
                >
                  <LayoutDashboard size={16} />
                  <span className="text-[8px] font-bold uppercase tracking-wider hidden xs:inline">Portal</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-red-600 border border-red-100 bg-red-50/50 rounded-lg transition-colors flex items-center gap-1"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                  <span className="text-[8px] font-bold uppercase tracking-wider hidden xs:inline">Out</span>
                </button>
              </>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--dark)", padding: "clamp(0.375rem, 2vw, 0.5rem)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className="lg:hidden"
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
              background: "#fff", borderBottom: "1px solid var(--gray-200)",
              padding: "clamp(0.5rem, 3vw, 1.25rem) clamp(0.75rem, 4vw, 1.5rem)",
              animation: "fadeIn 0.2s ease", boxShadow: "var(--shadow-lg)",
              maxHeight: "calc(100vh - 70px)", overflowY: "auto",
            }}
          >
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "clamp(0.125rem, 1vw, 0.25rem)" }}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: "block",
                      padding: "clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1rem)",
                      fontSize: "clamp(0.875rem, 2vw, 1rem)", fontWeight: 500,
                      color: "var(--dark)", borderRadius: "var(--radius)",
                      transition: "background var(--transition)",
                    }}
                    className="hover:bg-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div style={{
              marginTop: "clamp(0.75rem, 2vw, 1rem)",
              padding: "0 clamp(0.75rem, 3vw, 1rem)",
              borderTop: "1px solid var(--gray-100)",
              paddingTop: "clamp(0.75rem, 2vw, 1rem)",
            }}>
              {mounted && session ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "clamp(0.5rem, 2vw, 0.75rem)", marginTop: "clamp(0.75rem, 2vw, 1rem)" }}>
                  <Link
                    href={(session.user as any).role === "admin" ? "/admin" : "/dashboard"}
                    className="btn btn-outline"
                    style={{ width: "100%", justifyContent: "center", padding: "clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)", fontSize: "clamp(0.8rem, 2vw, 0.875rem)" }}
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    <span className="ml-1">Portal</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center", padding: "clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)", fontSize: "clamp(0.8rem, 2vw, 0.875rem)" }}
                  >
                    <LogOut size={16} />
                    <span className="ml-1">Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: "clamp(0.75rem, 2vw, 1rem)", padding: "clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)", fontSize: "clamp(0.8rem, 2vw, 0.875rem)" }}
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
