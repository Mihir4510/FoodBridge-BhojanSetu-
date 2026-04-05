// src/pages/driver/DriverDashboard.jsx
// Driver sees assigned donations, can mark pickup and completion
// Also shows live optimized route on map

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import {
  getDriverDonations,
  pickupDonation,
  completeDonation,
  getOptimizedRoute,
  updateDriverLocation,
} from "../../service/driverApi";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";
import DriverRouteMap from "../../components/driver/DriverRouteMap";

// ── Status badge ──────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    assigned:  "bg-[#FEF3C7] text-[#92400E]",
    picked_up: "bg-[#DBEAFE] text-[#1E40AF]",
    completed: "bg-[#D8F3DC] text-[#1A4731]",
  };
  const labels = {
    assigned:  "🚗 Assigned",
    picked_up: "📦 Picked Up",
    completed: "✅ Completed",
  };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status}
    </span>
  );
};

// ── Priority badge ─────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const map = {
    high:   "bg-[#FEE2E2] text-[#7F1D1D]",
    medium: "bg-[#FEF3C7] text-[#92400E]",
    low:    "bg-[#D8F3DC] text-[#1A4731]",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${map[priority] || map.low}`}>
      {priority === "high" ? "🔴" : priority === "medium" ? "🟡" : "🟢"} {priority}
    </span>
  );
};

// ── Countdown ──────────────────────────────────────────────
const Countdown = ({ expiryTime }) => {
  const [label, setLabel] = useState("");
  const [urgent, setUrgent] = useState(false);
  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiryTime) - new Date();
      if (diff <= 0) { setLabel("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setUrgent(h < 3);
      setLabel(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
    };
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [expiryTime]);
  return (
    <span className={`text-[11px] font-semibold ${urgent ? "text-red-500 animate-pulse" : "text-[#9CA3AF]"}`}>
      {urgent && label !== "Expired" ? "⚠️ " : "🕐 "}{label}
    </span>
  );
};

// ── Driver Dashboard ───────────────────────────────────────
const DriverDashboard = () => {
  const [donations,  setDonations]  = useState([]);
  const [route,      setRoute]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState("list"); // "list" | "map"
  const [actionId,   setActionId]   = useState(null);
  const { toasts, toast }           = useToast();
  const socketRef                   = useRef(null);

  // ── Load assigned donations ─────────────────────────────
  const load = async () => {
    try {
      const [donRes, routeRes] = await Promise.all([
        getDriverDonations(),
        getOptimizedRoute(),
      ]);
      setDonations(donRes.data?.donations || []);
      setRoute(routeRes.data);
    } catch (e) {
      toast.error("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Socket.IO — listen for new assignment ───────────────
  useEffect(() => {
    const driver = JSON.parse(localStorage.getItem("driver") || "{}");
    if (!driver?.id) return;

    socketRef.current = io("http://localhost:3000", { withCredentials: true });
    socketRef.current.emit("joinDriverRoom", driver.id);

    socketRef.current.on("donationAssigned", (data) => {
      toast.info(`🍱 New assignment: "${data.donation?.title}" — ${data.distance}`);
      load(); // refresh list
    });

    return () => socketRef.current?.disconnect();
  }, []);

  // ── GPS update every 60 seconds ─────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => updateDriverLocation(pos.coords.latitude, pos.coords.longitude),
        () => {}
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Pickup ─────────────────────────────────────────────
  const handlePickup = async (id) => {
    setActionId(id);
    try {
      await pickupDonation(id);
      setDonations((prev) =>
        prev.map((d) => d._id === id ? { ...d, status: "picked_up" } : d)
      );
      toast.success("Marked as picked up! Head to the NGO. 🚗");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update.");
    } finally { setActionId(null); }
  };

  // ── Complete ───────────────────────────────────────────
  const handleComplete = async (id) => {
    setActionId(id);
    try {
      await completeDonation(id);
      setDonations((prev) => prev.filter((d) => d._id !== id));
      toast.success("Delivery completed! Great work. 🎉");
      load(); // refresh route
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to complete.");
    } finally { setActionId(null); }
  };

  const assigned  = donations.filter((d) => d.status === "assigned");
  const pickedUp  = donations.filter((d) => d.status === "picked_up");
  const driver    = JSON.parse(localStorage.getItem("driver") || "{}");

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-dm">
      <ToastContainer toasts={toasts} />

      {/* ── Top bar ── */}
      <header className="bg-[#1A2E22] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E76F1A] to-[#F4A261] rounded-lg flex items-center justify-center text-base">
            🚗
          </div>
          <div>
            <p className="text-white font-bold text-[15px] leading-none">BhojanSetu Driver</p>
            <p className="text-white/50 text-[11px]">{driver?.name || "Driver"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${view === "list" ? "bg-[#E76F1A] text-white" : "text-white/60 hover:text-white"}`}>
            📋 List
          </button>
          <button onClick={() => setView("map")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${view === "map" ? "bg-[#E76F1A] text-white" : "text-white/60 hover:text-white"}`}>
            🗺️ Route Map
          </button>
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="animate-spin w-8 h-8 text-[#E76F1A]" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
              <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <p className="text-[13px] text-[#9CA3AF]">Loading assignments...</p>
          </div>
        ) : view === "map" ? (
          // ── Map view ──
          <div className="h-[500px] rounded-2xl overflow-hidden">
            <DriverRouteMap route={route} />
          </div>
        ) : (
          // ── List view ──
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: "🚗", val: assigned.length,  label: "Assigned"  },
                { icon: "📦", val: pickedUp.length,  label: "Picked Up" },
                { icon: "✅", val: driver?.totalDeliveries || 0, label: "Total Done" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm text-center">
                  <span className="text-[24px] block mb-1">{s.icon}</span>
                  <p className="font-bold text-[22px] text-[#E76F1A] leading-none">{s.val}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Route summary */}
            {route?.route?.length > 0 && (
              <div className="bg-[#1A2E22] rounded-2xl p-4 mb-6 text-white">
                <p className="text-[13px] font-semibold mb-2">🗺️ Today's Route</p>
                <div className="flex gap-4">
                  <div><p className="text-[22px] font-bold text-[#E76F1A]">{route.totalDistance} km</p><p className="text-[11px] text-white/50">Total distance</p></div>
                  <div><p className="text-[22px] font-bold text-[#E76F1A]">{route.estimatedMinutes} min</p><p className="text-[11px] text-white/50">Estimated time</p></div>
                  <div><p className="text-[22px] font-bold text-[#E76F1A]">{route.stopCount}</p><p className="text-[11px] text-white/50">Stops</p></div>
                </div>
              </div>
            )}

            {/* Donation cards */}
            {donations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
                <p className="text-[40px] mb-3">🎉</p>
                <p className="text-[16px] font-semibold text-[#374151]">No active assignments</p>
                <p className="text-[13px] text-[#9CA3AF] mt-1">You're all caught up! Wait for new donations to be assigned.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show route order */}
                {route?.route?.filter(s => !s.isDestination).map((stop, idx) => {
                  const donation = donations.find((d) => d._id?.toString() === stop.id);
                  if (!donation) return null;
                  return (
                    <div key={donation._id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
                      {/* Route stop number */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-[#E76F1A] text-white text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <span className="text-[12px] text-[#9CA3AF]">Stop {idx + 1} of {route.route.filter(s => !s.isDestination).length}</span>
                        {stop.distanceFromPrev > 0 && (
                          <span className="text-[11px] text-[#2563EB] font-semibold ml-auto">
                            🚗 {stop.distanceFromPrev} km from prev
                          </span>
                        )}
                      </div>

                      {/* Donation details */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#111827] text-[15px] mb-1.5">{donation.title}</h3>
                          <div className="flex gap-2 flex-wrap">
                            <StatusBadge status={donation.status} />
                            <PriorityBadge priority={donation.priority} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[22px] font-bold text-[#E76F1A] leading-none">{donation.quantity}</p>
                          <p className="text-[11px] text-[#9CA3AF]">{donation.unit}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                          <span>📍</span>
                          <span className="truncate">{donation.pickupAddress || donation.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                          <span>👤</span>
                          <span>{donation.donor?.name || "Donor"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                            <span>📞</span>
                            <a href={`tel:${donation.contactNumber}`} className="text-[#2563EB] font-semibold no-underline">
                              {donation.contactNumber}
                            </a>
                          </div>
                          <Countdown expiryTime={donation.expiryTime} />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 pt-3 border-t border-[#F3F4F6]">
                        {/* Google Maps nav link */}
                        {stop.lat && stop.lng && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold bg-[#DBEAFE] text-[#1E40AF] flex items-center justify-center gap-1.5 no-underline hover:bg-[#BFDBFE] transition-colors"
                          >
                            🗺️ Navigate
                          </a>
                        )}

                        {donation.status === "assigned" && (
                          <button
                            onClick={() => handlePickup(donation._id)}
                            disabled={actionId === donation._id}
                            className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold bg-[#E76F1A] text-white hover:bg-[#d4621a] disabled:opacity-50 transition-colors"
                          >
                            {actionId === donation._id ? "..." : "📦 Picked Up"}
                          </button>
                        )}

                        {donation.status === "picked_up" && (
                          <button
                            onClick={() => handleComplete(donation._id)}
                            disabled={actionId === donation._id}
                            className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold bg-[#2D6A4F] text-white hover:bg-[#245a42] disabled:opacity-50 transition-colors"
                          >
                            {actionId === donation._id ? "..." : "✅ Delivered"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Donations not in route (fallback) */}
                {donations.filter(d => !route?.route?.find(s => s.id === d._id?.toString())).map((donation) => (
                  <div key={donation._id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-[#111827] text-[15px] mb-1">{donation.title}</h3>
                        <StatusBadge status={donation.status} />
                      </div>
                      <div className="text-right">
                        <p className="text-[20px] font-bold text-[#E76F1A]">{donation.quantity}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{donation.unit}</p>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#6B7280] mb-3">📍 {donation.pickupAddress}</p>
                    <div className="flex gap-2">
                      {donation.status === "assigned" && (
                        <button onClick={() => handlePickup(donation._id)} disabled={actionId === donation._id}
                          className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold bg-[#E76F1A] text-white disabled:opacity-50">
                          {actionId === donation._id ? "..." : "📦 Picked Up"}
                        </button>
                      )}
                      {donation.status === "picked_up" && (
                        <button onClick={() => handleComplete(donation._id)} disabled={actionId === donation._id}
                          className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold bg-[#2D6A4F] text-white disabled:opacity-50">
                          {actionId === donation._id ? "..." : "✅ Delivered"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .font-dm { font-family: 'DM Sans', sans-serif; }
      `}</style>
    </div>
  );
};

export default DriverDashboard;
