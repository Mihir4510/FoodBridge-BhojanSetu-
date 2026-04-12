// src/pages/driver/DriverStatus.jsx
// Route: /driver/status
// Public — driver checks their application status by email

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplicationStatus } from "../../service/driverApplicationApi";

const DriverStatus = () => {
  const navigate = useNavigate();
  const [email,   setEmail]  = useState("");
  const [result,  setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]  = useState("");

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await getApplicationStatus(email.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "No application found for this email.");
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending:  { icon: "⏳", title: "Under Review",  bg: "bg-[#FEF3C7]", border: "border-[#FDE68A]", text: "text-[#92400E]",
                 message: "Your application is being reviewed by the NGO. This usually takes 1–2 business days." },
    approved: { icon: "✅", title: "Approved!",      bg: "bg-[#D8F3DC]", border: "border-[#B7E4C7]", text: "text-[#1A4731]",
                 message: "Congratulations! Your application was approved. Log in with your email and phone number as password." },
    rejected: { icon: "❌", title: "Not Selected",  bg: "bg-[#FEE2E2]", border: "border-[#FECACA]", text: "text-[#7F1D1D]",
                 message: "Unfortunately your application was not selected this time. You may apply to a different NGO." },
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-dm">
      <header className="bg-[#1A2E22] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-gradient-to-br from-[#2D6A4F] to-[#40916C] rounded-lg flex items-center justify-center text-base">🌿</div>
          <span className="text-white font-bold text-[16px]">BhojanSetu</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#FDE8D5] rounded-2xl flex items-center justify-center text-[28px] mx-auto mb-3">📋</div>
            <h1 className="text-[24px] font-bold text-[#111827]">Check Application Status</h1>
            <p className="text-[13px] text-[#9CA3AF] mt-1">Enter your email to see the latest update</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm mb-4">
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="The email you used to apply"
                  className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#E76F1A] focus:ring-2 focus:ring-[#E76F1A]/10"
                />
                {error && <p className="text-[12px] text-red-500">⚠ {error}</p>}
              </div>
              <button type="submit" disabled={loading}
                className={`w-full py-3 rounded-xl text-white font-semibold text-[14px] transition-all ${
                  loading ? "bg-[#E76F1A]/60 cursor-not-allowed" : "bg-[#E76F1A] hover:bg-[#d4621a]"
                }`}>
                {loading ? "Checking..." : "Check Status"}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-2xl border p-6 ${statusConfig[result.status]?.bg} ${statusConfig[result.status]?.border}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[28px]">{statusConfig[result.status]?.icon}</span>
                <div>
                  <p className={`font-bold text-[16px] ${statusConfig[result.status]?.text}`}>
                    {statusConfig[result.status]?.title}
                  </p>
                  <p className="text-[12px] text-[#6B7280]">NGO: {result.ngoName}</p>
                </div>
              </div>
              <p className={`text-[13px] leading-relaxed mb-4 ${statusConfig[result.status]?.text}`}>
                {statusConfig[result.status]?.message}
              </p>
              {result.rejectionReason && (
                <p className="text-[12px] text-[#7F1D1D] bg-white/50 rounded-xl px-3 py-2 mb-4">
                  Reason: {result.rejectionReason}
                </p>
              )}
              {result.status === "approved" && (
                <button onClick={() => navigate("/driver/login")}
                  className="w-full py-2.5 rounded-xl bg-[#2D6A4F] text-white font-semibold text-[13px] hover:bg-[#245a42] transition-colors">
                  🚗 Go to Driver Login
                </button>
              )}
              {result.status === "rejected" && (
                <button onClick={() => navigate("/driver/apply")}
                  className="w-full py-2.5 rounded-xl bg-[#E76F1A] text-white font-semibold text-[13px] hover:bg-[#d4621a] transition-colors">
                  Apply to Another NGO
                </button>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={() => navigate("/driver/apply")}
              className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] font-semibold text-[#6B7280] hover:bg-white transition-all">
              🚗 Apply as Driver
            </button>
            <button onClick={() => navigate("/driver/login")}
              className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] font-semibold text-[#6B7280] hover:bg-white transition-all">
              🔐 Driver Login
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .font-dm { font-family: 'DM Sans', sans-serif; }
      `}</style>
    </div>
  );
};

export default DriverStatus;
