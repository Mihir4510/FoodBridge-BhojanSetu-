// src/components/ngo/NgoUI.jsx

// ✅ New statuses: pending, accepted, assigned, picked_up, completed, expired

import { useState, useEffect } from "react";

// ── Stat Card ─────────────────────────────────────────────
export const StatCard = ({ icon, label, value, color = "green", sub }) => {
  const palette = {
    green:  { bg: "bg-[#D8F3DC]", val: "text-[#2D6A4F]"  },
    orange: { bg: "bg-[#FDE8D5]", val: "text-[#E76F1A]"  },
    blue:   { bg: "bg-[#DBEAFE]", val: "text-[#2563EB]"  },
    red:    { bg: "bg-[#FEE2E2]", val: "text-[#DC2626]"  },
    purple: { bg: "bg-[#EDE9FE]", val: "text-[#7C3AED]"  },
    teal:   { bg: "bg-[#CCFBF1]", val: "text-[#0F766E]"  },
  };
  const p = palette[color] || palette.green;
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className={`w-10 h-10 ${p.bg} rounded-xl flex items-center justify-center text-[20px] mb-4`}>
        {icon}
      </div>
      <p className={`font-playfair text-[32px] font-bold ${p.val} leading-none mb-1`}>{value ?? "—"}</p>
      <p className="text-[13px] font-semibold text-[#6B7280]">{label}</p>
      {sub && <p className="text-[11px] text-[#9CA3AF] mt-0.5">{sub}</p>}
    </div>
  );
};

// ── Status Badge ───────────────────────────────────────────
// ✅ Maps all 6 valid statuses
// ❌ No "collected"
export const StatusBadge = ({ status }) => {
  const map = {
    pending:   { cls: "bg-[#FEF3C7] text-[#92400E]", icon: "🟡", label: "Pending"   },
    accepted:  { cls: "bg-[#DBEAFE] text-[#1E40AF]", icon: "✅", label: "Accepted"  },
    assigned:  { cls: "bg-[#EDE9FE] text-[#4C1D95]", icon: "🚗", label: "Assigned"  },
    picked_up: { cls: "bg-[#FEF3C7] text-[#92400E]", icon: "📦", label: "In Transit"},
    completed: { cls: "bg-[#D8F3DC] text-[#1A4731]", icon: "✅", label: "Completed" },
    expired:   { cls: "bg-[#FEE2E2] text-[#7F1D1D]", icon: "⏰", label: "Expired"   },
  };
  const s = map[status] || { cls: "bg-[#F3F4F6] text-[#6B7280]", icon: "⚪", label: status };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
};

// ── Priority Badge ─────────────────────────────────────────
export const PriorityBadge = ({ priority }) => {
  const map = {
    high:   { cls: "bg-[#FEE2E2] text-[#7F1D1D]", icon: "🔴" },
    medium: { cls: "bg-[#FEF3C7] text-[#92400E]", icon: "🟡" },
    low:    { cls: "bg-[#D8F3DC] text-[#1A4731]", icon: "🟢" },
  };
  const p = map[priority?.toLowerCase()] || map.low;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${p.cls}`}>
      {p.icon} {priority || "low"}
    </span>
  );
};

// ── Countdown ──────────────────────────────────────────────
export const Countdown = ({ expiryTime }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgent,   setUrgent]   = useState(false);
  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiryTime) - new Date();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setUrgent(h < 3);
      setTimeLeft(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
    };
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [expiryTime]);
  return (
    <span className={`text-[11px] font-semibold flex items-center gap-1 ${urgent && timeLeft !== "Expired" ? "text-red-500 animate-pulse" : "text-[#9CA3AF]"}`}>
      {urgent && timeLeft !== "Expired" ? "⚠️" : "🕐"} {timeLeft}
    </span>
  );
};

// ── Spinner ────────────────────────────────────────────────
export const Spinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <svg className="animate-spin w-8 h-8 text-[#2D6A4F]" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
      <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
    <p className="text-[13px] text-[#9CA3AF]">{message}</p>
  </div>
);

// ── Empty State ────────────────────────────────────────────
export const EmptyState = ({ icon = "📭", title = "Nothing here", subtitle = "" }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-[48px] mb-4">{icon}</span>
    <p className="text-[16px] font-semibold text-[#374151] mb-1">{title}</p>
    {subtitle && <p className="text-[13px] text-[#9CA3AF] max-w-xs">{subtitle}</p>}
  </div>
);


