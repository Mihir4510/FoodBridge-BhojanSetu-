// src/pages/ngo/NgoDrivers.jsx
// NGO manages drivers + shows login credentials after creation
// Drivers are onboarded by NGOs and provided login credentials
// to access the delivery dashboard at /driver/login

import { useEffect, useState } from "react";
import { getAllDrivers, registerDriver } from "../../service/driverApi";
import NgoLayout from "../../components/ngo/NgoLayout";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";

const DRIVER_LOGIN_URL = `${window.location.origin}/driver/login`;

const inputCls = (err) =>
  `w-full bg-white border rounded-xl px-4 py-3 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all ${
    err
      ? "border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-[#E5E7EB] focus:border-[#E76F1A] focus:ring-2 focus:ring-[#E76F1A]/10"
  }`;

// ── Copy to clipboard helper ──────────────────────────────
const useCopy = () => {
  const [copied, setCopied] = useState("");
  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  };
  return { copied, copy };
};

// ── Login Credential Card (shown after driver creation) ───
const CredentialCard = ({ driver, onDismiss }) => {
  const { copied, copy } = useCopy();

  const rows = [
    { label: "Login URL",  value: DRIVER_LOGIN_URL,  key: "url"      },
    { label: "Email",      value: driver.email,       key: "email"    },
    { label: "Password",   value: driver.phone,       key: "password" },
  ];

  return (
    <div className="bg-white border-2 border-[#2D6A4F] rounded-2xl p-6 shadow-md mb-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D8F3DC] rounded-xl flex items-center justify-center text-[20px]">
            ✅
          </div>
          <div>
            <p className="font-bold text-[15px] text-[#111827]">
              Driver created successfully!
            </p>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              Share these login credentials with <span className="font-semibold text-[#374151]">{driver.name}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#9CA3AF] hover:text-[#374151] text-[18px] leading-none transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Credential rows */}
      <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] overflow-hidden mb-4">
        <div className="px-4 py-2.5 bg-[#1A2E22]">
          <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">
            Driver Login Details
          </p>
        </div>
        {rows.map((row, i) => (
          <div
            key={row.key}
            className={`flex items-center justify-between px-4 py-3 ${
              i < rows.length - 1 ? "border-b border-[#E5E7EB]" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#9CA3AF] font-medium uppercase tracking-wide mb-0.5">
                {row.label}
              </p>
              <p className="text-[13px] font-semibold text-[#111827] truncate font-mono">
                {row.value}
              </p>
            </div>
            <button
              onClick={() => copy(row.value, row.key)}
              className={`ml-3 flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                copied === row.key
                  ? "bg-[#D8F3DC] text-[#1A4731]"
                  : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
              }`}
            >
              {copied === row.key ? "✓ Copied" : "⎘ Copy"}
            </button>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Copy all credentials */}
        <button
          onClick={() =>
            copy(
              `Driver Login Details\n--------------------\nURL:      ${DRIVER_LOGIN_URL}\nEmail:    ${driver.email}\nPassword: ${driver.phone}`,
              "all"
            )
          }
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
            copied === "all"
              ? "bg-[#D8F3DC] border-[#2D6A4F] text-[#1A4731]"
              : "bg-white border-[#E5E7EB] text-[#374151] hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
          }`}
        >
          {copied === "all" ? "✓ Copied all!" : "⎘ Copy All Credentials"}
        </button>

        {/* Open login page */}
        <button
          onClick={() => window.open("/driver/login", "_blank")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-[#E76F1A] text-white hover:bg-[#d4621a] transition-colors"
        >
          🚗 Open Driver Login Page
        </button>
      </div>

      {/* Tip */}
      <div className="mt-4 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-4 py-3 flex items-start gap-2.5">
        <span className="text-[16px] flex-shrink-0 mt-0.5">💡</span>
        <p className="text-[12px] text-[#92400E] leading-relaxed">
          Share the <strong>URL, email, and password</strong> with the driver via WhatsApp or SMS.
          The driver should change their password after first login.
          Default password is their phone number.
        </p>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────
const NgoDrivers = () => {
  const [drivers,     setDrivers]        = useState([]);
  const [loading,     setLoading]        = useState(true);
  const [showForm,    setShowForm]       = useState(false);
  const [submitting,  setSubmitting]     = useState(false);
  const [newDriver,   setNewDriver]      = useState(null); // shows credential card
  const { toasts, toast }               = useToast();
  const { copied: copiedUrl, copy: copyUrl } = useCopy();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", capacity: "50", city: "", lat: "", lng: "",
  });
  const [errors, setErrors] = useState({});

  const load = async () => {
    try {
      const res = await getAllDrivers();
      setDrivers(res.data?.drivers || []);
    } catch {
      toast.error("Failed to load drivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                          errs.name     = "Name required";
    if (!form.email.trim())                         errs.email    = "Email required";
    else if (!/\S+@\S+\.\S+/.test(form.email))     errs.email    = "Valid email required";
    if (!form.phone.trim())                         errs.phone    = "Phone required";
    if (!form.capacity || Number(form.capacity) <= 0) errs.capacity = "Valid capacity required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await registerDriver({
        name:     form.name,
        email:    form.email,
        phone:    form.phone,
        capacity: Number(form.capacity),
        city:     form.city,
        lat:      Number(form.lat) || 0,
        lng:      Number(form.lng) || 0,
      });

      // Show credential card with the just-created driver's info
      setNewDriver({ name: form.name, email: form.email, phone: form.phone });
      setForm({ name: "", email: "", phone: "", capacity: "50", city: "", lat: "", lng: "" });
      setShowForm(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to register driver.");
    } finally {
      setSubmitting(false);
    }
  };

  const available  = drivers.filter((d) => d.isAvailable);
  const onDelivery = drivers.filter((d) => !d.isAvailable);

  return (
    <NgoLayout title="Drivers" subtitle="Manage your delivery team.">
      <ToastContainer toasts={toasts} />

      {/* ── Credential card (shown after creation) ── */}
      {newDriver && (
        <CredentialCard driver={newDriver} onDismiss={() => setNewDriver(null)} />
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: "🚗", val: drivers.length,  label: "Total Drivers",  color: "text-[#E76F1A]" },
          { icon: "✅", val: available.length, label: "Available",      color: "text-[#2D6A4F]" },
          { icon: "📦", val: onDelivery.length, label: "On Delivery",   color: "text-[#2563EB]" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm text-center">
            <span className="text-[24px] block mb-2">{s.icon}</span>
            <p className={`font-bold text-[28px] ${s.color} leading-none`}>{s.val}</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Info banner ── */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl px-5 py-4 flex items-start gap-3 mb-6">
        <span className="text-[18px] mt-0.5">ℹ️</span>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-[#166534]">
            How driver onboarding works
          </p>
          <p className="text-[12px] text-[#166534]/80 mt-0.5 leading-relaxed">
            Drivers are onboarded by NGOs and provided login credentials to access the delivery dashboard.
            After creating a driver, share their email and phone-number password with them.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => window.open("/driver/login", "_blank")}
            className="flex items-center gap-1.5 bg-[#2D6A4F] text-white text-[12px] font-semibold px-3 py-2 rounded-xl hover:bg-[#245a42] transition-colors whitespace-nowrap"
          >
            🚗 Driver Login Page
          </button>
        </div>
      </div>

      {/* ── Header + Add button ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[17px] font-bold text-[#111827]">Your Drivers</h2>
          <p className="text-[12px] text-[#9CA3AF]">
            Login URL:
            <span className="font-mono text-[#2563EB] ml-1">{DRIVER_LOGIN_URL}</span>
            <button
              onClick={() => copyUrl(DRIVER_LOGIN_URL, "header-url")}
              className="ml-2 text-[11px] text-[#9CA3AF] hover:text-[#2D6A4F] transition-colors"
            >
              {copiedUrl === "header-url" ? "✓ Copied" : "⎘ copy"}
            </button>
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setNewDriver(null); }}
          className="flex items-center gap-2 bg-[#E76F1A] text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#d4621a] transition-colors"
        >
          {showForm ? "✕ Cancel" : "➕ Add Driver"}
        </button>
      </div>

      {/* ── Register form ── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm mb-6 space-y-4"
        >
          <h3 className="font-semibold text-[#111827] text-[15px]">Register New Driver</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "name",     label: "Full Name",              placeholder: "Driver's full name"  },
              { name: "email",    label: "Email Address",          placeholder: "driver@email.com"    },
              { name: "phone",    label: "Phone Number",           placeholder: "+91 98765 43210"     },
              { name: "capacity", label: "Capacity (kg / plates)", placeholder: "50"                 },
              { name: "city",     label: "City",                   placeholder: "Indore"             },
            ].map((f) => (
              <div key={f.name} className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">
                  {f.label} <span className="text-[#E76F1A]">*</span>
                </label>
                <input
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className={inputCls(errors[f.name])}
                />
                {errors[f.name] && (
                  <p className="text-[12px] text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors[f.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Password note */}
          <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-4 py-3 flex items-start gap-2.5">
            <span className="text-[16px] flex-shrink-0">🔑</span>
            <p className="text-[12px] text-[#92400E] leading-relaxed">
              <strong>Default password</strong> will be set to the driver's phone number.
              The driver can change it after logging in for the first time.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all ${
              submitting
                ? "bg-[#E76F1A]/60 cursor-not-allowed"
                : "bg-[#E76F1A] hover:bg-[#d4621a] hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(231,111,26,0.3)]"
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Registering driver...
              </span>
            ) : "➕ Register Driver"}
          </button>
        </form>
      )}

      {/* ── Driver list ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <svg className="animate-spin w-6 h-6 text-[#E76F1A]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
            <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p className="text-[13px] text-[#9CA3AF]">Loading drivers...</p>
        </div>
      ) : drivers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
          <p className="text-[44px] mb-3">🚗</p>
          <p className="text-[16px] font-semibold text-[#374151]">No drivers yet</p>
          <p className="text-[13px] text-[#9CA3AF] mt-1 max-w-xs mx-auto">
            Add your first driver to enable automatic donation assignment and route optimization.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex items-center gap-2 bg-[#E76F1A] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#d4621a] transition-colors"
          >
            ➕ Add First Driver
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {drivers.map((d) => (
            <DriverRow key={d._id} driver={d} />
          ))}
        </div>
      )}
    </NgoLayout>
  );
};

// ── Driver row card ────────────────────────────────────────
const DriverRow = ({ driver: d }) => {
  const { copied, copy } = useCopy();
  const [showCreds, setShowCreds] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 p-5">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E76F1A] to-[#F4A261] flex items-center justify-center text-white font-bold text-[16px] flex-shrink-0">
          {d.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[14px] text-[#111827]">{d.name}</p>
          <p className="text-[12px] text-[#9CA3AF]">{d.email} · {d.phone}</p>
          {d.currentDonationId && (
            <p className="text-[11px] text-[#2563EB] font-medium mt-0.5">
              📦 On delivery: {d.currentDonationId.title}
            </p>
          )}
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            d.isAvailable ? "bg-[#D8F3DC] text-[#1A4731]" : "bg-[#FEE2E2] text-[#7F1D1D]"
          }`}>
            {d.isAvailable ? "✅ Available" : "🚗 On Delivery"}
          </span>
          <p className="text-[11px] text-[#9CA3AF]">
            Cap: {d.capacity} · {d.totalDeliveries} deliveries
          </p>
        </div>

        {/* Show creds toggle */}
        <button
          onClick={() => setShowCreds(!showCreds)}
          className="ml-2 flex-shrink-0 text-[12px] font-semibold text-[#6B7280] hover:text-[#374151] border border-[#E5E7EB] px-3 py-1.5 rounded-lg hover:border-[#D1D5DB] transition-all"
        >
          {showCreds ? "Hide" : "🔑 Creds"}
        </button>
      </div>

      {/* Expandable credential panel */}
      {showCreds && (
        <div className="border-t border-[#F3F4F6] bg-[#FAFAFA] px-5 py-4">
          <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">
            Login Credentials
          </p>
          <div className="space-y-2">
            {[
              { label: "Login URL", value: DRIVER_LOGIN_URL, key: `url-${d._id}`   },
              { label: "Email",     value: d.email,          key: `em-${d._id}`    },
              { label: "Password",  value: d.phone,          key: `pw-${d._id}`    },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-3 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">{row.label}</p>
                  <p className="text-[12px] font-mono font-semibold text-[#111827] truncate">{row.value}</p>
                </div>
                <button
                  onClick={() => copy(row.value, row.key)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all flex-shrink-0 ${
                    copied === row.key
                      ? "bg-[#D8F3DC] text-[#1A4731]"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {copied === row.key ? "✓" : "⎘"}
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => copy(
                `Driver Login\nURL: ${DRIVER_LOGIN_URL}\nEmail: ${d.email}\nPassword: ${d.phone}`,
                `all-${d._id}`
              )}
              className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                copied === `all-${d._id}`
                  ? "bg-[#D8F3DC] border-[#2D6A4F] text-[#1A4731]"
                  : "bg-white border-[#E5E7EB] text-[#374151] hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
              }`}
            >
              {copied === `all-${d._id}` ? "✓ Copied all" : "⎘ Copy All"}
            </button>
            <button
              onClick={() => window.open("/driver/login", "_blank")}
              className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-[#E76F1A] text-white hover:bg-[#d4621a] transition-colors"
            >
              🚗 Open Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoDrivers;
