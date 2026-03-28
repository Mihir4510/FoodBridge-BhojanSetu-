// src/pages/ngo/NgoDashboard.jsx

import { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { getAllRequests, acceptDonation, collectDonation } from "../../service/ngoApi";
import { useAuth } from "../../context/AuthContext";
import NgoLayout from "../../components/ngo/NgoLayout";
import DonationCard from "../../components/ngo/DonationCard";
import DonationModal from "../../components/ngo/DonationModal";
import MapView from "../../components/ngo/MapView";
import { StatCard, Spinner, EmptyState, toLatLng } from "../../components/ngo/NgoUI";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";



// ── Sort options ───────────────────────────────────────────
const SORT_OPTIONS = [
  { key: "newest",   label: "🕐 Newest First"  },
  { key: "priority", label: "🔴 Priority First" },
  { key: "expiry",   label: "⏳ Expiry First"   },
  { key: "distance", label: "📍 Nearest First"  },
];

const FILTER_OPTIONS = [
  { key: "all",       label: "All"       },
  { key: "pending",   label: "Pending"   },
  { key: "accepted",  label: "Accepted"  },
  { key: "collected", label: "Collected" },
];

// ── NgoDashboard ───────────────────────────────────────────
const NgoDashboard = () => {
  const { user }              = useAuth();
  console.log("USER:", user);
  const { toasts, toast }     = useToast();

  const [donations, setDonations]   = useState([]);
  console.log("DONATIONS:", donations);
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState("");
  const [view,      setView]        = useState("cards"); // "cards" | "map"
  const [sortBy,    setSortBy]      = useState("newest");
  const [filterBy,  setFilterBy]    = useState("all");
  const [search,    setSearch]      = useState("");

  // Modal
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Action states
  const [accepting,  setAccepting]  = useState(null);
  const [collecting, setCollecting] = useState(null);

  // Socket ref
  const socketRef = useRef(null);

  // NGO location from user profile
  const ngoLocation = user?.location?.coordinates
    ? toLatLng(user.location.coordinates)
    : null;

  // ── Load donations ─────────────────────────────────────
  const load = useCallback(async () => {
    try {
      // GET /api/request
      const res = await getAllRequests();
      setDonations(Array.isArray(res.data?.donations) ? res.data.donations : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load donations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  if (user) {
    load();
  }
}, [user]);

  // ── Socket.io real-time updates ────────────────────────
  useEffect(() => {
    socketRef.current = io("http://localhost:3000", { withCredentials: true });

    // Join NGO's room
    if (user?._id || user?.id) {
      socketRef.current.emit("joinRoom", user._id || user.id);
    }

    // Listen for new donation assigned to this NGO
    socketRef.current.on("newDonation", (donation) => {
      setDonations((prev) => {
        // Avoid duplicates
        const exists = prev.find((d) => d._id === donation._id);
        if (exists) return prev;
        return [donation, ...prev];
      });
      toast.info(`🍱 New donation: "${donation.title}" assigned to you!`);
    });

    // Listen for status updates
    socketRef.current.on("donationUpdated", (updated) => {
      setDonations((prev) =>
        prev.map((d) => (d._id === updated._id ? { ...d, ...updated } : d))
      );
    });

    return () => { socketRef.current?.disconnect(); };
  }, [user]);

  // ── Accept donation ────────────────────────────────────
  const handleAccept = async (id) => {
    setAccepting(id);
    try {
      // PUT /api/accept/:id
      await acceptDonation(id);
      setDonations((prev) =>
        prev.map((d) => d._id === id ? { ...d, status: "accepted" } : d)
      );
      toast.success("Donation accepted! Donor has been notified.");
      if (selectedDonation?._id === id) {
        setSelectedDonation((prev) => ({ ...prev, status: "accepted" }));
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to accept donation.");
    } finally {
      setAccepting(null);
    }
  };

  // ── Collect donation ───────────────────────────────────
  const handleCollect = async (id) => {
    setCollecting(id);
    try {
      // PUT /api/collect/:id
      await collectDonation(id);
      setDonations((prev) =>
        prev.map((d) => d._id === id ? { ...d, status: "collected" } : d)
      );
      toast.success("Marked as collected! Great work. 🎉");
      if (selectedDonation?._id === id) {
        setSelectedDonation((prev) => ({ ...prev, status: "collected" }));
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to mark as collected.");
    } finally {
      setCollecting(null);
    }
  };

  // ── Stats ──────────────────────────────────────────────
  const total     = donations.length;
  const pending   = donations.filter((d) => d.status === "pending").length;
  const accepted  = donations.filter((d) => d.status === "accepted").length;
  const collected = donations.filter((d) => d.status === "collected").length;

  // ── Filter ─────────────────────────────────────────────
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const processed = donations
    .filter((d) => {
      if (filterBy !== "all" && d.status !== filterBy) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          d.title?.toLowerCase().includes(q) ||
          d.pickupAddress?.toLowerCase().includes(q) ||
          d.donor?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (sortBy === "expiry")   return new Date(a.expiryTime) - new Date(b.expiryTime);
      if (sortBy === "distance" && ngoLocation) {
        const da = a.donor?.location?.coordinates ? Math.hypot(a.donor.location.coordinates[1] - ngoLocation.lat, a.donor.location.coordinates[0] - ngoLocation.lng) : 999;
        const db = b.donor?.location?.coordinates ? Math.hypot(b.donor.location.coordinates[1] - ngoLocation.lat, b.donor.location.coordinates[0] - ngoLocation.lng) : 999;
        return da - db;
      }
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  const counts = FILTER_OPTIONS.reduce((acc, f) => {
    acc[f.key] = f.key === "all" ? donations.length : donations.filter((d) => d.status === f.key).length;
    return acc;
  }, {});

  return (
    <NgoLayout
      title={`Welcome, ${user?.ngoName || user?.name || "NGO"} 👋`}
      subtitle="Manage incoming food donations in real time."
    >
      <ToastContainer toasts={toasts} />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? <Spinner message="Loading donations..." /> : (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon="🍱" label="Total Received" value={total}     color="orange" />
            <StatCard icon="⏳" label="Pending"        value={pending}   color="purple" />
            <StatCard icon="✅" label="Accepted"       value={accepted}  color="green"  />
            <StatCard icon="🚚" label="Collected"      value={collected} color="blue"   />
          </div>

          {/* ── Toolbar ── */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Row 1: Search + View toggle */}
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 max-w-sm">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[14px]">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search donations..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] bg-white outline-none focus:border-[#E76F1A] focus:ring-2 focus:ring-[#E76F1A]/10"
                />
              </div>
              {/* View toggle */}
              <div className="flex bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button
                  onClick={() => setView("cards")}
                  className={`px-4 py-2.5 text-[13px] font-semibold transition-colors ${view === "cards" ? "bg-[#E76F1A] text-white" : "text-[#6B7280] hover:bg-[#F9FAFB]"}`}
                >
                  🃏 Cards
                </button>
                <button
                  onClick={() => setView("map")}
                  className={`px-4 py-2.5 text-[13px] font-semibold transition-colors ${view === "map" ? "bg-[#E76F1A] text-white" : "text-[#6B7280] hover:bg-[#F9FAFB]"}`}
                >
                  🗺️ Map
                </button>
              </div>
            </div>

            {/* Row 2: Filters + Sort */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              {/* Status filters */}
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterBy(f.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
                      filterBy === f.key
                        ? "bg-[#E76F1A] text-white shadow-sm"
                        : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#E76F1A] hover:text-[#E76F1A]"
                    }`}
                  >
                    {f.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filterBy === f.key ? "bg-white/20" : "bg-[#F3F4F6]"}`}>
                      {counts[f.key]}
                    </span>
                  </button>
                ))}
              </div>
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E5E7EB] text-[12px] font-semibold text-[#374151] bg-white outline-none focus:border-[#E76F1A]"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Cards View ── */}
          {view === "cards" && (
            <>
              {processed.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
                  <EmptyState
                    icon="🍱"
                    title="No donations found"
                    subtitle="Donations assigned to your NGO will appear here in real time."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {processed.map((d) => (
                    <DonationCard
                      key={d._id}
                      donation={d}
                      ngoLocation={ngoLocation}
                      onView={(donation) => setSelectedDonation(donation)}
                      onAccept={handleAccept}
                      onCollect={handleCollect}
                      accepting={accepting}
                      collecting={collecting}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Map View ── */}
          {view === "map" && (
            <div className="h-[600px] w-full">
              <MapView
                ngoLocation={ngoLocation}
                donations={processed}
                onMarkerClick={(d) => setSelectedDonation(d)}
              />
            </div>
          )}
        </>
      )}

      {/* ── Detail Modal ── */}
      {selectedDonation && (
        <DonationModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onAccept={handleAccept}
          onCollect={handleCollect}
          accepting={accepting === selectedDonation._id}
          collecting={collecting === selectedDonation._id}
        />
      )}
    </NgoLayout>
  );
};

export default NgoDashboard;
