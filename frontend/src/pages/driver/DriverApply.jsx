// src/pages/driver/DriverApply.jsx
// Route: /driver/apply
// Public page — no login required
// Driver fills form → sees nearby NGOs → selects one → submits

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNearbyNgos, submitApplication } from "../../service/driverApplicationApi";

// ── Distance label config ─────────────────────────────────
const getDistanceStyle = (km) => {
  if (!km)    return { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", icon: "📍", label: "Unknown" };
  if (km <= 10) return { bg: "bg-[#D8F3DC]", text: "text-[#1A4731]", icon: "✅", label: "Nearby" };
  if (km <= 30) return { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", icon: "⚠️", label: "Moderate" };
  return          { bg: "bg-[#FEE2E2]", text: "text-[#7F1D1D]", icon: "❗", label: "Far" };
};

const inputCls = (err) =>
  `w-full bg-white border rounded-xl px-4 py-3 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all ${
    err ? "border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-[#E5E7EB] focus:border-[#E76F1A] focus:ring-2 focus:ring-[#E76F1A]/10"
  }`;

// ── Step indicator ────────────────────────────────────────
const Steps = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {[
      { n: 1, label: "Your Details" },
      { n: 2, label: "Select NGO"   },
      { n: 3, label: "Submitted"    },
    ].map((s, i) => (
      <div key={s.n} className="flex items-center">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
            current >= s.n
              ? "bg-[#E76F1A] text-white shadow-sm"
              : "bg-[#F3F4F6] text-[#9CA3AF]"
          }`}>
            {current > s.n ? "✓" : s.n}
          </div>
          <p className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
            current >= s.n ? "text-[#E76F1A]" : "text-[#9CA3AF]"
          }`}>{s.label}</p>
        </div>
        {i < 2 && (
          <div className={`w-16 h-px mb-4 transition-all ${current > s.n ? "bg-[#E76F1A]" : "bg-[#E5E7EB]"}`} />
        )}
      </div>
    ))}
  </div>
);

// ── Main Page ─────────────────────────────────────────────
const DriverApply = () => {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [ngos,    setNgos]    = useState([]);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [errors,  setErrors]  = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name:        "",
    email:       "",
    phone:       "",
    city:        "",
    vehicleType: "bike",
    capacity:    "30",
    experience:  "",
    lat:         "",
    lng:         "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ── Auto-detect location ────────────────────────────────
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: String(pos.coords.latitude),
          lng: String(pos.coords.longitude),
        }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  // ── Validate step 1 ─────────────────────────────────────
  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim())   errs.name  = "Name is required";
    if (!form.email.trim())  errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim())  errs.phone = "Phone is required";
    if (!form.city.trim())   errs.city  = "City is required";
    if (!form.capacity || Number(form.capacity) <= 0) errs.capacity = "Enter a valid capacity";
    return errs;
  };

  // ── Step 1 → 2: find nearby NGOs ────────────────────────
  const handleFindNgos = async (e) => {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (!form.lat || !form.lng) {
      setErrors({ lat: "Please detect your location or enter coordinates." });
      return;
    }

    setLoading(true);
    try {
      const res = await getNearbyNgos(form.lat, form.lng, 100000); // 100km radius
      setNgos(res.data?.ngos || []);
      setStep(2);
    } catch {
      setErrors({ general: "Failed to fetch nearby NGOs. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 → submit ─────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedNgo) {
      setErrors({ ngo: "Please select an NGO to apply to." });
      return;
    }
    setLoading(true);
    try {
      await submitApplication({
        ...form,
        capacity:       Number(form.capacity),
        ngoId:          selectedNgo._id,
        distanceFromNgo: selectedNgo.distance,
      });
      setSubmitted(true);
      setStep(3);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Submission failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-dm">

      {/* ── Header ── */}
      <header className="bg-[#1A2E22] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-gradient-to-br from-[#2D6A4F] to-[#40916C] rounded-lg flex items-center justify-center text-base">🌿</div>
          <span className="font-playfair text-white font-bold text-[16px]">BhojanSetu</span>
        </div>
        <button onClick={() => navigate("/driver/login")}
          className="text-white/70 text-[13px] font-semibold hover:text-white transition-colors flex items-center gap-1.5">
          🔐 Driver Login →
        </button>
      </header>

      <div className="max-w-xl mx-auto px-5 py-10">

        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#E76F1A] to-[#F4A261] rounded-2xl flex items-center justify-center text-[28px] mx-auto mb-4 shadow-lg">
            🚗
          </div>
          <h1 className="font-playfair text-[28px] font-bold text-[#111827] mb-2">
            Become a Driver
          </h1>
          <p className="text-[14px] text-[#6B7280] leading-relaxed max-w-sm mx-auto">
            Not just feeding people — we also create opportunities to serve and earn.
            Join a nearby NGO and help rescue food in your city.
          </p>
        </div>

        <Steps current={step} />

        {/* ── STEP 1: Driver Details ── */}
        {step === 1 && (
          <form onSubmit={handleFindNgos} className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm space-y-5" noValidate>
            <h2 className="text-[16px] font-bold text-[#111827] mb-1">Your Details</h2>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px]">
                ⚠️ {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">Full Name <span className="text-[#E76F1A]">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className={inputCls(errors.name)} />
                {errors.name && <p className="text-[12px] text-red-500">⚠ {errors.name}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">Email Address <span className="text-[#E76F1A]">*</span></label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" className={inputCls(errors.email)} />
                {errors.email && <p className="text-[12px] text-red-500">⚠ {errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">Phone Number <span className="text-[#E76F1A]">*</span></label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputCls(errors.phone)} />
                {errors.phone && <p className="text-[12px] text-red-500">⚠ {errors.phone}</p>}
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">City <span className="text-[#E76F1A]">*</span></label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="Indore, Mumbai..." className={inputCls(errors.city)} />
                {errors.city && <p className="text-[12px] text-red-500">⚠ {errors.city}</p>}
              </div>

              {/* Vehicle type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">Vehicle Type</label>
                <select name="vehicleType" value={form.vehicleType} onChange={handleChange} className={inputCls(false)}>
                  {["bike","scooter","auto","car","van","truck"].map((v) => (
                    <option key={v} value={v} className="capitalize">{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Capacity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">Capacity (kg/plates) <span className="text-[#E76F1A]">*</span></label>
                <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} placeholder="30" className={inputCls(errors.capacity)} />
                {errors.capacity && <p className="text-[12px] text-red-500">⚠ {errors.capacity}</p>}
              </div>
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#374151]">Brief Experience (optional)</label>
              <textarea name="experience" value={form.experience} onChange={handleChange} rows={2}
                placeholder="e.g. 2 years delivery experience, familiar with city routes..."
                className={`${inputCls(false)} resize-none`} />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-[#374151]">
                Your Location <span className="text-[#E76F1A]">*</span>
                <span className="text-[11px] text-[#9CA3AF] font-normal ml-1">(needed to find nearby NGOs)</span>
              </label>

              {form.lat && form.lng ? (
                <div className="flex items-center gap-2 bg-[#D8F3DC] border border-[#B7E4C7] rounded-xl px-4 py-3">
                  <span className="text-[16px]">📍</span>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#1A4731]">Location detected</p>
                    <p className="text-[11px] text-[#2D6A4F]">{parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}</p>
                  </div>
                  <button type="button" onClick={() => setForm({ ...form, lat: "", lng: "" })}
                    className="text-[#2D6A4F] text-[12px] font-semibold hover:underline">
                    Reset
                  </button>
                </div>
              ) : (
                <button type="button" onClick={detectLocation}
                  disabled={locating}
                  className="flex items-center justify-center gap-2 border-2 border-dashed border-[#E5E7EB] rounded-xl py-4 text-[13px] font-semibold text-[#6B7280] hover:border-[#E76F1A] hover:text-[#E76F1A] transition-all disabled:opacity-50">
                  {locating
                    ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg> Detecting...</>
                    : <><span>📍</span> Auto-detect My Location</>
                  }
                </button>
              )}
              {errors.lat && <p className="text-[12px] text-red-500">⚠ {errors.lat}</p>}
            </div>

            <button type="submit" disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all ${
                loading ? "bg-[#E76F1A]/60 cursor-not-allowed" : "bg-[#E76F1A] hover:bg-[#d4621a] hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(231,111,26,0.3)]"
              }`}>
              {loading
                ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Finding NGOs...</span>
                : "Find Nearby NGOs →"
              }
            </button>
          </form>
        )}

        {/* ── STEP 2: Select NGO ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
              <h2 className="text-[16px] font-bold text-[#111827] mb-1">Select an NGO</h2>
              <p className="text-[13px] text-[#6B7280]">
                {ngos.length} NGO{ngos.length !== 1 ? "s" : ""} found near you.
                Choose the one you'd like to deliver for.
              </p>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px]">
                ⚠️ {errors.general}
              </div>
            )}

            {ngos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
                <p className="text-[40px] mb-3">😔</p>
                <p className="text-[15px] font-semibold text-[#374151]">No NGOs found nearby</p>
                <p className="text-[13px] text-[#9CA3AF] mt-1">
                  No verified NGOs are registered within 100km of your location yet.
                </p>
                <button onClick={() => setStep(1)} className="mt-4 text-[13px] font-semibold text-[#E76F1A] hover:underline">
                  ← Go back
                </button>
              </div>
            ) : (
              <>
                {/* NGO list */}
                <div className="space-y-3">
                  {ngos.map((ngo) => {
                    const style   = getDistanceStyle(ngo.distance);
                    const isSelected = selectedNgo?._id === ngo._id;
                    return (
                      <div
                        key={ngo._id}
                        onClick={() => { setSelectedNgo(ngo); setErrors({ ...errors, ngo: "" }); }}
                        className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? "border-[#E76F1A] shadow-md bg-[#FFF7ED]"
                            : "border-[#E5E7EB] hover:border-[#E76F1A]/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Radio */}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              isSelected ? "border-[#E76F1A] bg-[#E76F1A]" : "border-[#D1D5DB]"
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[15px] text-[#111827] truncate">{ngo.name}</p>
                              <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                                📍 {ngo.city || "—"}
                              </p>
                            </div>
                          </div>

                          {/* Distance badge */}
                          <div className="flex-shrink-0 text-right">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                              {style.icon} {style.label}
                            </span>
                            {ngo.distance !== null && (
                              <p className="text-[12px] font-semibold text-[#374151] mt-1">
                                {ngo.distance} km away
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Warning for far NGOs */}
                        {ngo.isWarn && (
                          <div className="mt-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-3 py-2 flex items-start gap-2">
                            <span className="text-[14px] flex-shrink-0">⚠️</span>
                            <p className="text-[11px] text-[#92400E] leading-relaxed">
                              {ngo.warnMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {errors.ngo && (
                  <p className="text-[13px] text-red-500 flex items-center gap-1.5 px-1">
                    <span>⚠</span> {errors.ngo}
                  </p>
                )}

                {/* Selected summary */}
                {selectedNgo && (
                  <div className="bg-[#D8F3DC] border border-[#B7E4C7] rounded-2xl px-5 py-4 flex items-center gap-3">
                    <span className="text-[20px]">✅</span>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1A4731]">
                        Selected: {selectedNgo.name}
                      </p>
                      <p className="text-[11px] text-[#2D6A4F] mt-0.5">
                        {selectedNgo.distance} km away · Your application will be sent to them for review.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="px-5 py-3.5 rounded-xl border border-[#E5E7EB] text-[14px] font-semibold text-[#6B7280] hover:bg-[#F9FAFB] transition-all">
                    ← Back
                  </button>
                  <button onClick={handleSubmit} disabled={loading || !selectedNgo}
                    className={`flex-1 py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all ${
                      loading || !selectedNgo
                        ? "bg-[#E76F1A]/50 cursor-not-allowed"
                        : "bg-[#E76F1A] hover:bg-[#d4621a] hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(231,111,26,0.3)]"
                    }`}>
                    {loading
                      ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Submitting...</span>
                      : "Submit Application →"
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 shadow-sm text-center">
            <div className="w-16 h-16 bg-[#D8F3DC] rounded-full flex items-center justify-center text-[36px] mx-auto mb-5">
              🎉
            </div>
            <h2 className="font-playfair text-[26px] font-bold text-[#111827] mb-3">
              Application Submitted!
            </h2>
            <p className="text-[14px] text-[#6B7280] leading-relaxed mb-2 max-w-sm mx-auto">
              Your application has been sent to{" "}
              <strong className="text-[#374151]">{selectedNgo?.name}</strong>.
              They will review it and get back to you.
            </p>
            <p className="text-[13px] text-[#9CA3AF] mb-8">
              Once approved, you'll receive login credentials to access the driver dashboard.
            </p>

            {/* Check status */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-5 py-4 mb-6 text-left">
              <p className="text-[12px] font-semibold text-[#374151] mb-1">📧 Check your status anytime:</p>
              <p className="text-[12px] text-[#6B7280]">
                Visit <span className="font-mono text-[#2563EB]">/driver/status</span> and enter your email to check your application status.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={() => navigate("/driver/status")}
                className="w-full py-3 rounded-xl border border-[#E5E7EB] text-[14px] font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-all">
                📋 Check Application Status
              </button>
              <button onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl bg-[#2D6A4F] text-white text-[14px] font-semibold hover:bg-[#245a42] transition-all">
                🌿 Back to Home
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        .font-dm       { font-family: 'DM Sans', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default DriverApply;
