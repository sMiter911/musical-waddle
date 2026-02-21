"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { updateProfile, getMemberProfile } from "@/lib/actions/profile";
import styles from "@/styles/profile.module.css";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Structure {
  structure: string;
  branches: string[];
}

interface FormState {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  identityNumber: string;
  dateOfBirth: string;
  structure: string;
  branch: string;
  contactNumber: string;
  countryName: string;
  streetAddress: string;
  city: string;
  homeArea: string;
  postalCode: string;
  employment: string;
  companyName: string;
  avatarUrl?: string | null;
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const STRUCTURES: Structure[] = [
  { structure: "External Region", branches: ["Pretoria", "Midrand", "Johannesburg", "East Rand", "Pietermaritzburg", "Durban", "Nelspruit", "Barberton", "Pongola", "Piet Retief", "Maputo", "Witbank (Emalahleni)", "Western Europe"] },
  { structure: "Hhohho", branches: ["Siphocosini", "Motjane", "Makholokholo", "Nkaba", "Piggs Peak", "Ndzingeni", "Mhlangatane", "Mayiwane", "Ntfonjeni", "Msunduza"] },
  { structure: "Lubombo", branches: ["Siteki", "Mpaka", "Maphiveni", "Lomahasha", "Siphofaneni", "Mavelela", "Big Bend", "Lubulini", "Mpolonjeni", "Shewula", "Sthobela", "Sgcaweni"] },
  { structure: "Shiselweni", branches: ["Mahamba", "Bonginhlanhla", "Nhlangano", "Lavumisa", "Hlatsi", "Matsanjeni", "Hluti", "Methula", "Ndunaythini"] },
  { structure: "Manzini", branches: ["Ekhukhanyeni", "Sihhohhweni", "Mafutseni", "Macetjeni", "Manzini North", "Manzini South", "Matsapha", "Mbekelweni", "Ludzeludze", "Ntondozi", "Mankayane", "Usuthu"] },
];

const EMPTY_FORM: FormState = {
  title: "",
  firstName: "",
  lastName: "",
  gender: "",
  identityNumber: "",
  dateOfBirth: "",
  structure: "",
  branch: "",
  contactNumber: "",
  countryName: "Eswatini",
  streetAddress: "",
  city: "",
  homeArea: "",
  postalCode: "",
  employment: "No",
  companyName: "",
  avatarUrl: null,
};

// ─── Small helper components ───────────────────────────────────────────────────
function FormField({
  label,
  id,
  required,
  hint,
  children,
  className = "",
}: {
  label: string;
  id: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`field-group ${className}`}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="required-dot" aria-hidden="true">·</span>}
      </label>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="section-header">
      <span className="section-title">{title}</span>
    </div>
  );
}

function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

// ─── SVG Icons (self-contained, no extra dep) ──────────────────────────────────
const IconKey = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);
const IconCamera = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);
const IconSave = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MemberProfilePage() {
  const { data: session } = useSession();

  // Scroll refs
  const accountRef = useRef<HTMLElement>(null);
  const personalInfoRef = useRef<HTMLElement>(null);
  const branchAddressRef = useRef<HTMLElement>(null);
  const employmentRef = useRef<HTMLElement>(null);

  // Form & UI state
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [structureBranches, setStructureBranches] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({ type: "", text: "" });
  const [activeSection, setActiveSection] = useState("account");

  // Account update state
  const [accountName, setAccountName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingAccount, setUpdatingAccount] = useState(false);

  // ── Load profile ──
  const loadProfile = useCallback(async () => {
    const profile = await getMemberProfile();
    if (profile) {
      setForm({
        title: profile.title || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        gender: profile.gender || "",
        identityNumber: profile.identityNumber || "",
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
          : "",
        structure: profile.structure || "",
        branch: profile.branchName || "",
        contactNumber: profile.contactNumber || "",
        countryName: profile.countryName || "Eswatini",
        streetAddress: profile.streetAddress || "",
        city: profile.city || "",
        homeArea: profile.homeArea || "",
        postalCode: profile.postalCode || "",
        employment: profile.employment || "No",
        companyName: profile.companyName || "",
      });
      if (profile.structure) {
        const selected = STRUCTURES.find((s) => s.structure === profile.structure);
        setStructureBranches(selected?.branches ?? []);
      }
      if (profile.avatarUrl) {
        setAvatarUrl(profile.avatarUrl);
        setForm(prev => ({ ...prev, avatarUrl: profile.avatarUrl }));
      }
    }
    // Set account name from session
    if (session?.user?.name) {
      setAccountName(session.user.name);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ── Helpers ──
  const set =
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const changeStructure = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selected = STRUCTURES.find((s) => s.structure === val);
    setStructureBranches(selected?.branches ?? []);
    setForm((prev) => ({ ...prev, structure: val, branch: "" }));
  };

  const scrollTo = (ref: React.RefObject<HTMLElement | null>, section: string) => {
    setActiveSection(section);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => { window.location.href = "/"; },
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const result = await updateProfile({ ...form, avatarUrl });
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingAccount(true);
    setMessage({ type: "", text: "" });

    try {
      // Update name if changed
      if (accountName && accountName !== userName) {
        const response = await fetch("/api/auth/update-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: accountName }),
        });

        if (!response.ok) {
          throw new Error("Failed to update name");
        }
      }

      // Update password if provided
      if (currentPassword && newPassword) {
        if (newPassword !== confirmPassword) {
          setMessage({ type: "error", text: "New passwords do not match" });
          setUpdatingAccount(false);
          return;
        }

        if (newPassword.length < 8) {
          setMessage({ type: "error", text: "Password must be at least 8 characters" });
          setUpdatingAccount(false);
          return;
        }

        const response = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update password");
        }

        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setMessage({ type: "success", text: "Account updated successfully!" });
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Reload page to refresh session
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update account" });
    } finally {
      setUpdatingAccount(false);
    }
  };

  const membershipNumber = (session?.user as any)?.membershipNumber;
  const userEmail = session?.user?.email ?? "";
  const userName = session?.user?.name ?? "";

  // ── Nav items ──
  const navItems = [
    { id: "account", label: "Account", ref: accountRef, Icon: IconKey },
    { id: "personal", label: "Personal Info", ref: personalInfoRef, Icon: IconUser },
    { id: "branch", label: "Branch & Address", ref: branchAddressRef, Icon: IconMapPin },
    { id: "employment", label: "Employment", ref: employmentRef, Icon: IconBriefcase },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Root ── */
        .pfm-root {
          font-family: 'Sora', sans-serif;
          background: #f7f6f3;
          min-height: 100vh;
          padding: 56px 24px 96px;
          color: #1a1a1a;
        }
        .pfm-container { max-width: 1040px; margin: 0 auto; }

        /* ── Page header ── */
        .pfm-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #a0998e;
          text-decoration: none;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 20px;
          transition: color 0.15s;
        }
        .pfm-back:hover { color: #1a1a1a; }
        .pfm-back svg { width: 12px; height: 12px; }

        .pfm-title {
          font-size: 26px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.03em;
          margin-bottom: 4px;
        }
        .pfm-subtitle {
          font-size: 13.5px;
          color: #6b6b6b;
          margin-bottom: 0;
        }

        /* ── Toast ── */
        .pfm-toast {
          margin-top: 20px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pfm-toast.success {
          background: #f0faf4;
          border-color: #a8dfc1;
          color: #1a6640;
        }
        .pfm-toast.error {
          background: #fdf3f2;
          border-color: #e8c8c5;
          color: #c0392b;
        }
        .toast-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .success .toast-dot { background: #27ae60; }
        .error .toast-dot { background: #c0392b; }

        /* ── Layout shell ── */
        .pfm-layout {
          display: grid;
          grid-template-columns: 232px 1fr;
          gap: 40px;
          align-items: start;
          margin-top: 40px;
        }
        @media (max-width: 820px) {
          .pfm-layout { grid-template-columns: 1fr; }
        }

        /* ── Sidebar ── */
        .pfm-sidebar { position: sticky; top: 32px; }

        .sidebar-profile-card {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          padding: 24px 20px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.03);
          margin-bottom: 12px;
        }

        .avatar-ring {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 14px;
        }
        .avatar-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f0ede8;
          border: 2px solid #e0ddd8;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-circle svg { color: #c5bfb8; }
        .avatar-upload-btn {
          position: absolute;
          bottom: -2px; right: -2px;
          width: 26px; height: 26px;
          border-radius: 50%;
          background: #1a1a1a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2.5px solid #f7f6f3;
          transition: background 0.15s, transform 0.15s;
        }
        .avatar-upload-btn:hover { background: #333; transform: scale(1.1); }

        .sidebar-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .member-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 9px;
          background: #1a1a1a;
          color: #f7f6f3;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.05em;
          border-radius: 4px;
        }
        .member-tag::before { content: '#'; opacity: 0.4; }

        /* ── Sidebar nav ── */
        .sidebar-nav {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.03);
        }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #6b6b6b;
          background: none;
          border: none;
          border-left: 2.5px solid transparent;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }
        .sidebar-nav-item + .sidebar-nav-item { border-top: 1px solid #f0ede8; }
        .sidebar-nav-item:hover { color: #1a1a1a; background: #faf9f7; }
        .sidebar-nav-item.active {
          color: #1a1a1a;
          font-weight: 600;
          border-left-color: #1a1a1a;
          background: #f7f6f3;
        }
        .sidebar-nav-item.danger { color: #c0392b; }
        .sidebar-nav-item.danger:hover { background: #fdf3f2; }
        .sidebar-nav-divider { height: 1px; background: #f0ede8; }

        /* ── Form area ── */
        .pfm-sections { display: flex; flex-direction: column; gap: 24px; }

        /* ── Card ── */
        .pfm-card {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04);
        }

        /* ── Section header ── */
        .section-header {
          padding: 22px 28px 0;
          border-top: 1px solid #f0ede8;
        }
        .section-header:first-child { border-top: none; padding-top: 26px; }
        .section-title {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a0998e;
        }

        /* ── Form grid ── */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 18px;
          padding: 14px 28px 26px;
        }
        .col-2 { grid-column: span 2; }
        .col-3 { grid-column: span 3; }
        .col-4 { grid-column: span 4; }
        .col-6 { grid-column: span 6; }
        @media (max-width: 640px) {
          .col-2, .col-3, .col-4 { grid-column: span 6; }
          .form-grid { padding: 14px 18px 22px; }
        }

        /* ── Field ── */
        .field-group { display: flex; flex-direction: column; gap: 5px; }
        .field-label {
          font-size: 12px;
          font-weight: 500;
          color: #4a4a4a;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .required-dot { color: #e85d3a; font-size: 16px; line-height: 1; }
        .field-hint { font-size: 11px; color: #a0998e; }

        .field-input, .field-select {
          width: 100%;
          padding: 8px 12px;
          font-family: 'Sora', sans-serif;
          font-size: 13.5px;
          color: #1a1a1a;
          background: #faf9f7;
          border: 1.5px solid #e0ddd8;
          border-radius: 7px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          appearance: none;
          -webkit-appearance: none;
        }
        .field-input::placeholder { color: #b5b0a8; }
        .field-input:focus, .field-select:focus {
          border-color: #1a1a1a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(26,26,26,0.07);
        }
        .field-input:disabled {
          background: #f2f0ec;
          color: #9e9890;
          cursor: not-allowed;
          border-style: dashed;
        }
        .field-select:disabled {
          background: #f2f0ec;
          color: #9e9890;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .field-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b6b6b'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          padding-right: 32px;
          cursor: pointer;
        }

        /* ── Divider ── */
        .divider { height: 1px; background: #f0ede8; margin: 0 28px; }

        /* ── Employment radios ── */
        .employment-box {
          grid-column: span 6;
          padding: 18px 20px;
          background: #faf9f7;
          border-radius: 8px;
          border: 1.5px solid #e0ddd8;
        }
        .employment-question {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 3px;
        }
        .employment-hint {
          font-size: 12px;
          color: #6b6b6b;
          margin-bottom: 14px;
        }
        .radio-options { display: flex; gap: 10px; }
        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid #e0ddd8;
          border-radius: 7px;
          background: #fff;
          cursor: pointer;
          color: #6b6b6b;
          transition: all 0.15s;
          user-select: none;
        }
        .radio-label input[type="radio"] { display: none; }
        .radio-label:has(input:checked) {
          border-color: #1a1a1a;
          background: #1a1a1a;
          color: #fff;
        }

        /* ── Skeleton ── */
        .skeleton {
          background: linear-gradient(90deg, #f0ede8 25%, #e8e4df 50%, #f0ede8 75%);
          background-size: 200% 100%;
          border-radius: 6px;
          animation: shimmer 1.5s infinite;
          height: 36px;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        /* ── Footer actions ── */
        .pfm-footer-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          padding-top: 8px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.01em;
          text-decoration: none;
          padding: 9px 20px;
          border: none;
        }
        .btn-cancel {
          background: #fff;
          color: #6b6b6b;
          border: 1.5px solid #e0ddd8;
        }
        .btn-cancel:hover { border-color: #a0998e; color: #1a1a1a; }
        .btn-save {
          background: #1a1a1a;
          color: #fff;
          min-width: 160px;
          justify-content: center;
        }
        .btn-save:hover:not(:disabled) { background: #333; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Fade-in for conditional fields ── */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.2s ease; }

        .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
      `}</style>

      <div className="pfm-root">
        <div className="pfm-container">

          {/* ── Page header ── */}
          <Link href="/dashboard" className="pfm-back">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
            Dashboard
          </Link>
          <h1 className="pfm-title">Account Settings</h1>
          <p className="pfm-subtitle">Manage your member profile and personal details.</p>

          {message.text && (
            <div className={`pfm-toast ${message.type}`} role="alert">
              <span className="toast-dot" />
              {message.text}
            </div>
          )}

          {/* ── Main layout ── */}
          <form className="pfm-layout" onSubmit={handleSubmit} noValidate>

            {/* ── Sidebar ── */}
            <aside className="pfm-sidebar">
              <div className="sidebar-profile-card">
                <div className="avatar-ring">
                  <div className="avatar-circle">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="Profile photo" />
                      : <IconUser />
                    }
                  </div>
                  <label className="avatar-upload-btn" htmlFor="avatar-file" title="Change photo">
                    <IconCamera />
                    <input
                      id="avatar-file" type="file" accept="image/*" className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setAvatarUrl(base64String);
                          };
                          reader.readAsDataURL(f);
                        }
                      }}
                    />
                  </label>
                </div>
                {loading
                  ? <Skeleton style={{ width: 120, height: 14, margin: "0 auto 8px" }} />
                  : <div className="sidebar-name">{userName || "Member"}</div>
                }
                {membershipNumber && (
                  <div className="member-tag">{membershipNumber}</div>
                )}
              </div>

              <nav className="sidebar-nav" aria-label="Profile sections">
                {navItems.map(({ id, label, ref, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={`sidebar-nav-item ${activeSection === id ? "active" : ""}`}
                    onClick={() => scrollTo(ref, id)}
                  >
                    <Icon /> {label}
                  </button>
                ))}
                <div className="sidebar-nav-divider" />
                <button
                  type="button"
                  className="sidebar-nav-item danger"
                  onClick={handleSignOut}
                >
                  <IconLogOut /> Sign Out
                </button>
              </nav>
            </aside>

            {/* ── Form sections ── */}
            <div className="pfm-sections">

              {/* ── Account ── */}
              <section ref={accountRef} className="pfm-card" aria-labelledby="section-account">
                <SectionHeader title="Account Details" />
                <div className="form-grid">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="col-3"><Skeleton /></div>
                    ))
                  ) : (
                    <>
                      <FormField label="Display Name" id="account-name" className="col-3"
                        hint="This name will be shown on your profile">
                        <input type="text" id="account-name" className="field-input"
                          placeholder="Your name"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)} />
                      </FormField>

                      <FormField label="Email Address" id="account-email" className="col-3"
                        hint="Email cannot be changed">
                        <input type="email" id="account-email" className="field-input"
                          value={userEmail} disabled />
                      </FormField>
                    </>
                  )}
                </div>

                <div className="divider" />
                <SectionHeader title="Change Password" />
                <div className="form-grid">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="col-2"><Skeleton /></div>
                    ))
                  ) : (
                    <>
                      <FormField label="Current Password" id="current-password" className="col-2"
                        hint="Leave blank to keep current password">
                        <input type="password" id="current-password" className="field-input"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          autoComplete="current-password" />
                      </FormField>

                      <FormField label="New Password" id="new-password" className="col-2"
                        hint="Minimum 8 characters">
                        <input type="password" id="new-password" className="field-input"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          autoComplete="new-password" />
                      </FormField>

                      <FormField label="Confirm New Password" id="confirm-password" className="col-2">
                        <input type="password" id="confirm-password" className="field-input"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password" />
                      </FormField>
                    </>
                  )}
                </div>

                {/* Account update button */}
                {!loading && (accountName !== userName || currentPassword || newPassword || confirmPassword) && (
                  <div className="form-grid">
                    <div className="col-6" style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px" }}>
                      <button
                        type="button"
                        onClick={handleAccountUpdate}
                        className="btn btn-save"
                        disabled={updatingAccount}
                        style={{ minWidth: "180px" }}
                      >
                        {updatingAccount
                          ? <><span className="spinner" /> Updating…</>
                          : <><IconSave /> Update Account</>
                        }
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* ── Identity ── */}
              <section ref={personalInfoRef} className="pfm-card" aria-labelledby="section-identity">
                <SectionHeader title="Identity" />
                <div className="form-grid">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="col-2"><Skeleton /></div>
                    ))
                  ) : (
                    <>
                      <FormField label="Title" id="title" className="col-2">
                        <select id="title" className="field-select" value={form.title} onChange={set("title")}>
                          <option value="">Select</option>
                          {["Mr", "Ms", "Mrs", "Dr", "Prof.", "Other"].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="First name" id="first-name" required className="col-2">
                        <input type="text" id="first-name" className="field-input"
                          autoComplete="given-name" placeholder="Jane"
                          value={form.firstName} onChange={set("firstName")} />
                      </FormField>

                      <FormField label="Last name" id="last-name" required className="col-2">
                        <input type="text" id="last-name" className="field-input"
                          autoComplete="family-name" placeholder="Smith"
                          value={form.lastName} onChange={set("lastName")} />
                      </FormField>

                      <FormField label="Gender" id="gender" className="col-2">
                        <select id="gender" className="field-select" value={form.gender} onChange={set("gender")}>
                          <option value="">Select</option>
                          {["Male", "Female", "Other", "Prefer not to say"].map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="ID Number" id="id-number" className="col-2">
                        <input type="text" id="id-number" className="field-input"
                          placeholder="000000 0000 000"
                          value={form.identityNumber} onChange={set("identityNumber")} />
                      </FormField>

                      <FormField label="Date of Birth" id="dateofbirth" className="col-2">
                        <input type="date" id="dateofbirth" className="field-input"
                          value={form.dateOfBirth} onChange={set("dateOfBirth")} />
                      </FormField>
                    </>
                  )}
                </div>

                <div className="divider" />
                <SectionHeader title="Contact" />
                <div className="form-grid">
                  {loading ? (
                    <>
                      <div className="col-3"><Skeleton /></div>
                      <div className="col-3"><Skeleton /></div>
                    </>
                  ) : (
                    <>
                      <FormField label="Email address" id="email-address" className="col-3"
                        hint="Email cannot be changed here">
                        <input type="email" id="email-address" className="field-input"
                          autoComplete="email" value={userEmail} disabled />
                      </FormField>

                      <FormField label="Phone number" id="phone-number" className="col-3">
                        <input type="tel" id="phone-number" className="field-input"
                          autoComplete="tel" placeholder="+268 0000 0000"
                          value={form.contactNumber} onChange={set("contactNumber")} />
                      </FormField>
                    </>
                  )}
                </div>
              </section>

              {/* ── Branch & Address ── */}
              <section ref={branchAddressRef} className="pfm-card" aria-labelledby="section-branch">
                <SectionHeader title="Branch" />
                <div className="form-grid">
                  {loading ? (
                    <>
                      <div className="col-3"><Skeleton /></div>
                      <div className="col-3"><Skeleton /></div>
                    </>
                  ) : (
                    <>
                      <FormField label="Regional Structure" id="structure" className="col-3">
                        <select id="structure" className="field-select"
                          value={form.structure} onChange={changeStructure}>
                          <option value="">Select Structure</option>
                          {STRUCTURES.map((s) => (
                            <option key={s.structure} value={s.structure}>{s.structure}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Branch" id="branch" className="col-3">
                        <select id="branch" className="field-select"
                          value={form.branch} onChange={set("branch")}
                          disabled={!form.structure}>
                          <option value="">Select Branch</option>
                          {structureBranches.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </FormField>
                    </>
                  )}
                </div>

                <div className="divider" />
                <SectionHeader title="Address" />
                <div className="form-grid">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={i < 2 ? "col-3" : "col-2"}><Skeleton /></div>
                    ))
                  ) : (
                    <>
                      <FormField label="Country" id="country" className="col-3">
                        <input type="text" id="country" className="field-input"
                          autoComplete="country-name" placeholder="Eswatini"
                          value={form.countryName} onChange={set("countryName")} />
                      </FormField>

                      <FormField label="City" id="city" className="col-3">
                        <input type="text" id="city" className="field-input"
                          autoComplete="address-level2" placeholder="Mbabane"
                          value={form.city} onChange={set("city")} />
                      </FormField>

                      <FormField label="Street Address / Home Area" id="street-address" className="col-6">
                        <input type="text" id="street-address" className="field-input"
                          autoComplete="street-address" placeholder="123 Main Street"
                          value={form.streetAddress} onChange={set("streetAddress")} />
                      </FormField>

                      <FormField label="State / Province" id="region" className="col-2">
                        <input type="text" id="region" className="field-input"
                          autoComplete="address-level1"
                          value={form.homeArea} onChange={set("homeArea")} />
                      </FormField>

                      <FormField label="ZIP / Postal code" id="postal-code" className="col-2">
                        <input type="text" id="postal-code" className="field-input"
                          autoComplete="postal-code" placeholder="H100"
                          value={form.postalCode} onChange={set("postalCode")} />
                      </FormField>
                    </>
                  )}
                </div>
              </section>

              {/* ── Employment ── */}
              <section ref={employmentRef} className="pfm-card" aria-labelledby="section-employment">
                <SectionHeader title="Employment" />
                <div className="form-grid">
                  {loading ? (
                    <div className="col-6"><Skeleton style={{ height: 100 }} /></div>
                  ) : (
                    <>
                      <div className="employment-box">
                        <p className="employment-question">Are you currently employed?</p>
                        <p className="employment-hint">Please select your employment status.</p>
                        <div className="radio-options" role="radiogroup" aria-label="Employment status">
                          {["Yes", "No"].map((val) => (
                            <label key={val} className="radio-label">
                              <input type="radio" name="employment" value={val}
                                checked={form.employment === val}
                                onChange={set("employment")} />
                              {val}
                            </label>
                          ))}
                        </div>
                      </div>

                      {form.employment === "Yes" && (
                        <FormField label="Company / Organization name" id="company-name"
                          className="col-4 fade-in">
                          <input type="text" id="company-name" className="field-input"
                            autoComplete="organization" placeholder="Acme Corp"
                            value={form.companyName} onChange={set("companyName")} />
                        </FormField>
                      )}
                    </>
                  )}
                </div>
              </section>

              {/* ── Footer actions ── */}
              <div className="pfm-footer-actions">
                <Link href="/dashboard" className="btn btn-cancel">Cancel</Link>
                <button type="submit" className="btn btn-save" disabled={saving || loading}>
                  {saving
                    ? <><span className="spinner" /> Saving…</>
                    : <><IconSave /> Save changes</>
                  }
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}