// src/pages/ngo/NgoAccepted.jsx

import { useEffect, useState, useCallback } from "react";
import { getAllRequests, collectDonation } from "../../service/ngoApi";
import NgoLayout from "../../components/ngo/NgoLayout";
import { Spinner, EmptyState, PriorityBadge, Countdown, toLatLng } from "../../components/ngo/NgoUI";
import DonationModal from "../../components/ngo/DonationModal";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";

const NgoAccepted = () => {
  const [donations,  setDonations]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [selected,   setSelected]   = useState(null);
  const [collecting, setCollecting] = useState(null);
  const { toasts, toast }           = useToast();

  const load = useCallback(async () => {
    try {
      const res  = await getAllRequests();
      const all  = res.data?.donations || res.data || [];
      // Only show accepted + collected
      setDonations(all.filter((d) => ["accepted", "collected"].includes(d.status)));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load donations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCollect = async (id) => {
    setCollecting(id);
    try {
      await collectDonation(id);
      setDonations((prev) =>
        prev.map((d) => d._id === id ? { ...d, status: "collected" } : d)
      );
      toast.success("Marked as collected! 🎉");
      if (selected?._id === id) setSelected((prev) => ({ ...prev, status: "collected" }));
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to mark as collected.");
    } finally {
      setCollecting(null);
    }
  };

  const accepted  = donations.filter((d) => d.status === "accepted");
  const collected = donations.filter((d) => d.status === "collected");

  if (loading) return <NgoLayout title="Accepted Donations"><Spinner /></NgoLayout>;

  return (
    <NgoLayout title="Accepted Donations" subtitle="Donations you have accepted and are managing.">
      <ToastContainer toasts={toasts} />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px]">
          ⚠️ {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="w-10 h-10 bg-[#D8F3DC] rounded-xl flex items-center justify-center text-[20px] mb-3">✅</div>
          <p className="font-playfair text-[32px] font-bold text-[#2D6A4F] leading-none">{accepted.length}</p>
          <p className="text-[13px] text-[#6B7280] font-semibold mt-1">Accepted — Awaiting Pickup</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center text-[20px] mb-3">🚚</div>
          <p className="font-playfair text-[32px] font-bold text-[#2563EB] leading-none">{collected.length}</p>
          <p className="text-[13px] text-[#6B7280] font-semibold mt-1">Collected — Completed</p>
        </div>
      </div>

      {/* Accepted section */}
      {accepted.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[16px] font-bold text-[#111827] mb-4 flex items-center gap-2">
            ✅ Awaiting Pickup
            <span className="bg-[#D8F3DC] text-[#1A4731] text-[11px] font-bold px-2.5 py-1 rounded-full">{accepted.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {accepted.map((d) => (
              <AcceptedCard
                key={d._id}
                donation={d}
                onView={() => setSelected(d)}
                onCollect={handleCollect}
                collecting={collecting}
              />
            ))}
          </div>
        </div>
      )}

      {/* Collected section */}
      {collected.length > 0 && (
        <div>
          <h2 className="text-[16px] font-bold text-[#111827] mb-4 flex items-center gap-2">
            🚚 Collected
            <span className="bg-[#DBEAFE] text-[#1E40AF] text-[11px] font-bold px-2.5 py-1 rounded-full">{collected.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {collected.map((d) => (
              <AcceptedCard
                key={d._id}
                donation={d}
                onView={() => setSelected(d)}
                onCollect={handleCollect}
                collecting={collecting}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {donations.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
          <EmptyState icon="✅" title="No accepted donations yet" subtitle="Accept incoming donations from your dashboard to see them here." />
        </div>
      )}

      {/* Modal */}
      {selected && (
        <DonationModal
          donation={selected}
          onClose={() => setSelected(null)}
          onAccept={() => {}}
          onCollect={handleCollect}
          accepting={false}
          collecting={collecting === selected._id}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm       { font-family: 'DM Sans', sans-serif; }
      `}</style>
    </NgoLayout>
  );
};

// ── Accepted Card ──────────────────────────────────────────
const AcceptedCard = ({ donation: d, onView, onCollect, collecting }) => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-all duration-200">
    <div className={`h-1 w-full rounded-full mb-4 ${d.status === "collected" ? "bg-[#2563EB]" : "bg-[#2D6A4F]"}`} />

    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[#111827] text-[15px] truncate mb-1.5">{d.title}</h3>
        <div className="flex gap-2 flex-wrap">
          <PriorityBadge priority={d.priority} />
          <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${
            d.status === "collected" ? "bg-[#DBEAFE] text-[#1E40AF]" : "bg-[#D8F3DC] text-[#1A4731]"
          }`}>
            {d.status === "collected" ? "🚚 Collected" : "✅ Accepted"}
          </span>
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
          <span>👤</span><span>{d.donor?.name || "—"}</span>
        </div>
        {d.expiryTime && d.status !== "collected" && <Countdown expiryTime={d.expiryTime} />}
      </div>
      {d.contactNumber && (
        <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
          <span>📞</span><span>{d.contactNumber}</span>
        </div>
      )}
    </div>

    <div className="flex gap-2 pt-3 border-t border-[#F3F4F6]">
      <button onClick={onView}
        className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
        👁 Details
      </button>
      {d.status === "accepted" && (
        <button
          onClick={() => onCollect(d._id)}
          disabled={collecting === d._id}
          className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
        >
          {collecting === d._id ? "..." : "🚚 Collected"}
        </button>
      )}
    </div>
  </div>
);

export default NgoAccepted;
