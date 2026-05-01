// src/pages/ngo/NgoAccepted.jsx

// ✅ NGO monitors: accepted, assigned, picked_up, completed

import { useEffect, useState, useCallback } from "react";
import { getAllRequests } from "../../service/ngoApi";
import NgoLayout from "../../components/ngo/NgoLayout";
import { Spinner, EmptyState, PriorityBadge, StatusBadge, Countdown } from "../../components/ngo/NgoUI";
import DonationModal from "../../components/ngo/DonationModal";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";

// ✅ Active statuses = everything after pending, except expired
const ACTIVE_STATUSES = ["accepted", "assigned", "picked_up", "completed"];

const NgoAccepted = () => {
  const [donations, setDonations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const { toasts, toast }         = useToast();

  const load = useCallback(async () => {
    try {
      const res = await getAllRequests();
      const all  = res.data?.donations || res.data || [];
      setDonations(all.filter((d) => ACTIVE_STATUSES.includes(d.status)));
    } catch {
      toast.error("Failed to load donations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Group by status
  const accepted  = donations.filter((d) => d.status === "accepted");
  const assigned  = donations.filter((d) => d.status === "assigned");
  const pickedUp  = donations.filter((d) => d.status === "picked_up");
  const completed = donations.filter((d) => d.status === "completed");

  if (loading) return <NgoLayout title="Active Donations"><Spinner /></NgoLayout>;

  const Section = ({ title, badge, items, color }) => {
    if (!items.length) return null;
    return (
      <div className="mb-8">
        <h2 className="text-[16px] font-bold text-[#111827] mb-4 flex items-center gap-2">
          {title}
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${color}`}>{items.length}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((d) => (
            <StatusCard key={d._id} donation={d} onView={() => setSelected(d)} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <NgoLayout title="Active Donations" subtitle="Donations you have accepted — monitored in real time.">
      <ToastContainer toasts={toasts} />

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Accepted",   val: accepted.length,  bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]", icon: "✅" },
          { label: "Assigned",   val: assigned.length,  bg: "bg-[#EDE9FE]", text: "text-[#4C1D95]", icon: "🚗" },
          { label: "In Transit", val: pickedUp.length,  bg: "bg-[#FEF3C7]", text: "text-[#92400E]", icon: "📦" },
          { label: "Completed",  val: completed.length, bg: "bg-[#D8F3DC]", text: "text-[#1A4731]", icon: "🎉" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm text-center">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center text-[18px] mx-auto mb-2`}>{s.icon}</div>
            <p className={`font-bold text-[26px] ${s.text} leading-none`}>{s.val}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info banner explaining new flow */}
      <div className="bg-[#EDE9FE] border border-[#C4B5FD] rounded-2xl px-5 py-4 flex items-start gap-3 mb-8">
        <span className="text-[18px] mt-0.5">🚗</span>
        <div>
          <p className="text-[13px] font-semibold text-[#4C1D95]">Driver-managed delivery system</p>
          <p className="text-[12px] text-[#4C1D95]/80 mt-0.5 leading-relaxed">
            After you accept a donation, a driver is auto-assigned. The driver picks up the food and delivers it to your NGO.
            Your role is to monitor the lifecycle — no manual collection needed.
          </p>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
          <EmptyState icon="✅" title="No active donations" subtitle="Accept incoming donations from your dashboard to see them here." />
        </div>
      ) : (
        <>
          <Section title="⏳ Accepted — Finding Driver" badge="" items={accepted} color="bg-[#DBEAFE] text-[#1E40AF]" />
          <Section title="🚗 Assigned — Driver On the Way" badge="" items={assigned} color="bg-[#EDE9FE] text-[#4C1D95]" />
          <Section title="📦 In Transit" badge="" items={pickedUp} color="bg-[#FEF3C7] text-[#92400E]" />
          <Section title="🎉 Completed" badge="" items={completed} color="bg-[#D8F3DC] text-[#1A4731]" />
        </>
      )}

      {selected && (
        <DonationModal
          donation={selected}
          onClose={() => setSelected(null)}
          onAccept={() => {}}
          accepting={false}
        />
      )}
    </NgoLayout>
  );
};

// ── Status Card — read-only, NGO monitors only ─────────────
const StatusCard = ({ donation: d, onView }) => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-all">
    <div className={`h-1 w-full rounded-full mb-4 ${
      d.status === "completed" ? "bg-[#2D6A4F]"
      : d.status === "picked_up" ? "bg-[#F59E0B]"
      : d.status === "assigned"  ? "bg-[#E76F1A]"
      : "bg-[#2563EB]"
    }`} />

    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[#111827] text-[15px] truncate mb-1.5">{d.title}</h3>
        <div className="flex gap-2 flex-wrap">
          <PriorityBadge priority={d.priority} />
          <StatusBadge   status={d.status} />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-playfair text-[22px] font-bold text-[#E76F1A] leading-none">{d.quantity}</p>
        <p className="text-[11px] text-[#9CA3AF] capitalize">{d.unit || "plates"}</p>
      </div>
    </div>

    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
        <span>📍</span><span className="truncate">{d.pickupAddress || d.address || "—"}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
          <span>👤</span><span>{(d.donor || d.donorId)?.name || "—"}</span>
        </div>
        {d.expiryTime && !["completed"].includes(d.status) && (
          <Countdown expiryTime={d.expiryTime} />
        )}
      </div>
      {d.driverId && (
        <div className="flex items-center gap-2 text-[12px] font-semibold text-[#4C1D95] bg-[#EDE9FE] rounded-lg px-3 py-1.5">
          <span>🚗</span><span>{d.driverId?.name || "Driver assigned"}</span>
        </div>
      )}
    </div>

    <div className="pt-3 border-t border-[#F3F4F6]">
      <button onClick={onView}
        className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
        👁 View Details
      </button>
    </div>
  </div>
);

export default NgoAccepted;
