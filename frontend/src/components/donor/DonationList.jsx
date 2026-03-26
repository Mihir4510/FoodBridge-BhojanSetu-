// src/components/donor/DonationList.jsx
// Note: Edit & Delete removed — your backend has no PUT /update or DELETE routes.
// Only status display is shown. Add those routes to backend to re-enable.

import { StatusBadge, PriorityBadge, EmptyState, Countdown } from "./DonorUI";

// ── Single donation card ──────────────────────────────────
const DonationCard = ({ donation }) => {
  const d = donation;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="font-bold text-[#111827] text-[15px] truncate">{d.title}</h3>
            <span className="text-[14px]">{d.foodType === "veg" ? "🥦" : "🍗"}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={d.status} />
            <PriorityBadge priority={d.priority} />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-playfair text-[22px] font-bold text-[#2D6A4F] leading-none">
            {d.quantity}
          </p>
          <p className="text-[11px] text-[#9CA3AF] capitalize">{d.unit || "plates"}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
          <span>📍</span>
          <span className="truncate">{d.pickupAddress || d.address || "—"}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
            <span>📅</span>
            <span>
              {d.createdAt
                ? new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "—"}
            </span>
          </div>
          {d.expiryTime && !["collected", "expired"].includes(d.status) && (
            <Countdown expiryTime={d.expiryTime} />
          )}
        </div>

        {d.contactNumber && (
          <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
            <span>📞</span>
            <span>{d.contactNumber}</span>
          </div>
        )}

        {/* NGO accepted */}
        {d.organization && (
          <div className="flex items-center gap-2 text-[12px] text-[#2563EB] font-semibold bg-[#EFF6FF] rounded-lg px-3 py-2 mt-1">
            <span>🏠</span>
            <span>Accepted by: {d.organization?.name || "NGO"}</span>
          </div>
        )}

        {d.notes && (
          <div className="flex items-start gap-2 text-[12px] text-[#9CA3AF] italic mt-1">
            <span className="mt-0.5">📝</span>
            <span className="line-clamp-2">{d.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── DonationList ──────────────────────────────────────────
const DonationList = ({ donations, filter = "all" }) => {
  const filtered = filter === "all"
    ? donations
    : donations.filter((d) => d.status === filter);

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon="🍱"
        title="No donations found"
        subtitle={
          filter === "all"
            ? "Create your first donation and help feed communities in need."
            : `No ${filter} donations at the moment.`
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {filtered.map((d) => (
        <DonationCard key={d._id} donation={d} />
      ))}
    </div>
  );
};

export default DonationList;
