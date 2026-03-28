// src/components/ngo/NgoUI.jsx
// Reusable UI primitives for NGO Dashboard

import { useState, useEffect, useRef } from "react";

// ── Stat Card ─────────────────────────────────────────────
export const StatCard = ({ icon, label, value, color = "green", sub }) => {
  const palette = {
    green:  { bg: "bg-[#D8F3DC]", val: "text-[#2D6A4F]"  },
    orange: { bg: "bg-[#FDE8D5]", val: "text-[#E76F1A]"  },
    blue:   { bg: "bg-[#DBEAFE]", val: "text-[#2563EB]"  },
    red:    { bg: "bg-[#FEE2E2]", val: "text-[#DC2626]"  },
    purple: { bg: "bg-[#EDE9FE]", val: "text-[#7C3AED]"  },
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

// ── Priority Badge ─────────────────────────────────────────
export const PriorityBadge = ({ priority }) => {
  const map = {
    high:   { cls: "bg-[#FEE2E2] text-[#7F1D1D]", icon: "🔴", label: "High"   },
    medium: { cls: "bg-[#FEF3C7] text-[#92400E]", icon: "🟡", label: "Medium" },
    low:    { cls: "bg-[#D8F3DC] text-[#1A4731]", icon: "🟢", label: "Low"    },
  };
  const p = map[priority?.toLowerCase()] || map.low;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${p.cls}`}>
      {p.icon} {p.label}
    </span>
  );
};

// ── Status Badge ───────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    pending:   "bg-[#FEF3C7] text-[#92400E]",
    accepted:  "bg-[#D8F3DC] text-[#1A4731]",
    collected: "bg-[#DBEAFE] text-[#1E40AF]",
    rejected:  "bg-[#FEE2E2] text-[#7F1D1D]",
    expired:   "bg-[#F3F4F6] text-[#6B7280]",
  };
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] || map.pending}`}>
      {status}
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
      setUrgent(diff < 3600000 * 3);
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

// ── Distance calculator (Haversine) ───────────────────────
export const calcDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

// ── Convert GeoJSON [lng,lat] → {lat,lng} ─────────────────
export const toLatLng = (coordinates) => {
  if (!coordinates || coordinates.length < 2) return null;
  return { lat: coordinates[1], lng: coordinates[0] };
};
