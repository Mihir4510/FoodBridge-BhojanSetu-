// src/components/ngo/DonationCard.jsx


import { PriorityBadge, StatusBadge, Countdown,} from "./NgoUI";
import { toLatLng, calcDistance } from "../../utils/geo";

const DonationCard = ({ donation, ngoLocation, onView }) => {
  const d = donation;

  // ── Normalize donor field ─────────────────────────────
  const donor      = d.donor || d.donorId;
  const donorCoords = toLatLng(donor?.location?.coordinates);
  const distance    = ngoLocation && donorCoords
    ? calcDistance(ngoLocation, donorCoords)
    : null;

  const callUrl     = `tel:${d.contactNumber}`;
  const whatsappUrl = `https://wa.me/${d.contactNumber?.replace(/[^0-9]/g, "")}`;

  // ── Status color bar ──────────────────────────────────
  const barColor = {
    pending:   "bg-[#FEF3C7]",
    accepted:  "bg-[#DBEAFE]",
    assigned:  "bg-[#E76F1A]",
    picked_up: "bg-[#F59E0B]",
    completed: "bg-[#2D6A4F]",
    expired:   "bg-[#EF4444]",
  }[d.status] || "bg-[#E5E7EB]";

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">

      {/* Status color bar */}
      <div className={`h-1.5 w-full ${barColor}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="font-bold text-[#111827] text-[15px] truncate">{d.title}</h3>
              <span className="text-[13px]">{d.foodType === "Food" ? "🍛" : "🛒"}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge priority={d.priority} />
              <StatusBadge   status={d.status} />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-playfair text-[24px] font-bold text-[#E76F1A] leading-none">{d.quantity}</p>
            <p className="text-[11px] text-[#9CA3AF] capitalize">{d.unit || "plates"}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-[12px] text-[#6B7280]">
            <span className="flex-shrink-0 mt-0.5">📍</span>
            <span className="line-clamp-2">{d.pickupAddress || d.address || "—"}</span>
          </div>

          <div className="flex items-center justify-between">
            {distance ? (
              <span className="text-[12px] font-semibold text-[#2563EB]">🚗 {distance} km away</span>
            ) : (
              <span className="text-[12px] text-[#9CA3AF]">Distance unknown</span>
            )}
            {d.expiryTime && !["completed", "expired"].includes(d.status) && (
              <Countdown expiryTime={d.expiryTime} />
            )}
          </div>

          {/* Donor name */}
          {donor?.name && (
            <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
              <span>👤</span>
              <span className="font-medium text-[#374151]">{donor.name}</span>
            </div>
          )}

          {/* Driver info — shown when assigned or beyond */}
          {d.driverId && ["assigned", "picked_up", "completed"].includes(d.status) && (
            <div className="flex items-center gap-2 text-[12px] font-semibold bg-[#EDE9FE] text-[#4C1D95] rounded-xl px-3 py-2">
              <span>🚗</span>
              <span>
                Driver: {d.driverId?.name || "Assigned"}
                {d.driverId?.phone && ` · ${d.driverId.phone}`}
              </span>
            </div>
          )}

          {/* Picked up label */}
          {d.status === "picked_up" && (
            <div className="flex items-center gap-2 text-[12px] font-semibold bg-[#FEF3C7] text-[#92400E] rounded-xl px-3 py-2">
              <span>📦</span>
              <span>Food picked up — in transit to NGO</span>
            </div>
          )}

          {/* Completed label */}
          {d.status === "completed" && (
            <div className="flex items-center gap-2 text-[12px] font-semibold bg-[#D8F3DC] text-[#1A4731] rounded-xl px-3 py-2">
              <span>🎉</span>
              <span>Delivered successfully!</span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF]">
            <span>📅</span>
            <span>
              {d.createdAt
                ? new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                : "—"}
            </span>
          </div>
        </div>

        {/* Contact — only if not completed/expired */}
        {d.contactNumber && !["completed", "expired"].includes(d.status) && (
          <div className="flex gap-2 mb-4">
            <a href={callUrl} onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#F0FDF4] text-[#166534] rounded-lg text-[12px] font-semibold hover:bg-[#DCFCE7] no-underline transition-colors">
              📞 Call
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#F0FFF4] text-[#166534] rounded-lg text-[12px] font-semibold hover:bg-[#DCFCE7] no-underline transition-colors">
              💬 WhatsApp
            </a>
          </div>
        )}

        {/* Actions — NGO ONLY monitors, no action buttons except View */}
        <div className="pt-3 border-t border-[#F3F4F6]">
          <button
            onClick={() => onView(d)}
            className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
          >
            👁 View Details
          </button>
        </div>
      </div>

      <style>{`
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default DonationCard;
