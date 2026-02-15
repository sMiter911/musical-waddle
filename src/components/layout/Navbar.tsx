"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/contributions", label: "Contributions" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <>
      <div className="flag-stripe" />
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--gray-200)",
        }}
      >
        <nav
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 clamp(0.75rem, 4vw, 1.5rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "clamp(60px, 12vw, 80px)",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontWeight: 800,
              fontSize: "clamp(1rem, 3vw, 1.25rem)",
              color: "var(--dark)",
              textDecoration: "none",
            }}
            className="hidden sm:flex"
          >
            {/* Desktop: Show only logo image */}
            <Image
              src="/images/pudemo_logo.png"
              alt="PUDEMO Logo"
              width={80}
              height={80}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "contain",
              }}
              priority
              quality={100}
            />
          </Link>

          {/* Desktop Nav */}
          <ul
            style={{
              alignItems: "center",
              gap: "1.5rem",
              listStyle: "none",
            }}
            className="hidden lg:flex"
          >
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    fontSize: "0.938rem",
                    fontWeight: 500,
                    color: "var(--gray-600)",
                    transition: "color var(--transition)",
                    position: "relative",
                  }}
                  className="hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div
            className="hidden lg:flex"
            style={{
              alignItems: "center",
              gap: "clamp(0.75rem, 2vw, 1.5rem)",
            }}
          >
            {session ? (
              <>
                <Link
                  href={
                    (session.user as any).role === "admin"
                      ? "/admin"
                      : "/dashboard"
                  }
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "var(--dark)",
                  }}
                  className="hover:text-primary flex items-center gap-1"
                >
                  <LayoutDashboard size={18} />
                  Portal
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn btn-dark"
                  style={{
                    padding:
                      "clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)",
                    fontSize: "0.875rem",
                    background: "var(--primary)",
                    borderColor: "var(--primary)",
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="btn btn-dark"
                style={{
                  padding:
                    "clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)",
                  fontSize: "0.875rem",
                  background: "var(--primary)",
                  borderColor: "var(--primary)",
                }}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Hamburger & Sign Out */}
          <div className="flex items-center gap-1 lg:hidden">
            {session && (
              <>
                <Link
                  href={
                    (session.user as any).role === "admin"
                      ? "/admin"
                      : "/dashboard"
                  }
                  className="p-2 text-primary border border-primary/20 bg-primary/5 rounded-lg transition-colors flex items-center gap-1"
                  aria-label="Portal"
                >
                  <LayoutDashboard size={16} />
                  <span className="text-[8px] font-bold uppercase tracking-wider hidden xs:inline">
                    Portal
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-red-600 border border-red-100 bg-red-50/50 rounded-lg transition-colors flex items-center gap-1"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                  <span className="text-[8px] font-bold uppercase tracking-wider hidden xs:inline">
                    Out
                  </span>
                </button>
              </>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--dark)",
                padding: "clamp(0.375rem, 2vw, 0.5rem)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "#fff",
              borderBottom: "1px solid var(--gray-200)",
              padding:
                "clamp(0.5rem, 3vw, 1.25rem) clamp(0.75rem, 4vw, 1.5rem)",
              animation: "fadeIn 0.2s ease",
              boxShadow: "var(--shadow-lg)",
              maxHeight: "calc(100vh - 70px)",
              overflowY: "auto",
            }}
          >
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(0.125rem, 1vw, 0.25rem)",
              }}
            >
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: "block",
                      padding:
                        "clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1rem)",
                      fontSize: "clamp(0.875rem, 2vw, 1rem)",
                      fontWeight: 500,
                      color: "var(--dark)",
                      borderRadius: "var(--radius)",
                      transition: "background var(--transition)",
                    }}
                    className="hover:bg-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div
              style={{
                marginTop: "clamp(0.75rem, 2vw, 1rem)",
                padding: "0 clamp(0.75rem, 3vw, 1rem)",
                borderTop: "1px solid var(--gray-100)",
                paddingTop: "clamp(0.75rem, 2vw, 1rem)",
              }}
            >
              {session ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "clamp(0.5rem, 2vw, 0.75rem)",
                    marginTop: "clamp(0.75rem, 2vw, 1rem)",
                  }}
                >
                  <Link
                    href={
                      (session.user as any).role === "admin"
                        ? "/admin"
                        : "/dashboard"
                    }
                    className="btn btn-outline"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding:
                        "clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)",
                      fontSize: "clamp(0.8rem, 2vw, 0.875rem)",
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    <span className="ml-1">Portal</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding:
                        "clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)",
                      fontSize: "clamp(0.8rem, 2vw, 0.875rem)",
                    }}
                  >
                    <LogOut size={16} />
                    <span className="ml-1">Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "clamp(0.75rem, 2vw, 1rem)",
                    padding:
                      "clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)",
                    fontSize: "clamp(0.8rem, 2vw, 0.875rem)",
                  }}
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
