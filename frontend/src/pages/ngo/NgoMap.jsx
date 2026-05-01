// src/pages/ngo/NgoMap.jsx

import { useEffect, useState } from "react";
import { getAllRequests } from "../../service/ngoApi";
import { useAuth } from "../../context/AuthContext";
import NgoLayout from "../../components/ngo/NgoLayout";
import MapView from "../../components/ngo/MapView";
import DonationModal from "../../components/ngo/DonationModal";
import { Spinner,  PriorityBadge, StatusBadge } from "../../components/ngo/NgoUI";
import { toLatLng } from "../../utils/geo"; 

const NgoMap = () => {
  const { user }                        = useAuth();
  const [donations,  setDonations]      = useState([]);
  const [loading,    setLoading]        = useState(true);
  const [selected,   setSelected]       = useState(null);
  const [filterPriority, setFilter]     = useState("all");

  const ngoLocation = user?.location?.coordinates
    ? toLatLng(user.location.coordinates)
    : null;

  useEffect(() => {
    getAllRequests()
      .then((res) => {
  const data = Array.isArray(res.data?.donations)
    ? res.data.donations
    : [];
  setDonations(data);
})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterPriority === "all"
    ? donations
    : donations.filter((d) => d.priority === filterPriority);

  if (loading) return <NgoLayout title="Map View"><Spinner /></NgoLayout>;

  return (
    <NgoLayout title="Map View" subtitle="See all donations and their locations on the map.">

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center justify-between">
        <div className="flex gap-2">
          {["all", "high", "medium", "low"].map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold capitalize transition-all ${
                filterPriority === p
                  ? "bg-[#E76F1A] text-white shadow-sm"
                  : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#E76F1A] hover:text-[#E76F1A]"
              }`}
            >
              {p === "all" ? "All" : p === "high" ? "🔴 High" : p === "medium" ? "🟡 Medium" : "🟢 Low"}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filterPriority === p ? "bg-white/20" : "bg-[#F3F4F6]"}`}>
                {p === "all" ? donations.length : donations.filter((d) => d.priority === p).length}
              </span>
            </button>
          ))}
        </div>

        {!ngoLocation && (
          <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[12px] font-semibold px-4 py-2 rounded-xl">
            ⚠️ Add your location in Profile to see your position on the map
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-[500px] mb-6">
        <MapView
          ngoLocation={ngoLocation}
          donations={filtered}
          onMarkerClick={(d) => setSelected(d)}
        />
      </div>

      {/* Donations list below map */}
      <div>
        <h2 className="text-[16px] font-bold text-[#111827] mb-4">
          📍 {filtered.length} Donation{filtered.length !== 1 ? "s" : ""} on Map
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => {
            const coords = toLatLng(d.donor?.location?.coordinates || d.location?.coordinates);
            const mapsUrl = coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : null;
            return (
              <div
                key={d._id}
                className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                onClick={() => setSelected(d)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-[14px] text-[#111827] truncate flex-1">{d.title}</p>
                  <PriorityBadge priority={d.priority} />
                </div>
                <p className="text-[12px] text-[#6B7280] mb-2 line-clamp-1">
                  📍 {d.pickupAddress || d.address || "—"}
                </p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={d.status} />
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-semibold text-[#2563EB] hover:underline no-underline"
                    >
                      Open Maps →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <DonationModal
          donation={selected}
          onClose={() => setSelected(null)}
          onAccept={() => {}}
          onCollect={() => {}}
          accepting={false}
          collecting={false}
        />
      )}
    </NgoLayout>
  );
};

export default NgoMap;
