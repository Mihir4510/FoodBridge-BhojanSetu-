// src/components/donor/DonorUI.jsx
// Reusable primitives for the Donor Dashboard

// ── Stat card ─────────────────────────────────────────────
export const StatCard = ({ icon, label, value, color = "green" }) => {
  const palette = {
    green:  { bg: "bg-[#D8F3DC]", text: "text-[#1A4731]", val: "text-[#2D6A4F]"  },
    orange: { bg: "bg-[#FDE8D5]", text: "text-[#7C2D12]", val: "text-[#E76F1A]"  },
    blue:   { bg: "bg-[#DBEAFE]", text: "text-[#1E3A5F]", val: "text-[#2563EB]"  },
    red:    { bg: "bg-[#FEE2E2]", text: "text-[#7F1D1D]", val: "text-[#DC2626]"  },
  };
  const p = palette[color] || palette.green;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className={`w-10 h-10 ${p.bg} rounded-xl flex items-center justify-center text-[20px] mb-4`}>
        {icon}
      </div>
      <p className={`font-playfair text-[32px] font-bold ${p.val} leading-none mb-1`}>{value ?? "—"}</p>
      <p className="text-[13px] font-semibold text-[#6B7280]">{label}</p>
    </div>
  );
};

// ── Status badge ──────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    pending:   "bg-[#FEF3C7] text-[#92400E]",
    accepted:  "bg-[#DBEAFE] text-[#1E40AF]",
    collected: "bg-[#D8F3DC] text-[#1A4731]",
    expired:   "bg-[#FEE2E2] text-[#7F1D1D]",
    active:    "bg-[#D8F3DC] text-[#1A4731]",
  };
  const cls = map[status?.toLowerCase()] || "bg-[#F3F4F6] text-[#6B7280]";
  const icons = { pending: "🟡", accepted: "🔵", collected: "🟢", expired: "🔴", active: "🟢" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${cls}`}>
      <span className="text-[10px]">{icons[status?.toLowerCase()] || "⚪"}</span>
      {status}
    </span>
  );
};

// ── Priority badge ─────────────────────────────────────────
export const PriorityBadge = ({ priority }) => {
  const map = {
    high:   "bg-[#FEE2E2] text-[#7F1D1D]",
    medium: "bg-[#FEF3C7] text-[#92400E]",
    low:    "bg-[#D8F3DC] text-[#1A4731]",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${map[priority] || map.low}`}>
      {priority || "low"}
    </span>
  );
};

// ── Spinner ───────────────────────────────────────────────
export const Spinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <svg className="animate-spin w-8 h-8 text-[#2D6A4F]" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
    <p className="text-[13px] text-[#9CA3AF]">{message}</p>
  </div>
);

// ── Empty state ───────────────────────────────────────────
export const EmptyState = ({ icon = "📭", title = "Nothing here yet", subtitle = "" }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-[48px] mb-4">{icon}</span>
    <p className="text-[16px] font-semibold text-[#374151] mb-1">{title}</p>
    {subtitle && <p className="text-[13px] text-[#9CA3AF] max-w-xs">{subtitle}</p>}
  </div>
);

// ── Input field ───────────────────────────────────────────
export const FormField = ({ label, error, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-semibold text-[#374151]">
      {label}{required && <span className="text-[#E76F1A] ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[12px] text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>}
  </div>
);

export const inputCls = (error) =>
  `w-full bg-white border rounded-xl px-4 py-3 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all duration-200 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-[#E5E7EB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10"
  }`;

// ── Section header ────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h2 className="text-[18px] font-bold text-[#111827]">{title}</h2>
      {subtitle && <p className="text-[13px] text-[#9CA3AF] mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ── Countdown timer ───────────────────────────────────────
import { useState, useEffect } from "react";

export const Countdown = ({ expiryTime }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgent, setUrgent]     = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiryTime) - new Date();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setUrgent(diff < 3600000 * 3);
      setTimeLeft(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [expiryTime]);

  return (
    <span className={`text-[11px] font-semibold ${urgent ? "text-red-500" : "text-[#9CA3AF]"}`}>
      {urgent && timeLeft !== "Expired" ? "⚠ " : "🕐 "}{timeLeft}
    </span>
  );
};
