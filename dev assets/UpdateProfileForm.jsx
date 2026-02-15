import { useState, useCallback } from "react";

// ─── Mock Avatar Component (replace with your actual implementation) ───────────
function Avatar({ avatarUrl, onUpload }) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };
  return (
    <div className="avatar-wrapper">
      <div className="avatar-circle">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile avatar" className="avatar-img" />
        ) : (
          <span className="avatar-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </span>
        )}
      </div>
      <label className="upload-btn" htmlFor="avatar-upload">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z" />
          <path d="M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Change photo
      </label>
      <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
    </div>
  );
}

// ─── Field Components ──────────────────────────────────────────────────────────
function FormField({ label, id, required, children, className = "" }) {
  return (
    <div className={`field-group ${className}`}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="required-dot" aria-hidden="true">·</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "field-input";
const selectClass = "field-select";

// ─── Main Component ────────────────────────────────────────────────────────────
export default function UpdateProfileForm({
  profile = { membershipNumber: "MEM-2024-001" },
  session = { user: { email: "member@example.com" } },
  structures = [],
  countries = [],
  onSubmit,
  onSignOut,
}) {
  const [form, setForm] = useState({
    title: "Mr",
    firstName: "",
    lastName: "",
    gender: "Prefer not to say",
    identityNumber: "",
    dateOfBirth: "",
    branch: "",
    branchLocation: "",
    contactNumber: "",
    countryName: "",
    streetAddress: "",
    city: "",
    homeArea: "",
    postalCode: "",
    employment: "",
    companyName: "",
  });

  const [structureBranches, setStructureBranches] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const changeBranchLocation = useCallback(
    (e) => {
      const selected = structures.find((s) => s.structure === e.target.value);
      setStructureBranches(selected?.branches ?? []);
      setForm((prev) => ({ ...prev, branch: e.target.value, branchLocation: "" }));
    },
    [structures]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit?.({ ...form, avatarUrl });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pfm-root {
          font-family: 'Sora', sans-serif;
          background: #f7f6f3;
          min-height: 100vh;
          padding: 48px 24px 80px;
          color: #1a1a1a;
        }

        /* ── Layout shell ── */
        .pfm-shell {
          max-width: 960px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .pfm-shell { grid-template-columns: 1fr; gap: 24px; }
        }

        /* ── Sidebar ── */
        .pfm-sidebar {
          position: sticky;
          top: 40px;
        }
        .pfm-sidebar h2 {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: -0.01em;
          line-height: 1.4;
        }
        .pfm-sidebar p {
          margin-top: 6px;
          font-size: 12.5px;
          color: #6b6b6b;
          line-height: 1.55;
        }
        .member-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 16px;
          padding: 5px 10px;
          background: #1a1a1a;
          color: #f7f6f3;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.04em;
          border-radius: 4px;
        }
        .member-tag::before {
          content: '#';
          opacity: 0.45;
        }

        /* ── Card ── */
        .pfm-card {
          background: #fff;
          border: 1px solid #e5e3de;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04);
        }

        /* ── Section headers inside card ── */
        .section-header {
          padding: 20px 28px 0;
          border-top: 1px solid #f0ede8;
        }
        .section-header:first-child { border-top: none; padding-top: 28px; }
        .section-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a0998e;
        }

        /* ── Grid ── */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
          padding: 16px 28px 28px;
        }
        .col-2 { grid-column: span 2; }
        .col-3 { grid-column: span 3; }
        .col-6 { grid-column: span 6; }
        @media (max-width: 600px) {
          .col-2, .col-3 { grid-column: span 6; }
        }

        /* ── Field ── */
        .field-group { display: flex; flex-direction: column; gap: 6px; }
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

        .field-input,
        .field-select {
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
        .field-input:focus,
        .field-select:focus {
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
        .field-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b6b6b'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          padding-right: 32px;
          cursor: pointer;
        }

        /* ── Radio group ── */
        .employment-section {
          grid-column: span 6;
          padding: 20px;
          background: #f7f6f3;
          border-radius: 8px;
          border: 1.5px solid #e0ddd8;
        }
        .employment-title {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }
        .employment-sub {
          font-size: 12px;
          color: #6b6b6b;
          margin-bottom: 14px;
        }
        .radio-options { display: flex; gap: 16px; }
        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 500;
          color: #1a1a1a;
          padding: 8px 16px;
          border-radius: 6px;
          border: 1.5px solid #e0ddd8;
          background: #fff;
          transition: all 0.15s;
          user-select: none;
        }
        .radio-label:has(input:checked) {
          border-color: #1a1a1a;
          background: #1a1a1a;
          color: #fff;
        }
        .radio-label input[type="radio"] {
          display: none;
        }

        /* ── Avatar ── */
        .avatar-section {
          padding: 0 28px 28px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .avatar-wrapper { display: flex; align-items: center; gap: 16px; }
        .avatar-circle {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #f0ede8;
          border: 2px solid #e0ddd8;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder svg { width: 30px; height: 30px; color: #b5b0a8; }
        .upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          font-family: 'Sora', sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          color: #1a1a1a;
          background: #fff;
          border: 1.5px solid #e0ddd8;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .upload-btn:hover { border-color: #1a1a1a; background: #f7f6f3; }
        .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
        .photo-label {
          font-size: 12px;
          font-weight: 500;
          color: #4a4a4a;
          margin-bottom: 10px;
          display: block;
        }

        /* ── Footer ── */
        .pfm-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          padding: 16px 28px;
          background: #f7f6f3;
          border-top: 1px solid #e5e3de;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.01em;
        }
        .btn-save {
          background: #1a1a1a;
          color: #fff;
        }
        .btn-save:hover { background: #333; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-signout {
          background: transparent;
          color: #c0392b;
          border: 1.5px solid #e8c8c5;
        }
        .btn-signout:hover { background: #fdf3f2; border-color: #c0392b; }

        .spinner {
          width: 13px;
          height: 13px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          height: 1px;
          background: #f0ede8;
          margin: 0 28px;
        }

        /* Page title */
        .page-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.03em;
          margin-bottom: 4px;
        }
        .page-sub {
          font-size: 13px;
          color: #6b6b6b;
          margin-bottom: 40px;
        }
      `}</style>

      <div className="pfm-root">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 className="page-title">My Profile</h1>
          <p className="page-sub">Manage your personal information and account settings.</p>
        </div>

        <form className="pfm-shell" onSubmit={handleSubmit} noValidate>
          {/* ── Sidebar ── */}
          <aside className="pfm-sidebar">
            <h2>Personal Information</h2>
            <p>Use a personal email address for password recovery and notifications.</p>
            <div className="member-tag">{profile.membershipNumber}</div>
          </aside>

          {/* ── Card ── */}
          <div className="pfm-card">

            {/* Section: Identity */}
            <div className="section-header" style={{ paddingTop: 28 }}>
              <span className="section-title">Identity</span>
            </div>
            <div className="form-grid">
              <FormField label="Title" id="title" className="col-2">
                <select id="title" className={selectClass} value={form.title} onChange={set("title")}>
                  {["Mr", "Ms", "Mrs", "Dr", "Prof.", "Other"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="First name" id="first-name" required className="col-2">
                <input
                  type="text" id="first-name" className={inputClass}
                  autoComplete="given-name" placeholder="Jane"
                  value={form.firstName} onChange={set("firstName")}
                />
              </FormField>

              <FormField label="Last name" id="last-name" required className="col-2">
                <input
                  type="text" id="last-name" className={inputClass}
                  autoComplete="family-name" placeholder="Smith"
                  value={form.lastName} onChange={set("lastName")}
                />
              </FormField>

              <FormField label="Gender" id="gender" className="col-2">
                <select id="gender" className={selectClass} value={form.gender} onChange={set("gender")}>
                  {["Male", "Female", "Prefer not to say"].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="ID Number" id="id-number" className="col-2">
                <input
                  type="text" id="id-number" className={inputClass}
                  placeholder="000000 0000 000"
                  value={form.identityNumber} onChange={set("identityNumber")}
                />
              </FormField>

              <FormField label="Date of Birth" id="dateofbirth" className="col-2">
                <input
                  type="date" id="dateofbirth" className={inputClass}
                  value={form.dateOfBirth} onChange={set("dateOfBirth")}
                />
              </FormField>
            </div>

            <div className="divider" />

            {/* Section: Branch */}
            <div className="section-header">
              <span className="section-title">Branch</span>
            </div>
            <div className="form-grid">
              <FormField label="Branch Location" id="branchLocation" className="col-3">
                <select
                  id="branchLocation" className={selectClass}
                  value={form.branch} onChange={changeBranchLocation}
                >
                  <option value="">Choose Branch Location</option>
                  {structures.map((s) => (
                    <option key={s.structure} value={s.structure}>{s.structure}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Branch" id="branch" className="col-3">
                <select
                  id="branch" className={selectClass}
                  value={form.branchLocation} onChange={set("branchLocation")}
                >
                  <option value="">Choose Branch</option>
                  {structureBranches.map((b) => (
                    <option key={b.branch} value={b.branch}>{b.branch}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="divider" />

            {/* Section: Contact */}
            <div className="section-header">
              <span className="section-title">Contact</span>
            </div>
            <div className="form-grid">
              <FormField label="Email address" id="email-address" className="col-3">
                <input
                  type="email" id="email-address" className={inputClass}
                  autoComplete="email" value={session.user.email}
                  disabled aria-describedby="email-note"
                />
                <span id="email-note" style={{ fontSize: 11, color: "#a0998e" }}>
                  Email cannot be changed here
                </span>
              </FormField>

              <FormField label="Phone number" id="phone-number" className="col-3">
                <input
                  type="tel" id="phone-number" className={inputClass}
                  autoComplete="tel" placeholder="+27 00 000 0000"
                  value={form.contactNumber} onChange={set("contactNumber")}
                />
              </FormField>
            </div>

            <div className="divider" />

            {/* Section: Address */}
            <div className="section-header">
              <span className="section-title">Address</span>
            </div>
            <div className="form-grid">
              <FormField label="Current Country" id="country" className="col-3">
                <select
                  id="country" className={selectClass}
                  autoComplete="country-name"
                  value={form.countryName} onChange={set("countryName")}
                >
                  <option value="">Choose a Country</option>
                  {countries.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Home area / Street address" id="street-address" className="col-3">
                <input
                  type="text" id="street-address" className={inputClass}
                  autoComplete="street-address" placeholder="123 Main Street"
                  value={form.streetAddress} onChange={set("streetAddress")}
                />
              </FormField>

              <FormField label="City" id="city" className="col-2">
                <input
                  type="text" id="city" className={inputClass}
                  autoComplete="address-level2" placeholder="Cape Town"
                  value={form.city} onChange={set("city")}
                />
              </FormField>

              <FormField label="State / Province / Home Area" id="region" className="col-2">
                <input
                  type="text" id="region" className={inputClass}
                  autoComplete="address-level1" placeholder="Western Cape"
                  value={form.homeArea} onChange={set("homeArea")}
                />
              </FormField>

              <FormField label="ZIP / Postal code" id="postal-code" className="col-2">
                <input
                  type="text" id="postal-code" className={inputClass}
                  autoComplete="postal-code" placeholder="8001"
                  value={form.postalCode} onChange={set("postalCode")}
                />
              </FormField>
            </div>

            <div className="divider" />

            {/* Section: Employment */}
            <div className="section-header">
              <span className="section-title">Employment</span>
            </div>
            <div className="form-grid">
              <div className="employment-section">
                <p className="employment-title">Are you currently employed?</p>
                <p className="employment-sub">Please select your employment status.</p>
                <div className="radio-options" role="radiogroup" aria-label="Employment status">
                  {["Yes", "No"].map((val) => (
                    <label key={val} className="radio-label">
                      <input
                        type="radio" name="employment" value={val}
                        checked={form.employment === val}
                        onChange={set("employment")}
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              {form.employment === "Yes" && (
                <FormField label="Company name" id="company-name" className="col-3">
                  <input
                    type="text" id="company-name" className={inputClass}
                    autoComplete="organization" placeholder="Acme Corp"
                    value={form.companyName} onChange={set("companyName")}
                  />
                </FormField>
              )}
            </div>

            <div className="divider" />

            {/* Section: Photo */}
            <div className="section-header">
              <span className="section-title">Profile Photo</span>
            </div>
            <div className="avatar-section">
              <Avatar
                avatarUrl={avatarUrl}
                onUpload={(file) => setAvatarUrl(URL.createObjectURL(file))}
              />
            </div>

            {/* Footer */}
            <div className="pfm-footer">
              <button
                type="button" className="btn btn-signout"
                onClick={onSignOut}
              >
                Sign Out
              </button>
              <button
                type="submit" className="btn btn-save"
                disabled={saving}
              >
                {saving ? (
                  <><span className="spinner" /> Saving…</>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    Save changes
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </>
  );
}
