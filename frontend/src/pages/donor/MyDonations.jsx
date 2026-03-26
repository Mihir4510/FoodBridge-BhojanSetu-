// src/pages/donor/MyDonations.jsx

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyDonations } from "../../service/Donorapi";
import DonorLayout from "../../components/donor/DonorLayout";
import DonationList from "../../components/donor/DonationList";
import { Spinner } from "../../components/donor/DonorUI";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";

const FILTERS = [
  { key: "all",       label: "All",       icon: "🍱" },
  { key: "pending",   label: "Pending",   icon: "🟡" },
  { key: "accepted",  label: "Accepted",  icon: "🔵" },
  { key: "collected", label: "Completed", icon: "🟢" },
  { key: "expired",   label: "Expired",   icon: "🔴" },
];

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState("all");
  const { toasts, toast }         = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // GET /api/my-donation
      const res = await getMyDonations();
      setDonations(res.data?.donations || res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load your donations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Count per filter tab
  const counts = FILTERS.reduce((acc, f) => {
    acc[f.key] = f.key === "all"
      ? donations.length
      : donations.filter((d) => d.status === f.key).length;
    return acc;
  }, {});

  return (
    <DonorLayout title="My Donations" subtitle="Track all your food rescue entries.">
      <ToastContainer toasts={toasts} />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                filter === f.key
                  ? "bg-[#2D6A4F] text-white shadow-sm"
                  : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
              }`}
            >
              <span>{f.icon}</span>
              {f.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                filter === f.key ? "bg-white/20 text-white" : "bg-[#F3F4F6] text-[#6B7280]"
              }`}>
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>
        <Link
          to="/donor/create-donation"
          className="no-underline flex items-center gap-2 bg-[#E76F1A] text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#d4621a] transition-colors shadow-sm"
        >
          ➕ New Donation
        </Link>
      </div>

      {loading ? (
        <Spinner message="Loading your donations..." />
      ) : (
        <DonationList donations={donations} filter={filter} />
      )}
    </DonorLayout>
  );
};

export default MyDonations;
