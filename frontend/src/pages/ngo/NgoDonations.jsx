// src/pages/ngo/NgoDonations.jsx

// ✅ NGO monitors lifecycle only — accepts pending donations

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllRequests, acceptDonation } from "../../service/ngoApi";
import { useAuth } from "../../context/AuthContext";
import NgoLayout from "../../components/ngo/NgoLayout";
import DonationCard from "../../components/ngo/DonationCard";
import DonationModal from "../../components/ngo/DonationModal";
import { Spinner, EmptyState} from "../../components/ngo/NgoUI";
import { toLatLng, calcDistance } from "../../utils/geo";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";

// ✅ No "collected" — use "completed"
const FILTERS = [
  { key: "all",       label: "All",        icon: "🍱" },
  { key: "pending",   label: "Pending",    icon: "🟡" },
  { key: "accepted",  label: "Accepted",   icon: "✅" },
  { key: "assigned",  label: "Assigned",   icon: "🚗" },
  { key: "picked_up", label: "In Transit", icon: "📦" },
  { key: "completed", label: "Completed",  icon: "🎉" },
  { key: "expired",   label: "Expired",    icon: "⏰" },
];

const SORT_OPTIONS = [
  { key: "newest",   label: "🕐 Newest First"  },
  { key: "priority", label: "🔴 Priority First" },
  { key: "expiry",   label: "⏳ Expiry First"   },
  { key: "distance", label: "📍 Nearest First"  },
];

const priorityOrder = { high: 0, medium: 1, low: 2 };

const NgoDonations = () => {
  const { user }          = useAuth();
  const { toasts, toast } = useToast();

  const [donations,  setDonations]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [filter,     setFilter]     = useState("all");
  const [sortBy,     setSortBy]     = useState("newest");
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState(null);
  const [accepting,  setAccepting]  = useState(null);

  const ngoLocation = user?.location?.coordinates
    ? toLatLng(user.location.coordinates)
    : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllRequests();
      setDonations(res.data?.donations || res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load donations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (id) => {
    setAccepting(id);
    try {
      await acceptDonation(id);
      setDonations((prev) =>
        prev.map((d) => d._id === id ? { ...d, status: "accepted" } : d)
      );
      toast.success("Donation accepted! Finding nearest driver...");
      if (selected?._id === id) setSelected((p) => p ? { ...p, status: "accepted" } : p);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to accept.");
    } finally {
      setAccepting(null);
    }
  };

  // Counts per tab
  const counts = FILTERS.reduce((acc, f) => {
    acc[f.key] = f.key === "all" ? donations.length : donations.filter((d) => d.status === f.key).length;
    return acc;
  }, {});

  const processed = donations
    .filter((d) => {
      if (filter !== "all" && d.status !== filter) return false;
      if (search.trim()) {
        const q     = search.toLowerCase();
        const donor = d.donor || d.donorId;
        return (
          d.title?.toLowerCase().includes(q) ||
          d.pickupAddress?.toLowerCase().includes(q) ||
          donor?.name?.toLowerCase().includes(q) ||
          d.foodType?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (sortBy === "expiry")   return new Date(a.expiryTime) - new Date(b.expiryTime);
      if (sortBy === "distance" && ngoLocation) {
        const g = (d) => (d.donor || d.donorId)?.location?.coordinates;
        const da = g(a) ? Math.hypot(g(a)[1] - ngoLocation.lat, g(a)[0] - ngoLocation.lng) : 999;
        const db = g(b) ? Math.hypot(g(b)[1] - ngoLocation.lat, g(b)[0] - ngoLocation.lng) : 999;
        return da - db;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <NgoLayout
      title="Donations"
      subtitle={`${donations.length} total donation request${donations.length !== 1 ? "s" : ""}.`}
    >
      <ToastContainer toasts={toasts} />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? <Spinner message="Loading donations..." /> : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[14px]">🔍</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, donor, address..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] bg-white outline-none focus:border-[#E76F1A]" />
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] font-semibold text-[#374151] bg-white outline-none focus:border-[#E76F1A]">
                {SORT_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                    filter === f.key
                      ? "bg-[#E76F1A] text-white shadow-sm"
                      : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#E76F1A] hover:text-[#E76F1A]"
                  }`}>
                  <span>{f.icon}</span> {f.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === f.key ? "bg-white/20 text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                    {counts[f.key] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {search.trim() && (
            <p className="text-[13px] text-[#9CA3AF] mb-4">
              {processed.length} result{processed.length !== 1 ? "s" : ""} for "{search}"
            </p>
          )}

          {processed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10">
              <EmptyState
                icon={FILTERS.find((f) => f.key === filter)?.icon || "🍱"}
                title={search.trim() ? `No results for "${search}"` : `No ${filter === "all" ? "" : filter} donations`}
                subtitle={filter === "all" ? "Donations assigned to your NGO will appear here." : `No ${filter} donations at the moment.`}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {processed.map((d) => (
                <DonationCard
                  key={d._id}
                  donation={d}
                  ngoLocation={ngoLocation}
                  onView={(donation) => setSelected(donation)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {selected && (
        <DonationModal
          donation={selected}
          onClose={() => setSelected(null)}
          onAccept={handleAccept}
          accepting={accepting === selected._id}
        />
      )}
    </NgoLayout>
  );
};

export default NgoDonations;
