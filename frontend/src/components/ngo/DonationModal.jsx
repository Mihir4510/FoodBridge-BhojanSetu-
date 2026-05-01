// src/components/ngo/DonationModal.jsx

// ✅ NGO views full details and monitors lifecycle
// ✅ Shows driver info, stage timestamps

import { PriorityBadge, StatusBadge, Countdown, } from "./NgoUI";
import { toLatLng, calcDistance } from "../../utils/geo";

const DonationModal = ({ donation, onClose, onAccept, accepting }) => {
  if (!donation) return null;

  const d        = donation;
  const donor    = d.donor || d.donorId;
  const coords   = toLatLng(donor?.location?.coordinates || d.location?.coordinates);
  const mapsUrl  = coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : null;

  const callUrl      = `tel:${d.contactNumber}`;
  const whatsappUrl  = `https://wa.me/${d.contactNumber?.replace(/[^0-9]/g, "")}`;

  // Stage timeline for display
  const stages = [
    { key: "pending",   label: "Created",     icon: "🍱", time: d.createdAt  },
    { key: "accepted",  label: "Accepted",    icon: "✅", time: d.acceptedAt  },
    { key: "assigned",  label: "Driver Assigned", icon: "🚗", time: d.assignedAt },
    { key: "picked_up", label: "Picked Up",   icon: "📦", time: d.pickedUpAt  },
    { key: "completed", label: "Delivered",   icon: "🎉", time: d.completedAt },
  ];

  const statusOrder = ["pending", "accepted", "assigned", "picked_up", "completed", "expired"];
  const currentIdx  = statusOrder.indexOf(d.status);

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
              <StatusBadge   status={d.status} />
              <PriorityBadge priority={d.priority} />
              {d.foodType && (
                <span className="text-[11px] bg-[#F3F4F6] text-[#6B7280] px-2.5 py-1 rounded-full font-semibold capitalize">
                  {d.foodType}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7EB] transition-colors ml-4 flex-shrink-0">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Quantity + Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F9FAFB] rounded-xl p-4">
              <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1">Quantity</p>
              <p className="font-playfair text-[24px] font-bold text-[#2D6A4F] leading-none">{d.quantity}</p>
              <p className="text-[12px] text-[#9CA3AF] capitalize mt-0.5">{d.unit || "plates"}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-4">
              <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1">Expires</p>
              {d.expiryTime ? (
                <>
                  <p className="text-[13px] font-semibold text-[#374151]">
                    {new Date(d.expiryTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                  {!["completed", "expired"].includes(d.status) && <Countdown expiryTime={d.expiryTime} />}
                </>
              ) : <p className="text-[13px] text-[#9CA3AF]">—</p>}
            </div>
          </div>

          {/* Delivery lifecycle timeline */}
          <div className="bg-[#F9FAFB] rounded-xl p-4">
            <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-3">Delivery Lifecycle</p>
            <div className="space-y-2">
              {stages.map((stage, idx) => {
                const stageIdx = statusOrder.indexOf(stage.key);
                const done     = currentIdx >= stageIdx;
                const active   = d.status === stage.key;
                return (
                  <div key={stage.key} className={`flex items-center gap-3 ${done ? "" : "opacity-30"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] flex-shrink-0 ${
                      active ? "bg-[#E76F1A] ring-2 ring-[#E76F1A]/30" : done ? "bg-[#D8F3DC]" : "bg-[#F3F4F6]"
                    }`}>
                      {stage.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-[12px] font-semibold ${active ? "text-[#E76F1A]" : done ? "text-[#374151]" : "text-[#9CA3AF]"}`}>
                        {stage.label}
                      </p>
                    </div>
                    {stage.time && done && (
                      <p className="text-[11px] text-[#9CA3AF]">
                        {new Date(stage.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Driver info */}
          {d.driverId && (
            <div className="bg-[#EDE9FE] rounded-xl p-4">
              <p className="text-[11px] text-[#4C1D95] uppercase tracking-wider mb-2">Assigned Driver</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E76F1A] flex items-center justify-center text-white font-bold text-[14px]">
                  {(d.driverId?.name || "D").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1A1A2E]">{d.driverId?.name || "—"}</p>
                  {d.driverId?.phone && (
                    <a href={`tel:${d.driverId.phone}`} className="text-[12px] text-[#4C1D95] font-medium no-underline">
                      📞 {d.driverId.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Donor info */}
          <div className="bg-[#F9FAFB] rounded-xl p-4">
            <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-2">Donor</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D8F3DC] flex items-center justify-center text-[14px] font-bold text-[#2D6A4F]">
                {(donor?.name || "D").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#111827]">{donor?.name || "—"}</p>
                <p className="text-[12px] text-[#9CA3AF] capitalize">{donor?.role || "donor"}</p>
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
              <a href={mapsUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-semibold text-[#2563EB] hover:underline no-underline">
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
          {d.contactNumber && !["completed", "expired"].includes(d.status) && (
            <div className="flex gap-3">
              <a href={callUrl}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#D8F3DC] text-[#1A4731] rounded-xl text-[13px] font-semibold hover:bg-[#B7E4C7] transition-colors no-underline">
                📞 Call Donor
              </a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#DCFCE7] text-[#166534] rounded-xl text-[13px] font-semibold hover:bg-[#BBF7D0] transition-colors no-underline">
                💬 WhatsApp
              </a>
            </div>
          )}

          {/* Post date */}
          <p className="text-[11px] text-[#9CA3AF] text-center">
            Posted {d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
          </p>
        </div>

        {/* ✅ Accept button — ONLY for pending donations */}
        {d.status === "pending" && (
          <div className="px-6 pb-6">
            <button
              onClick={() => onAccept(d._id)}
              disabled={accepting}
              className="w-full py-3.5 rounded-xl bg-[#2D6A4F] text-white font-semibold text-[14px] hover:bg-[#245a42] disabled:opacity-50 transition-colors"
            >
              {accepting ? "Accepting..." : "✅ Accept Donation"}
            </button>
            <p className="text-[11px] text-[#9CA3AF] text-center mt-2">
              A driver will be auto-assigned after acceptance.
            </p>
          </div>
        )}

        {/* Info for non-pending statuses */}
        {d.status !== "pending" && (
          <div className="px-6 pb-6">
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-center">
              <p className="text-[12px] text-[#9CA3AF]">
                {d.status === "assigned"  && "🚗 Driver is on the way to pick up the food."}
                {d.status === "picked_up" && "📦 Food is in transit — driver heading to NGO."}
                {d.status === "completed" && "🎉 Food delivered successfully!"}
                {d.status === "accepted"  && "⏳ Searching for an available driver..."}
                {d.status === "expired"   && "⏰ This donation has expired."}
              </p>
            </div>
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
