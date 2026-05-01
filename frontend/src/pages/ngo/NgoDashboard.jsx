// // src/pages/ngo/NgoDashboard.jsx

// import { useEffect, useState, useCallback, useRef } from "react";
// import { io } from "socket.io-client";
// import { getAllRequests, acceptDonation, collectDonation } from "../../service/ngoApi";
// import { useAuth } from "../../context/AuthContext";
// import NgoLayout from "../../components/ngo/NgoLayout";
// import DonationCard from "../../components/ngo/DonationCard";
// import DonationModal from "../../components/ngo/DonationModal";
// import MapView from "../../components/ngo/MapView";
// import { StatCard, Spinner, EmptyState, toLatLng } from "../../components/ngo/NgoUI";
// import useToast from "../../hooks/useToast";
// import ToastContainer from "../../components/donor/ToastContainer";

// const SORT_OPTIONS = [
//   { key: "newest",   label: "🕐 Newest First"  },
//   { key: "priority", label: "🔴 Priority First" },
//   { key: "expiry",   label: "⏳ Expiry First"   },
//   { key: "distance", label: "📍 Nearest First"  },
// ];

// const FILTER_OPTIONS = [
//   // { key: "all",       label: "All"       },
//   // { key: "pending",   label: "Pending"   },
//   // { key: "accepted",  label: "Accepted"  },
//   // { key: "collected", label: "Collected" },
//   { key: "all",       label: "All"       },
//   { key: "pending",   label: "Pending"   },  
//   { key: "accepted",  label: "Accepted"  }, 
//   { key: "assigned",  label: "Assigned"  },  
//   { key: "picked_up", label: "Picked Up" },  
//   { key: "completed", label: "Completed" },
// ];

// const priorityOrder = { high: 0, medium: 1, low: 2 };

// const NgoDashboard = () => {
//   console.log("🔥 NGO DASHBOARD LOADED");
//   const { user }          = useAuth();
//   console.log("USER:", user);
//   const { toasts, toast } = useToast();

//   const [donations,  setDonations]  = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [error,      setError]      = useState("");
//   const [view,       setView]       = useState("cards");
//   const [sortBy,     setSortBy]     = useState("newest");
//   const [filterBy,   setFilterBy]   = useState("all");
//   const [search,     setSearch]     = useState("");
//   const [selected,   setSelected]   = useState(null);
//   const [accepting,  setAccepting]  = useState(null);
//   const [collecting, setCollecting] = useState(null);

//   const socketRef = useRef(null);

//   // NGO's own location
//   const ngoLocation = user?.location?.coordinates
//     ? toLatLng(user.location.coordinates)
//     : null;
// console.log("NGO LOCATION:", ngoLocation);
//   // ── Load donations ─────────────────────────────────────
//   const load = useCallback(async () => {
//     try {
//       const res = await getAllRequests();
//       setDonations(res.data?.donations || res.data || []);
//     } catch (e) {
//       setError(e.response?.data?.message || "Failed to load donations.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { load(); }, [load]);

//   // ── Socket.io real-time ────────────────────────────────
//   useEffect(() => {
//     socketRef.current = io("http://localhost:3000", { withCredentials: true });
//     if (user?._id || user?.id) {
//       socketRef.current.emit("joinRoom", user._id || user.id);
//     }
//     socketRef.current.on("newDonation", (donation) => {
//       setDonations((prev) => {
//         if (prev.find((d) => d._id === donation._id)) return prev;
//         return [donation, ...prev];
//       });
//       toast.info(`🍱 New donation: "${donation.title}" assigned to you!`);
//     });
//     socketRef.current.on("donationUpdated", (updated) => {
//       setDonations((prev) =>
//         prev.map((d) => d._id === updated._id ? { ...d, ...updated } : d)
//       );
//     });
//     return () => socketRef.current?.disconnect();
//   }, [user]);

//   // ── Accept ─────────────────────────────────────────────
//   const handleAccept = async (id) => {
//     setAccepting(id);
//     try {
//       await acceptDonation(id);
//       setDonations((prev) =>
//         prev.map((d) => d._id === id ? { ...d, status: "accepted" } : d)
//       );
//       toast.success("Donation accepted! Donor has been notified. ✅");
//       if (selected?._id === id) setSelected((p) => ({ ...p, status: "accepted" }));
//     } catch (e) {
//       toast.error(e.response?.data?.message || "Failed to accept.");
//     } finally {
//       setAccepting(null);
//     }
//   };

//   // ── Collect ────────────────────────────────────────────
//   const handleCollect = async (id) => {
//     setCollecting(id);
//     try {
//       await collectDonation(id);
//       setDonations((prev) =>
//         prev.map((d) => d._id === id ? { ...d, status: "collected" } : d)
//       );
//       toast.success("Marked as collected! Great work. 🎉");
//       if (selected?._id === id) setSelected((p) => ({ ...p, status: "collected" }));
//     } catch (e) {
//       toast.error(e.response?.data?.message || "Failed to mark collected.");
//     } finally {
//       setCollecting(null);
//     }
//   };

//   // ── Stats ──────────────────────────────────────────────
//   const total     = donations.length;
//   const pending   = donations.filter((d) => d.status === "pending").length;
//   const accepted = donations.filter(
//   (d) => d.status === "accepted" || d.status === "collected"
// ).length;
//   const collected = donations.filter((d) => d.status === "collected").length;

//   // ── Filter + search + sort ─────────────────────────────
//   const processed = donations
//     .filter((d) => {
//       if (filterBy === "accepted") {
//   return d.status === "accepted" || d.status === "collected";
// }

// if (filterBy !== "all" && d.status !== filterBy) {
//   return false;
// }
//       if (search.trim()) {
//         const q = search.toLowerCase();
//         return (
//           d.title?.toLowerCase().includes(q) ||
//           d.pickupAddress?.toLowerCase().includes(q) ||
//           // ✅ donor || donorId
//           (d.donor || d.donorId)?.name?.toLowerCase().includes(q)
//         );
//       }
//       return true;
//     })
//     .sort((a, b) => {
//       if (sortBy === "priority")
//         return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);

//       if (sortBy === "expiry")
//         return new Date(a.expiryTime) - new Date(b.expiryTime);

//       if (sortBy === "distance" && ngoLocation) {
//         // ✅ donor || donorId for both a and b
//         const donorA = a.donor || a.donorId;
//         const donorB = b.donor || b.donorId;

//         const da = donorA?.location?.coordinates
//           ? Math.hypot(
//               donorA.location.coordinates[1] - ngoLocation.lat,
//               donorA.location.coordinates[0] - ngoLocation.lng
//             )
//           : 999;

//         const db = donorB?.location?.coordinates
//           ? Math.hypot(
//               donorB.location.coordinates[1] - ngoLocation.lat,
//               donorB.location.coordinates[0] - ngoLocation.lng
//             )
//           : 999;

//         return da - db;
//       }

//       // default: newest first
//       return new Date(b.createdAt) - new Date(a.createdAt);
//     });

//   const counts = FILTER_OPTIONS.reduce((acc, f) => {
//     acc[f.key] = f.key === "all"
//       ? donations.length
//       : donations.filter((d) => d.status === f.key).length;
//     return acc;
//   }, {});


//   return (
//     <NgoLayout
//       title={`Welcome, ${user?.ngoName || user?.name || "NGO"} 👋`}
//       subtitle="Manage incoming food donations in real time."
//     >
//       <ToastContainer toasts={toasts} />

//       {error && (
//         <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2">
//           <span>⚠️</span> {error}
//         </div>
//       )}

//       {loading ? <Spinner message="Loading donations..." /> : (
//         <>
//           {/* ── Stat cards ── */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//             <StatCard icon="🍱" label="Total Received" value={total}     color="orange" />
//             <StatCard icon="⏳" label="Pending"        value={pending}   color="purple" />
//             <StatCard icon="✅" label="Accepted"       value={accepted}  color="green"  />
//             <StatCard icon="🚚" label="Collected"      value={collected} color="blue"   />
//           </div>

//           {/* ── Toolbar ── */}
//           <div className="flex flex-col gap-4 mb-6">
//             {/* Search + View toggle */}
//             <div className="flex gap-3 items-center flex-wrap">
//               <div className="relative flex-1 min-w-[200px] max-w-sm">
//                 <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[14px]">🔍</span>
//                 <input
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Search donations..."
//                   className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] bg-white outline-none focus:border-[#E76F1A] focus:ring-2 focus:ring-[#E76F1A]/10"
//                 />
//               </div>
//               {/* Cards / Map toggle */}
//               <div className="flex bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
//                 <button
//                   onClick={() => setView("cards")}
//                   className={`px-4 py-2.5 text-[13px] font-semibold transition-colors ${view === "cards" ? "bg-[#E76F1A] text-white" : "text-[#6B7280] hover:bg-[#F9FAFB]"}`}
//                 >
//                   🃏 Cards
//                 </button>
//                 <button
//                   onClick={() => setView("map")}
//                   className={`px-4 py-2.5 text-[13px] font-semibold transition-colors ${view === "map" ? "bg-[#E76F1A] text-white" : "text-[#6B7280] hover:bg-[#F9FAFB]"}`}
//                 >
//                   🗺️ Map
//                 </button>
//               </div>
//             </div>

//             {/* Filter tabs + Sort */}
//             <div className="flex flex-wrap gap-2 items-center justify-between">
//               <div className="flex flex-wrap gap-2">
//                 {FILTER_OPTIONS.map((f) => (
//                   <button
//                     key={f.key}
//                     onClick={() => setFilterBy(f.key)}
//                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
//                       filterBy === f.key
//                         ? "bg-[#E76F1A] text-white shadow-sm"
//                         : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#E76F1A] hover:text-[#E76F1A]"
//                     }`}
//                   >
//                     {f.label}
//                     <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filterBy === f.key ? "bg-white/20" : "bg-[#F3F4F6]"}`}>
//                       {counts[f.key]}
//                     </span>
//                   </button>
//                 ))}
//               </div>
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="px-3 py-2 rounded-xl border border-[#E5E7EB] text-[12px] font-semibold text-[#374151] bg-white outline-none focus:border-[#E76F1A]"
//               >
//                 {SORT_OPTIONS.map((s) => (
//                   <option key={s.key} value={s.key}>{s.label}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* ── Cards View ── */}
//           {view === "cards" && (
//             processed.length === 0 ? (
//               <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
//                 <EmptyState
//                   icon="🍱"
//                   title="No donations found"
//                   subtitle="Donations assigned to your NGO will appear here in real time."
//                 />
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
//                 {processed.map((d) => (
//                   <DonationCard
//                     key={d._id}
//                     donation={d}
//                     ngoLocation={ngoLocation}
//                     onView={(donation) => setSelected(donation)}
//                     onAccept={handleAccept}
//                     onCollect={handleCollect}
//                     accepting={accepting}
//                     collecting={collecting}
//                   />
//                 ))}
//               </div>
//             )
//           )}

//           {/* ── Map View ── */}
//           {view === "map" && (
//             <div className="h-[600px] w-full">
//               <MapView
//                 ngoLocation={ngoLocation}
//                 donations={processed}
//                 onMarkerClick={(d) => setSelected(d)}
//               />
//             </div>
//           )}
//         </>
//       )}

//       {/* Detail Modal */}
//       {selected && (
//         <DonationModal
//           donation={selected}
//           onClose={() => setSelected(null)}
//           onAccept={handleAccept}
//           onCollect={handleCollect}
//           accepting={accepting === selected._id}
//           collecting={collecting === selected._id}
//         />
//       )}
//     </NgoLayout>
//   );
// };

// export default NgoDashboard;
// src/pages/ngo/NgoDashboard.jsx

// ✅ New filter tabs: all, pending, accepted, assigned, picked_up, completed, expired
// ✅ Accept button remains — NGO still accepts pending donations

import { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { getAllRequests, acceptDonation } from "../../service/ngoApi";
import { useAuth } from "../../context/AuthContext";
import NgoLayout from "../../components/ngo/NgoLayout";
import DonationCard from "../../components/ngo/DonationCard";
import DonationModal from "../../components/ngo/DonationModal";
import MapView from "../../components/ngo/MapView";
import { StatCard, Spinner, EmptyState } from "../../components/ngo/NgoUI";
import { toLatLng, calcDistance } from "../../utils/geo";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";

// ✅ Valid statuses only — no "collected"
const FILTER_OPTIONS = [
  { key: "all",       label: "All"        },
  { key: "pending",   label: "Pending"    },
  { key: "accepted",  label: "Accepted"   },
  { key: "assigned",  label: "Assigned"   },
  { key: "picked_up", label: "In Transit" },
  { key: "completed", label: "Completed"  },
  { key: "expired",   label: "Expired"    },
];

const SORT_OPTIONS = [
  { key: "newest",   label: "🕐 Newest First"  },
  { key: "priority", label: "🔴 Priority First" },
  { key: "expiry",   label: "⏳ Expiry First"   },
  { key: "distance", label: "📍 Nearest First"  },
];

const priorityOrder = { high: 0, medium: 1, low: 2 };

const NgoDashboard = () => {
  const { user }          = useAuth();
  const { toasts, toast } = useToast();

  const [donations,  setDonations]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [view,       setView]       = useState("cards");
  const [sortBy,     setSortBy]     = useState("newest");
  const [filterBy,   setFilterBy]   = useState("all");
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState(null);
  const [accepting,  setAccepting]  = useState(null);

  const socketRef = useRef(null);
  const ngoLocation = user?.location?.coordinates
    ? toLatLng(user.location.coordinates)
    : null;

  // ── Load donations ─────────────────────────────────────
  const load = useCallback(async () => {
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

  // ── Socket.IO real-time ────────────────────────────────
  useEffect(() => {
    socketRef.current = io("http://localhost:3000", { withCredentials: true });
    const ngoId = user?._id || user?.id;
    if (ngoId) socketRef.current.emit("joinRoom", ngoId);

    socketRef.current.on("newDonation", (donation) => {
      setDonations((prev) => prev.find((d) => d._id === donation._id) ? prev : [donation, ...prev]);
      toast.info(`🍱 New donation: "${donation.title}"`);
    });

    // When system auto-assigns a driver
    socketRef.current.on("driverAssigned", (data) => {
      toast.success(`🚗 ${data.message}`);
      // Update donation status in list
      setDonations((prev) =>
        prev.map((d) => d._id === data.donationId ? { ...d, status: "assigned" } : d)
      );
      if (selected?._id === data.donationId) {
        setSelected((p) => p ? { ...p, status: "assigned" } : p);
      }
    });

    // No driver found
    socketRef.current.on("noDriverAvailable", (data) => {
      toast.error(`⚠️ ${data.message}`);
    });

    // Driver picked up
    socketRef.current.on("donationPickedUp", (data) => {
      toast.info(`📦 ${data.message}`);
      setDonations((prev) =>
        prev.map((d) => d._id === data.donationId ? { ...d, status: "picked_up" } : d)
      );
    });

    // Driver completed delivery
    socketRef.current.on("donationCompleted", (data) => {
      toast.success(`🎉 ${data.message}`);
      setDonations((prev) =>
        prev.map((d) => d._id === data.donationId ? { ...d, status: "completed" } : d)
      );
    });

    return () => socketRef.current?.disconnect();
  }, [user]);

  // ── Accept donation (NGO) ──────────────────────────────
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

  // ── Stats ──────────────────────────────────────────────
  // ❌ No "collected" in stats
  const stats = {
    total:     donations.length,
    pending:   donations.filter((d) => d.status === "pending").length,
    active:    donations.filter((d) => ["accepted", "assigned", "picked_up"].includes(d.status)).length,
    completed: donations.filter((d) => d.status === "completed").length,
    expired:   donations.filter((d) => d.status === "expired").length,
  };

  // ── Filter + sort ──────────────────────────────────────
  const processed = donations
    .filter((d) => {
      if (filterBy !== "all" && d.status !== filterBy) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const donor = d.donor || d.donorId;
        return (
          d.title?.toLowerCase().includes(q) ||
          d.pickupAddress?.toLowerCase().includes(q) ||
          donor?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (sortBy === "expiry")   return new Date(a.expiryTime) - new Date(b.expiryTime);
      if (sortBy === "distance" && ngoLocation) {
        const getCoords = (d) => (d.donor || d.donorId)?.location?.coordinates;
        const da = getCoords(a) ? Math.hypot(getCoords(a)[1] - ngoLocation.lat, getCoords(a)[0] - ngoLocation.lng) : 999;
        const db = getCoords(b) ? Math.hypot(getCoords(b)[1] - ngoLocation.lat, getCoords(b)[0] - ngoLocation.lng) : 999;
        return da - db;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const counts = FILTER_OPTIONS.reduce((acc, f) => {
    acc[f.key] = f.key === "all" ? donations.length : donations.filter((d) => d.status === f.key).length;
    return acc;
  }, {});

  return (
    <NgoLayout
      title={`Welcome, ${user?.ngoName || user?.name || "NGO"} 👋`}
      subtitle="Monitor all donation requests in real time."
    >
      <ToastContainer toasts={toasts} />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? <Spinner message="Loading donations..." /> : (
        <>
          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard icon="🍱" label="Total"     value={stats.total}     color="orange" />
            <StatCard icon="⏳" label="Pending"   value={stats.pending}   color="purple" />
            <StatCard icon="🚗" label="Active"    value={stats.active}    color="blue"   />
            <StatCard icon="✅" label="Completed" value={stats.completed} color="green"  />
            <StatCard icon="⏰" label="Expired"   value={stats.expired}   color="red"    />
          </div>

          {/* ── Toolbar ── */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[14px]">🔍</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search donations..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] bg-white outline-none focus:border-[#E76F1A]" />
              </div>
              <div className="flex bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button onClick={() => setView("cards")}
                  className={`px-4 py-2.5 text-[13px] font-semibold transition-colors ${view === "cards" ? "bg-[#E76F1A] text-white" : "text-[#6B7280] hover:bg-[#F9FAFB]"}`}>
                  🃏 Cards
                </button>
                <button onClick={() => setView("map")}
                  className={`px-4 py-2.5 text-[13px] font-semibold transition-colors ${view === "map" ? "bg-[#E76F1A] text-white" : "text-[#6B7280] hover:bg-[#F9FAFB]"}`}>
                  🗺️ Map
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((f) => (
                  <button key={f.key} onClick={() => setFilterBy(f.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
                      filterBy === f.key
                        ? "bg-[#E76F1A] text-white shadow-sm"
                        : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#E76F1A] hover:text-[#E76F1A]"
                    }`}>
                    {f.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filterBy === f.key ? "bg-white/20" : "bg-[#F3F4F6]"}`}>
                      {counts[f.key] || 0}
                    </span>
                  </button>
                ))}
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E5E7EB] text-[12px] font-semibold text-[#374151] bg-white outline-none focus:border-[#E76F1A]">
                {SORT_OPTIONS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Cards ── */}
          {view === "cards" && (
            processed.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
                <EmptyState icon="🍱" title="No donations found" subtitle="Donations assigned to your NGO appear here in real time." />
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
            )
          )}

          {/* ── Map ── */}
          {view === "map" && (
            <div className="h-[600px] w-full">
              <MapView
                ngoLocation={ngoLocation}
                donations={processed}
                onMarkerClick={(d) => setSelected(d)}
              />
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
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

export default NgoDashboard;
