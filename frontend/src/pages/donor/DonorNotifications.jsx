// src/pages/donor/DonorNotifications.jsx

import { useEffect, useState } from "react";
import { getMyDonations } from "../../service/Donorapi";
import DonorLayout from "../../components/donor/DonorLayout";
import { Spinner, EmptyState } from "../../components/donor/DonorUI";

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs  > 0) return `${hrs}h ago`;
  return `${mins}m ago`;
};

const DonorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    // GET /api/my-donation — filter only NGO-interacted ones
    getMyDonations()
      .then((res) => {
        const all = res.data?.donations || res.data || [];
        const notifs = all.filter((d) => ["accepted", "collected"].includes(d.status));
        setNotifications(notifs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DonorLayout title="Notifications"><Spinner /></DonorLayout>;

  return (
    <DonorLayout title="Notifications" subtitle="Updates from NGOs about your donations.">
      {/* Count badge */}
      {notifications.length > 0 && (
        <div className="mb-5">
          <span className="bg-[#D8F3DC] border border-[#B7E4C7] text-[#1A4731] text-[12px] font-semibold px-4 py-1.5 rounded-full">
            🔔 {notifications.length} update{notifications.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10">
          <EmptyState
            icon="🔔"
            title="No notifications yet"
            subtitle="When an NGO accepts or collects your donation, you'll see updates here."
          />
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {notifications.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                d.status === "collected" ? "bg-[#D8F3DC]" : "bg-[#DBEAFE]"
              }`}>
                {d.status === "collected" ? "✅" : "🏠"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#111827] mb-0.5">
                  {d.status === "accepted"
                    ? `${d.organization?.name || "An NGO"} accepted your donation`
                    : `${d.organization?.name || "An NGO"} collected your donation`
                  }
                </p>
                <p className="text-[13px] text-[#6B7280]">
                  <span className="font-medium text-[#374151]">{d.title}</span>
                  {" — "}{d.quantity} {d.unit || "plates"}
                </p>
                {d.organization?.phone && (
                  <p className="text-[12px] text-[#9CA3AF] mt-1.5 flex items-center gap-1">
                    <span>📞</span> {d.organization.phone}
                  </p>
                )}
                {d.pickupAddress && (
                  <p className="text-[12px] text-[#9CA3AF] mt-0.5 flex items-center gap-1">
                    <span>📍</span> {d.pickupAddress}
                  </p>
                )}
              </div>

              {/* Time */}
              <span className="text-[11px] text-[#9CA3AF] flex-shrink-0 whitespace-nowrap">
                {d.updatedAt ? timeAgo(d.updatedAt) : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </DonorLayout>
  );
};

export default DonorNotifications;
