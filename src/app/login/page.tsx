"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn.email(
        {
          email,
          password,
          callbackURL: "/dashboard",
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message || "Invalid email or password");
          },
        },
      );
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    await signIn.social({ provider });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(1rem, 4vw, 2rem)",
        background: "linear-gradient(135deg, var(--light) 0%, #f0f0f0 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "#fff",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2rem)",
            background:
              "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-block",
              width: "48px",
              height: "48px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <Mail size={24} />
          </div>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 4vw, 1.875rem)",
              fontWeight: "700",
              marginBottom: "0.5rem",
              margin: 0,
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              fontSize: "clamp(0.875rem, 2vw, 0.938rem)",
              opacity: 0.9,
              margin: 0,
            }}
          >
            Sign in to your member dashboard
          </p>
        </div>

        {/* Form Container */}
        <div style={{ padding: "clamp(2rem, 5vw, 2.5rem)" }}>
          {error && (
            <div
              style={{
                background: "#fee",
                border: "1px solid #fcc",
                color: "#c33",
                padding: "clamp(0.75rem, 2vw, 1rem)",
                borderRadius: "var(--radius-lg)",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "clamp(1rem, 3vw, 1.5rem)",
              }}
            >
              {error}
            </div>
          )}

          {/* Social Login Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(0.75rem, 2vw, 1rem)",
              marginBottom: "clamp(1.5rem, 4vw, 2rem)",
            }}
          >
            <button
              onClick={() => handleSocialLogin("google")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)",
                border: "1px solid #ddd",
                borderRadius: "var(--radius-lg)",
                background: "#fff",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "clamp(0.875rem, 1.5vw, 0.938rem)",
                transition: "all var(--transition)",
                boxShadow: "var(--shadow-sm)",
              }}
              className="hover:shadow-md hover:border-gray-400"
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "var(--shadow-md)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "var(--shadow-sm)")
              }
            >
              <svg
                style={{ width: "20px", height: "20px" }}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => handleSocialLogin("facebook")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)",
                border: "1px solid #1877F2",
                borderRadius: "var(--radius-lg)",
                background: "#007BFF",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "clamp(0.875rem, 1.5vw, 0.938rem)",
                transition: "all var(--transition)",
                boxShadow: "0 2px 8px rgba(24, 119, 242, 0.2)",
              }}
              className="hover:shadow-md"
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(24, 119, 242, 0.3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(24, 119, 242, 0.2)")
              }
            >
              <svg
                style={{ width: "20px", height: "20px", fill: "#fff" }}
                viewBox="0 0 24 24"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5c-.563-.074-1.396-.146-2.515-.146-2.82 0-4.685 1.721-4.685 4.905v2.241z"></path>
              </svg>
              Continue with Facebook
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              position: "relative",
              marginBottom: "clamp(1.5rem, 4vw, 2rem)",
            }}
          >
            <div style={{ height: "1px", background: "#ddd" }}></div>
            <span
              style={{
                position: "absolute",
                top: "-0.5rem",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#fff",
                padding: "0 1rem",
                fontSize: "0.813rem",
                fontWeight: "700",
                textTransform: "uppercase",
                color: "var(--gray-400)",
                letterSpacing: "0.05em",
              }}
            >
              Or Email
            </span>
          </div>

          {/* Form */}
          <form
            onSubmit={handleEmailLogin}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(1rem, 3vw, 1.5rem)",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "var(--gray-700)",
                  marginBottom: "0.5rem",
                }}
                htmlFor="email"
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--gray-400)",
                    width: "18px",
                    height: "18px",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="email"
                  id="email"
                  style={{
                    width: "100%",
                    padding:
                      "clamp(0.75rem, 2vw, 0.938rem) clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 2vw, 0.938rem) clamp(2.5rem, 6vw, 3rem)",
                    fontSize: "0.938rem",
                    border: "1px solid var(--gray-300)",
                    borderRadius: "var(--radius-lg)",
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "all var(--transition)",
                  }}
                  placeholder="yours@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--primary)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--gray-300)")
                  }
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "var(--gray-700)",
                  marginBottom: "0.5rem",
                }}
                htmlFor="password"
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--gray-400)",
                    width: "18px",
                    height: "18px",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="password"
                  id="password"
                  style={{
                    width: "100%",
                    padding:
                      "clamp(0.75rem, 2vw, 0.938rem) clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 2vw, 0.938rem) clamp(2.5rem, 6vw, 3rem)",
                    fontSize: "0.938rem",
                    border: "1px solid var(--gray-300)",
                    borderRadius: "var(--radius-lg)",
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "all var(--transition)",
                  }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--primary)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--gray-300)")
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: "clamp(0.8rem, 2vw, 1rem)",
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-lg)",
                fontSize: "clamp(0.9rem, 2vw, 1rem)",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all var(--transition)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "clamp(0.5rem, 2vw, 1rem)",
              }}
              disabled={loading}
              className="hover:shadow-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div
          style={{
            padding: "clamp(1.5rem, 4vw, 2rem)",
            borderTop: "1px solid var(--gray-100)",
            textAlign: "center",
            fontSize: "clamp(0.813rem, 1.5vw, 0.875rem)",
            color: "var(--gray-600)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            style={{
              color: "var(--primary)",
              fontWeight: "700",
              textDecoration: "none",
            }}
            className="hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
