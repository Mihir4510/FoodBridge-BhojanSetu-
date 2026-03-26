// src/pages/donor/DonorDashboard.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDonations } from "../../service/Donorapi";
import DonorLayout from "../../components/donor/DonorLayout";
import { StatCard, Spinner, EmptyState, StatusBadge, PriorityBadge, Countdown } from "../../components/donor/DonorUI";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const { toasts, toast }         = useToast();

  useEffect(() => {
    // GET /api/my-donation
    getMyDonations()
      .then((res) => setDonations(res.data?.donations || res.data || []))
      .catch((e)  => setError(e.response?.data?.message || "Failed to load donations."))
      .finally(()  => setLoading(false));
  }, []);

  // ── Computed stats ──────────────────────────────────────
  const total     = donations.length;
  const active    = donations.filter((d) => ["pending", "accepted"].includes(d.status)).length;
  const completed = donations.filter((d) => d.status === "collected").length;
  const expired   = donations.filter((d) => d.status === "expired").length;

  const recent = [...donations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <DonorLayout title="Dashboard" subtitle="Your food rescue activity at a glance.">
      <ToastContainer toasts={toasts} />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? <Spinner /> : (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon="🍱" label="Total Donations"  value={total}     color="green"  />
            <StatCard icon="⏳" label="Active Donations" value={active}    color="orange" />
            <StatCard icon="✅" label="Completed"        value={completed} color="blue"   />
            <StatCard icon="🔴" label="Expired"          value={expired}   color="red"    />
          </div>

          {/* ── Quick actions ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { to: "/donor/create-donation", icon: "➕", label: "Create Donation", desc: "List surplus food",      primary: true  },
              { to: "/donor/my-donations",    icon: "🍱", label: "My Donations",    desc: "View & track",          primary: false },
              { to: "/donor/notifications",   icon: "🔔", label: "Notifications",   desc: "NGO acceptance alerts", primary: false },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-2xl p-5 border border-[#E5E7EB] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all no-underline flex items-center gap-4 ${
                  item.primary ? "bg-[#2D6A4F]" : "bg-white"
                }`}
              >
                <span className="text-[28px]">{item.icon}</span>
                <div>
                  <p className={`font-bold text-[15px] ${item.primary ? "text-white" : "text-[#111827]"}`}>{item.label}</p>
                  <p className={`text-[12px] ${item.primary ? "text-white/70" : "text-[#9CA3AF]"}`}>{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Recent donations table ── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[17px] font-bold text-[#111827]">Recent Donations</h2>
                <p className="text-[12px] text-[#9CA3AF]">Your latest 5 entries</p>
              </div>
              <Link to="/donor/my-donations" className="text-[13px] font-semibold text-[#2D6A4F] hover:underline no-underline">
                View all →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
                <EmptyState icon="🍱" title="No donations yet" subtitle="Start by creating your first food donation." />
                <div className="text-center mt-3">
                  <Link to="/donor/create-donation" className="no-underline inline-flex items-center gap-2 bg-[#2D6A4F] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#245a42] transition-colors">
                    ➕ Create First Donation
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#F3F4F6] bg-[#F9FAFB]">
                        {["Food", "Quantity", "Status", "Priority", "Expiry", "Date"].map((h) => (
                          <th key={h} className="px-5 py-3.5 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((d, i) => (
                        <tr key={d._id} className={`border-b border-[#F3F4F6] hover:bg-[#FAFAFA] last:border-0 ${i % 2 === 1 ? "bg-[#FAFAFA]/50" : ""}`}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px]">{d.foodType === "veg" ? "🥦" : "🍗"}</span>
                              <span className="font-semibold text-[13px] text-[#111827]">{d.title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-[#374151]">
                            {d.quantity} <span className="text-[#9CA3AF] capitalize">{d.unit || "plates"}</span>
                          </td>
                          <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                          <td className="px-5 py-3.5"><PriorityBadge priority={d.priority} /></td>
                          <td className="px-5 py-3.5">
                            {d.expiryTime && !["collected", "expired"].includes(d.status)
                              ? <Countdown expiryTime={d.expiryTime} />
                              : <span className="text-[12px] text-[#9CA3AF]">—</span>
                            }
                          </td>
                          <td className="px-5 py-3.5 text-[12px] text-[#9CA3AF]">
                            {d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-IN") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DonorLayout>
  );
};

export default DonorDashboard;
