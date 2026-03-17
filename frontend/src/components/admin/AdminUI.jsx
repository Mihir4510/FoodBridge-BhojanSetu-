// src/components/admin/AdminUI.jsx
// Reusable UI primitives for admin pages

// ── Stat Card ─────────────────────────────────────────────
export const StatCard = ({ icon, label, value, sub, color = "green" }) => {
  const palette = {
    green:  { bg: "bg-[#D8F3DC]", text: "text-[#1A4731]",  val: "text-[#2D6A4F]"  },
    orange: { bg: "bg-[#FDE8D5]", text: "text-[#7C2D12]",  val: "text-[#E76F1A]"  },
    blue:   { bg: "bg-[#DBEAFE]", text: "text-[#1E3A5F]",  val: "text-[#2563EB]"  },
    red:    { bg: "bg-[#FEE2E2]", text: "text-[#7F1D1D]",  val: "text-[#DC2626]"  },
    purple: { bg: "bg-[#EDE9FE]", text: "text-[#4C1D95]",  val: "text-[#7C3AED]"  },
  };
  const p = palette[color] || palette.green;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${p.bg} rounded-xl flex items-center justify-center text-[20px]`}>
          {icon}
        </div>
      </div>
      <p className={`font-playfair text-[34px] font-bold ${p.val} leading-none mb-1`}>{value}</p>
      <p className="text-[13px] font-semibold text-[#374151]">{label}</p>
      {sub && <p className="text-[11px] text-[#9CA3AF] mt-0.5">{sub}</p>}
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────
export const Badge = ({ status }) => {
  const map = {
    pending:   "bg-[#FEF3C7] text-[#92400E]",
    accepted:  "bg-[#DBEAFE] text-[#1E40AF]",
    collected: "bg-[#D8F3DC] text-[#1A4731]",
    expired:   "bg-[#FEE2E2] text-[#7F1D1D]",
    approved:  "bg-[#D8F3DC] text-[#1A4731]",
    rejected:  "bg-[#FEE2E2] text-[#7F1D1D]",
    high:      "bg-[#FEE2E2] text-[#7F1D1D]",
    medium:    "bg-[#FEF3C7] text-[#92400E]",
    low:       "bg-[#D8F3DC] text-[#1A4731]",
    individual:"bg-[#EDE9FE] text-[#4C1D95]",
    organization:"bg-[#FDE8D5] text-[#7C2D12]",
    restaurant:"bg-[#DBEAFE] text-[#1E40AF]",
  };
  const cls = map[status?.toLowerCase()] || "bg-[#F3F4F6] text-[#6B7280]";
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${cls}`}>
      {status}
    </span>
  );
};

// ── Spinner ───────────────────────────────────────────────
export const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="flex flex-col items-center gap-3">
      <svg className="animate-spin w-8 h-8 text-[#2D6A4F]" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
        <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="text-[13px] text-[#9CA3AF]">Loading data...</p>
    </div>
  </div>
);

// ── Empty state ───────────────────────────────────────────
export const Empty = ({ message = "No data found" }) => (
  <div className="text-center py-14">
    <p className="text-[40px] mb-3">📭</p>
    <p className="text-[14px] text-[#9CA3AF]">{message}</p>
  </div>
);

// ── Error banner ──────────────────────────────────────────
export const ErrorBanner = ({ message }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2 mb-6">
    <span>⚠️</span> {message}
  </div>
);

// ── Table wrapper ─────────────────────────────────────────
export const Table = ({ headers, children, empty }) => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#F3F4F6] bg-[#F9FAFB]">
            {headers.map((h) => (
              <th key={h} className="px-5 py-3.5 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
    {empty}
  </div>
);

// ── Table row ─────────────────────────────────────────────
export const Tr = ({ children, even }) => (
  <tr className={`border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors last:border-0 ${even ? "bg-[#FAFAFA]/50" : ""}`}>
    {children}
  </tr>
);

export const Td = ({ children, className = "" }) => (
  <td className={`px-5 py-3.5 text-[13px] text-[#374151] ${className}`}>{children}</td>
);
