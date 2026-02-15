"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, LogOut } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/contributions", label: "Contribute" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
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
    <footer style={{ background: "var(--dark)", color: "#fff" }}>
      <div className="flag-stripe" />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding:
            "clamp(2.5rem, 6vw, 4rem) clamp(1rem, 4vw, 1.5rem) clamp(1.5rem, 3vw, 2rem)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        {/* About Column */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <Image
              src="/images/pudemo_logo.png"
              alt="PUDEMO Logo"
              width={36}
              height={36}
              style={{ borderRadius: "50%" }}
            />
            <span style={{ fontWeight: 800, fontSize: "1.25rem" }}>
              <span style={{ color: "var(--primary)" }}>PU</span>DEMO
            </span>
          </div>
          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.7,
              color: "var(--gray-400)",
              maxWidth: 300,
            }}
          >
            The People&apos;s United Democratic Movement. Fighting for
            democracy, justice, and the liberation of Eswatini since 1983.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--secondary)",
              marginBottom: "1.25rem",
            }}
          >
            Quick Links
          </h4>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    fontSize: "0.938rem",
                    color: "var(--gray-400)",
                    transition: "color var(--transition)",
                  }}
                  className="hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              {session ? (
                <button
                  onClick={handleSignOut}
                  style={{
                    fontSize: "0.938rem",
                    color: "var(--red-400)",
                    transition: "color var(--transition)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  className="hover:text-red-300"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  style={{
                    fontSize: "0.938rem",
                    color: "var(--secondary)",
                    transition: "color var(--transition)",
                  }}
                  className="hover:text-white"
                >
                  Member Sign In
                </Link>
              )}
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--secondary)",
              marginBottom: "1.25rem",
            }}
          >
            Contact Us
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <MapPin
                size={18}
                style={{ color: "var(--primary)", marginTop: 2, flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--gray-400)",
                  lineHeight: 1.6,
                }}
              >
                P.O. Box 1000, Manzini, Eswatini
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <Phone
                size={18}
                style={{ color: "var(--primary)", flexShrink: 0 }}
              />
              <span style={{ fontSize: "0.875rem", color: "var(--gray-400)" }}>
                +268 2505 0000
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <Mail
                size={18}
                style={{ color: "var(--primary)", flexShrink: 0 }}
              />
              <span style={{ fontSize: "0.875rem", color: "var(--gray-400)" }}>
                info@pudemo.org
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid var(--dark-muted)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(0.75rem, 2vw, 1.25rem) clamp(1rem, 4vw, 1.5rem)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "clamp(0.5rem, 2vw, 0.75rem)",
          fontSize: "clamp(0.75rem, 2vw, 0.8125rem)",
          color: "var(--gray-500)",
        }}
      >
        <span>© {new Date().getFullYear()} PUDEMO. All rights reserved.</span>
        <span>Power to the People</span>
      </div>
    </footer>
  );
}
