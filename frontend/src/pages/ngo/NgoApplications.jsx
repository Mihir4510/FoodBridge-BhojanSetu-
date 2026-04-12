// src/pages/ngo/NgoApplications.jsx
// Route: /ngo/applications
// NGO reviews pending driver applications, approve or reject

import { useEffect, useState } from "react";
import {
  getApplications,
  approveApplication,
  rejectApplication,
} from "../../service/driverApplicationApi";
import NgoLayout from "../../components/ngo/NgoLayout";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";

const getDistanceStyle = (km) => {
  if (!km || km <= 10) return { bg: "bg-[#D8F3DC]", text: "text-[#1A4731]", icon: "✅", label: "Nearby"   };
  if (km <= 30)        return { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", icon: "⚠️", label: "Moderate" };
  return                    { bg: "bg-[#FEE2E2]", text: "text-[#7F1D1D]", icon: "❗", label: "Far"      };
};

const VEHICLE_ICONS = {
  bike: "🏍️", scooter: "🛵", auto: "🛺", car: "🚗", van: "🚐", truck: "🚚",
};

const NgoApplications = () => {
  const [apps,      setApps]     = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [actionId,  setActionId] = useState(null);
  const [filter,    setFilter]   = useState("pending");
  const [rejectId,  setRejectId] = useState(null);
  const [reason,    setReason]   = useState("");
  const { toasts, toast }        = useToast();

  const load = async () => {
    try {
      const res = await getApplications();
      setApps(res.data?.applications || []);
    } catch { toast.error("Failed to load applications."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      const res = await approveApplication(id);
      toast.success(`Driver approved! Login: ${res.data.driver?.email} / ${res.data.driver?.phone}`);
      setApps((prev) => prev.map((a) => a._id === id ? { ...a, status: "approved" } : a));
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to approve.");
    } finally { setActionId(null); }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setActionId(rejectId);
    try {
      await rejectApplication(rejectId, reason);
      toast.info("Application rejected.");
      setApps((prev) => prev.map((a) => a._id === rejectId ? { ...a, status: "rejected", rejectionReason: reason } : a));
      setRejectId(null);
      setReason("");
    } catch { toast.error("Failed to reject."); }
    finally { setActionId(null); }
  };

  const filtered = apps.filter((a) => filter === "all" ? true : a.status === filter);
  const counts   = { pending: apps.filter(a => a.status === "pending").length, approved: apps.filter(a => a.status === "approved").length, rejected: apps.filter(a => a.status === "rejected").length };

  return (
    <NgoLayout title="Driver Applications" subtitle="Review and approve driver applications.">
      <ToastContainer toasts={toasts} />

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h3 className="font-bold text-[16px] text-[#111827] mb-3">Reject Application</h3>
            <p className="text-[13px] text-[#6B7280] mb-4">Optionally provide a reason for rejection.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)..."
              rows={3}
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-red-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectId(null); setReason(""); }}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] font-semibold text-[#6B7280]">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionId === rejectId}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 disabled:opacity-50">
                {actionId === rejectId ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending",  val: counts.pending,  color: "text-[#E76F1A]", bg: "bg-[#FDE8D5]", icon: "⏳" },
          { label: "Approved", val: counts.approved, color: "text-[#2D6A4F]", bg: "bg-[#D8F3DC]", icon: "✅" },
          { label: "Rejected", val: counts.rejected, color: "text-[#DC2626]", bg: "bg-[#FEE2E2]", icon: "❌" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm text-center">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center text-[18px] mx-auto mb-2`}>{s.icon}</div>
            <p className={`font-bold text-[26px] ${s.color} leading-none`}>{s.val}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold capitalize transition-all ${
              filter === f ? "bg-[#E76F1A] text-white shadow-sm" : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#E76F1A] hover:text-[#E76F1A]"
            }`}>
            {f === "all" ? `All (${apps.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f] || 0})`}
          </button>
        ))}
      </div>

      {/* Application cards */}
      {loading ? (
        <div className="text-center py-16 text-[#9CA3AF]">Loading applications...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
          <p className="text-[40px] mb-3">📋</p>
          <p className="text-[15px] font-semibold text-[#374151]">No {filter} applications</p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">
            Drivers can apply at <span className="font-mono text-[#2563EB]">/driver/apply</span>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const dist  = getDistanceStyle(app.distanceFromNgo);
            const isPending = app.status === "pending";
            return (
              <div key={app._id} className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${isPending ? "border-[#E5E7EB]" : app.status === "approved" ? "border-[#B7E4C7]" : "border-[#FECACA]"}`}>

                {/* Status bar */}
                <div className={`h-1 w-full rounded-full mb-4 ${isPending ? "bg-[#FDE68A]" : app.status === "approved" ? "bg-[#2D6A4F]" : "bg-red-400"}`} />

                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E76F1A] to-[#F4A261] flex items-center justify-center text-white font-bold text-[16px] flex-shrink-0">
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-[#111827]">{app.name}</p>
                      <p className="text-[12px] text-[#9CA3AF]">{app.email}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${
                    isPending ? "bg-[#FEF3C7] text-[#92400E]" : app.status === "approved" ? "bg-[#D8F3DC] text-[#1A4731]" : "bg-[#FEE2E2] text-[#7F1D1D]"
                  }`}>
                    {isPending ? "⏳" : app.status === "approved" ? "✅" : "❌"} {app.status}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Phone",    value: app.phone },
                    { label: "City",     value: app.city },
                    { label: "Vehicle",  value: `${VEHICLE_ICONS[app.vehicleType] || "🚗"} ${app.vehicleType}` },
                    { label: "Capacity", value: `${app.capacity} units` },
                  ].map((f) => (
                    <div key={f.label} className="bg-[#F9FAFB] rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">{f.label}</p>
                      <p className="text-[13px] font-semibold text-[#374151] capitalize mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>

                {/* Distance + experience */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {app.distanceFromNgo !== null && (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${dist.bg} ${dist.text}`}>
                      {dist.icon} {dist.label} — {app.distanceFromNgo} km away
                    </span>
                  )}
                  <span className="text-[11px] text-[#9CA3AF]">
                    Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>

                {app.experience && (
                  <p className="text-[12px] text-[#6B7280] italic mb-4 bg-[#F9FAFB] rounded-xl px-3 py-2">
                    💬 "{app.experience}"
                  </p>
                )}

                {app.rejectionReason && (
                  <p className="text-[12px] text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">
                    Rejection reason: {app.rejectionReason}
                  </p>
                )}

                {/* Actions — only for pending */}
                {isPending && (
                  <div className="flex gap-3 pt-3 border-t border-[#F3F4F6]">
                    <button onClick={() => handleApprove(app._id)} disabled={actionId === app._id}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-[#2D6A4F] text-white hover:bg-[#245a42] disabled:opacity-50 transition-colors">
                      {actionId === app._id ? "..." : "✅ Approve Driver"}
                    </button>
                    <button onClick={() => { setRejectId(app._id); setReason(""); }}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-white border border-red-300 text-red-600 hover:bg-red-50 transition-colors">
                      ❌ Reject
                    </button>
                  </div>
                )}

                {/* Approved — show credentials */}
                {app.status === "approved" && (
                  <div className="pt-3 border-t border-[#F3F4F6]">
                    <div className="bg-[#D8F3DC] rounded-xl px-4 py-3 text-[12px] text-[#1A4731]">
                      ✅ Account created · Login: <span className="font-mono font-bold">{app.email}</span> / <span className="font-mono font-bold">{app.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </NgoLayout>
  );
};

export default NgoApplications;
