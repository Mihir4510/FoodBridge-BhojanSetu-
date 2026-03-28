// src/components/ngo/DonationCard.jsx

import { PriorityBadge, StatusBadge, Countdown, calcDistance, toLatLng } from "./NgoUI";

const DonationCard = ({ donation, ngoLocation, onView, onAccept, onCollect, accepting, collecting }) => {
  const d = donation;

  // Calculate distance
  const donorCoords = toLatLng(d.donor?.location?.coordinates || d.location?.coordinates);
  const distance    = ngoLocation && donorCoords
    ? calcDistance(ngoLocation, donorCoords)
    : null;

  const callUrl     = `tel:${d.contactNumber}`;
  const whatsappUrl = `https://wa.me/${d.contactNumber?.replace(/[^0-9]/g, "")}`;

  const isPending  = d.status === "pending";
  const isAccepted = d.status === "accepted";

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden group">

      {/* Priority color bar */}
      <div className={`h-1 w-full ${
        d.priority === "high"   ? "bg-red-400"
        : d.priority === "medium" ? "bg-yellow-400"
        : "bg-[#2D6A4F]"
      }`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="font-bold text-[#111827] text-[15px] truncate">{d.title}</h3>
              <span className="text-[13px]">{d.foodType === "Food" ? "🍛" : "🛒"}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge priority={d.priority} />
              <StatusBadge status={d.status} />
            </div>
          </div>
          {/* Quantity */}
          <div className="text-right flex-shrink-0">
            <p className="font-playfair text-[24px] font-bold text-[#E76F1A] leading-none">{d.quantity}</p>
            <p className="text-[11px] text-[#9CA3AF] capitalize">{d.unit || "plates"}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {/* Address */}
          <div className="flex items-start gap-2 text-[12px] text-[#6B7280]">
            <span className="mt-0.5 flex-shrink-0">📍</span>
            <span className="line-clamp-2">{d.pickupAddress || d.address || "—"}</span>
          </div>

          {/* Distance + Expiry */}
          <div className="flex items-center justify-between">
            {distance ? (
              <span className="text-[12px] font-semibold text-[#2563EB] flex items-center gap-1">
                🚗 {distance} km away
              </span>
            ) : (
              <span className="text-[12px] text-[#9CA3AF]">Distance unknown</span>
            )}
            {d.expiryTime && <Countdown expiryTime={d.expiryTime} />}
          </div>

          {/* Donor name */}
          {d.donor?.name && (
            <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
              <span>👤</span>
              <span className="font-medium text-[#374151]">{d.donor.name}</span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF]">
            <span>📅</span>
            <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</span>
          </div>
        </div>

        {/* Contact row */}
        {d.contactNumber && (
          <div className="flex gap-2 mb-4">
            <a
              href={callUrl}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#F0FDF4] text-[#166534] rounded-lg text-[12px] font-semibold hover:bg-[#DCFCE7] transition-colors no-underline"
            >
              📞 Call
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#F0FFF4] text-[#166534] rounded-lg text-[12px] font-semibold hover:bg-[#DCFCE7] transition-colors no-underline"
            >
              💬 WhatsApp
            </a>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-3 border-t border-[#F3F4F6]">
          {/* View details */}
          <button
            onClick={() => onView(d)}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
          >
            👁 Details
          </button>

          {/* Accept */}
          {isPending && (
            <button
              onClick={() => onAccept(d._id)}
              disabled={accepting === d._id}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold bg-[#2D6A4F] text-white hover:bg-[#245a42] disabled:opacity-50 transition-colors"
            >
              {accepting === d._id ? "..." : "✅ Accept"}
            </button>
          )}

          {/* Mark Collected */}
          {isAccepted && (
            <button
              onClick={() => onCollect(d._id)}
              disabled={collecting === d._id}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
            >
              {collecting === d._id ? "..." : "🚚 Collected"}
            </button>
          )}

          {/* Collected / Expired badge */}
          {(d.status === "collected" || d.status === "expired") && (
            <div className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-center bg-[#F3F4F6] text-[#9CA3AF]">
              {d.status === "collected" ? "✅ Collected" : "⏰ Expired"}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default DonationCard;
