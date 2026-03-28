// src/pages/ngo/NgoNotifications.jsx

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { getAllRequests } from "../../service/ngoApi";
import { useAuth } from "../../context/AuthContext";
import NgoLayout from "../../components/ngo/NgoLayout";
import { Spinner, EmptyState, PriorityBadge } from "../../components/ngo/NgoUI";

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs  > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
};

const NgoNotifications = () => {
  const { user }                    = useAuth();
  const [notifications, setNotifs]  = useState([]);
  const [live,          setLive]    = useState([]); // real-time ones
  const [loading,       setLoading] = useState(true);
  const socketRef                   = useRef(null);

  // ── Load past donations as notifications ──────────────
  useEffect(() => {
    getAllRequests()
      .then((res) => {
        const all = res.data?.donations || res.data || [];
        // Turn every donation into a notification entry
        const notifs = all
          .map((d) => ({
            id:       d._id,
            type:     d.status === "accepted"  ? "accepted"
                    : d.status === "collected" ? "collected"
                    : "new",
            title:    d.title,
            quantity: d.quantity,
            unit:     d.unit || "plates",
            donor:    d.donor?.name || "A donor",
            priority: d.priority,
            time:     d.updatedAt || d.createdAt,
            read:     d.status !== "pending",
          }))
          .sort((a, b) => new Date(b.time) - new Date(a.time));
        setNotifs(notifs);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Socket.io real-time notifications ─────────────────
  useEffect(() => {
    socketRef.current = io("http://localhost:3000", { withCredentials: true });
    if (user?._id || user?.id) {
      socketRef.current.emit("joinRoom", user._id || user.id);
    }
    socketRef.current.on("newDonation", (donation) => {
      const notif = {
        id:       donation._id,
        type:     "new",
        title:    donation.title,
        quantity: donation.quantity,
        unit:     donation.unit || "plates",
        donor:    donation.donor?.name || "A donor",
        priority: donation.priority,
        time:     new Date().toISOString(),
        read:     false,
        isLive:   true,
      };
      setLive((prev) => [notif, ...prev]);
    });
    return () => socketRef.current?.disconnect();
  }, [user]);

  const allNotifs = [...live, ...notifications];
  const unread    = allNotifs.filter((n) => !n.read).length;

  const typeConfig = {
    new:       { icon: "🍱", bg: "bg-[#D8F3DC]",  text: "text-[#1A4731]",  label: "New Donation Assigned"   },
    accepted:  { icon: "✅", bg: "bg-[#DBEAFE]",  text: "text-[#1E40AF]",  label: "Donation Accepted"        },
    collected: { icon: "🚚", bg: "bg-[#EDE9FE]",  text: "text-[#4C1D95]",  label: "Donation Collected"       },
  };

  if (loading) return <NgoLayout title="Notifications"><Spinner /></NgoLayout>;

  return (
    <NgoLayout title="Notifications" subtitle="Real-time updates on donation activity.">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {unread > 0 && (
            <span className="bg-[#E76F1A] text-white text-[12px] font-bold px-3 py-1 rounded-full">
              {unread} new
            </span>
          )}
          {live.length > 0 && (
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2D6A4F] bg-[#D8F3DC] px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
              Live updates active
            </span>
          )}
        </div>
      </div>

      {allNotifs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10">
          <EmptyState icon="🔔" title="No notifications yet" subtitle="When donors create donations assigned to your NGO, you'll see them here." />
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {allNotifs.map((n, i) => {
            const cfg = typeConfig[n.type] || typeConfig.new;
            return (
              <div
                key={`${n.id}-${i}`}
                className={`bg-white rounded-2xl border p-5 shadow-sm flex items-start gap-4 transition-all hover:shadow-md ${
                  !n.read ? "border-[#E76F1A]/30 bg-[#FFF7ED]/50" : "border-[#E5E7EB]"
                } ${n.isLive ? "ring-2 ring-[#2D6A4F]/20" : ""}`}
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cfg.bg}`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[14px] font-bold text-[#111827]">{cfg.label}</p>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#E76F1A] flex-shrink-0" />
                    )}
                    {n.isLive && (
                      <span className="text-[10px] font-bold bg-[#D8F3DC] text-[#1A4731] px-2 py-0.5 rounded-full uppercase tracking-wide">Live</span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#374151] mb-1">
                    <span className="font-semibold">{n.title}</span>
                    {" — "}{n.quantity} {n.unit}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF]">
                    From: <span className="font-medium text-[#6B7280]">{n.donor}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <PriorityBadge priority={n.priority} />
                  </div>
                </div>

                {/* Time */}
                <span className="text-[11px] text-[#9CA3AF] flex-shrink-0 whitespace-nowrap">
                  {timeAgo(n.time)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </NgoLayout>
  );
};

export default NgoNotifications;
