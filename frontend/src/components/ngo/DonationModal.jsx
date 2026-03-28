// src/components/ngo/DonationModal.jsx

import { PriorityBadge, StatusBadge, Countdown, toLatLng } from "./NgoUI";

const DonationModal = ({ donation, onClose, onAccept, onCollect, accepting, collecting }) => {
  if (!donation) return null;

  const d       = donation;
  const coords  = toLatLng(d.donor?.location?.coordinates || d.location?.coordinates);
  const mapsUrl = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    : null;

  const callUrl      = `tel:${d.contactNumber}`;
  const whatsappUrl  = `https://wa.me/${d.contactNumber?.replace(/[^0-9]/g, "")}`;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2 className="font-playfair text-[22px] font-bold text-[#111827] leading-tight">
              {d.title}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={d.status} />
              <PriorityBadge priority={d.priority} />
              {d.foodType && (
                <span className="text-[11px] bg-[#F3F4F6] text-[#6B7280] px-2.5 py-1 rounded-full font-semibold capitalize">
                  {d.foodType}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7EB] transition-colors ml-4 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Quantity + Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F9FAFB] rounded-xl p-4">
              <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1">Quantity</p>
              <p className="font-playfair text-[24px] font-bold text-[#2D6A4F] leading-none">
                {d.quantity}
              </p>
              <p className="text-[12px] text-[#9CA3AF] capitalize mt-0.5">{d.unit || "plates"}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-4">
              <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1">Expires</p>
              {d.expiryTime ? (
                <>
                  <p className="text-[13px] font-semibold text-[#374151]">
                    {new Date(d.expiryTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                  <Countdown expiryTime={d.expiryTime} />
                </>
              ) : <p className="text-[13px] text-[#9CA3AF]">—</p>}
            </div>
          </div>

          {/* Donor info */}
          <div className="bg-[#F9FAFB] rounded-xl p-4">
            <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-2">Donor</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D8F3DC] flex items-center justify-center text-[14px] font-bold text-[#2D6A4F]">
                {(d.donor?.name || "D").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#111827]">{d.donor?.name || "—"}</p>
                <p className="text-[12px] text-[#9CA3AF] capitalize">{d.donor?.role || "donor"}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-[#F9FAFB] rounded-xl p-4">
            <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-2">📍 Pickup Address</p>
            <p className="text-[13px] text-[#374151] leading-relaxed">
              {d.pickupAddress || d.address || "—"}
            </p>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-semibold text-[#2563EB] hover:underline no-underline"
              >
                🗺️ Open in Google Maps →
              </a>
            )}
          </div>

          {/* Notes */}
          {d.notes && (
            <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4">
              <p className="text-[11px] text-[#92400E] uppercase tracking-wider mb-1">📝 Notes</p>
              <p className="text-[13px] text-[#92400E] leading-relaxed">{d.notes}</p>
            </div>
          )}

          {/* Contact */}
          {d.contactNumber && (
            <div className="flex gap-3">
              <a
                href={callUrl}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#D8F3DC] text-[#1A4731] rounded-xl text-[13px] font-semibold hover:bg-[#B7E4C7] transition-colors no-underline"
              >
                📞 Call Donor
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#DCFCE7] text-[#166534] rounded-xl text-[13px] font-semibold hover:bg-[#BBF7D0] transition-colors no-underline"
              >
                💬 WhatsApp
              </a>
            </div>
          )}

          {/* Date */}
          <p className="text-[11px] text-[#9CA3AF] text-center">
            Posted {d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
          </p>
        </div>

        {/* Actions */}
        {(d.status === "pending" || d.status === "accepted") && (
          <div className="px-6 pb-6 flex gap-3">
            {d.status === "pending" && (
              <button
                onClick={() => onAccept(d._id)}
                disabled={accepting}
                className="flex-1 py-3.5 rounded-xl bg-[#2D6A4F] text-white font-semibold text-[14px] hover:bg-[#245a42] disabled:opacity-50 transition-colors"
              >
                {accepting ? "Accepting..." : "✅ Accept Donation"}
              </button>
            )}
            {d.status === "accepted" && (
              <button
                onClick={() => onCollect(d._id)}
                disabled={collecting}
                className="flex-1 py-3.5 rounded-xl bg-[#2563EB] text-white font-semibold text-[14px] hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
              >
                {collecting ? "Marking..." : "🚚 Mark Collected"}
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default DonationModal;
