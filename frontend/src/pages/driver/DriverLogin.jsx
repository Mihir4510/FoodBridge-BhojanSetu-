// src/pages/driver/DriverLogin.jsx
// Separate login page for drivers
// Route: /driver/login

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginDriver } from "../../service/driverApi";

const DriverLogin = () => {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res    = await loginDriver(form);
      const driver = res.data?.driver;
      // Store driver info for use in dashboard
      localStorage.setItem("driver", JSON.stringify({
        id:          driver.id,
        name:        driver.name,
        email:       driver.email,
        ngo:         driver.ngo,
        totalDeliveries: driver.totalDeliveries || 0,
      }));
      navigate("/driver/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center px-4 font-dm">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#E76F1A] to-[#F4A261] rounded-2xl flex items-center justify-center text-[28px] mx-auto mb-3 shadow-lg">
            🚗
          </div>
          <h1 className="text-[24px] font-bold text-[#111827]">Driver Login</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">BhojanSetu Delivery Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-7 shadow-sm">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px]">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[13px] font-semibold text-[#374151] block mb-1.5">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#E76F1A] focus:ring-2 focus:ring-[#E76F1A]/10"
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[#374151] block mb-1.5">Password</label>
              <input type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Default: your phone number"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#E76F1A] focus:ring-2 focus:ring-[#E76F1A]/10"
              />
            </div>

            <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-3 py-2.5 text-[12px] text-[#92400E]">
              ℹ️ First time? Your password is your registered phone number.
            </div>

            <button type="submit" disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all ${
                loading ? "bg-[#E76F1A]/60 cursor-not-allowed" : "bg-[#E76F1A] hover:bg-[#d4621a] hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(231,111,26,0.3)]"
              }`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Logging in...
                </span>
              ) : "🚗 Login as Driver"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#9CA3AF] mt-5">
          Contact your NGO manager if you have login issues.
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .font-dm { font-family: 'DM Sans', sans-serif; }
      `}</style>
    </div>
  );
};

export default DriverLogin;
