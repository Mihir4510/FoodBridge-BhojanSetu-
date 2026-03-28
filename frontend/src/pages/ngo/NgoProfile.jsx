// src/pages/ngo/NgoProfile.jsx

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import NgoLayout from "../../components/ngo/NgoLayout";
import axios from "axios";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";

const inputCls = (error) =>
  `w-full bg-white border rounded-xl px-4 py-3 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all duration-200 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-[#E5E7EB] focus:border-[#E76F1A] focus:ring-2 focus:ring-[#E76F1A]/10"
  }`;

const NgoProfile = () => {
  const { user, setUser }     = useAuth();
  const { toasts, toast }     = useToast();
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState("info"); // "info" | "password"

  const [form, setForm] = useState({
    name:             user?.name             || "",
    ngoName:          user?.ngoName          || "",
    email:            user?.email            || "",
    phone:            user?.phone            || "",
    registrationNo:   user?.registrationNo   || "",
    city:             user?.location?.city   || "",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });

  const [pwErrors, setPwErrors] = useState({});

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePwChange = (e) => {
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPwErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // ── Save profile ───────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(
        "http://localhost:3000/api/auth/update-profile",
        {
          name:           form.name,
          ngoName:        form.ngoName,
          phone:          form.phone,
          registrationNo: form.registrationNo,
          location:       { city: form.city },
        },
        { withCredentials: true }
      );
      setUser(res.data?.user || { ...user, ...form });
      toast.success("Profile updated successfully!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ───────────────────────────────────
  const handlePwSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = "Required";
    if (!pwForm.newPassword)     errs.newPassword     = "Required";
    else if (pwForm.newPassword.length < 8) errs.newPassword = "Min 8 characters";
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setSaving(true);
    try {
      await axios.put(
        "http://localhost:3000/api/auth/change-password",
        { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
        { withCredentials: true }
      );
      toast.success("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name = "") =>
    name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  const displayName = user?.ngoName || user?.name || "NGO";

  return (
    <NgoLayout title="Profile" subtitle="Manage your NGO account details.">
      <ToastContainer toasts={toasts} />

      <div className="max-w-2xl">

        {/* Profile header card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E76F1A] to-[#F4A261] flex items-center justify-center text-white text-[24px] font-bold flex-shrink-0">
            {getInitials(displayName)}
          </div>
          <div>
            <h2 className="font-playfair text-[22px] font-bold text-[#111827]">{displayName}</h2>
            <p className="text-[13px] text-[#6B7280] mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-[#FDE8D5] text-[#7C2D12] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                🏠 Organization
              </span>
              {user?.isApproved && (
                <span className="bg-[#D8F3DC] text-[#1A4731] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  ✅ Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white border border-[#E5E7EB] p-1.5 rounded-2xl">
          {[
            { key: "info",     label: "📋 Profile Info"    },
            { key: "password", label: "🔒 Change Password" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                tab === t.key
                  ? "bg-[#E76F1A] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#374151]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile Info Tab */}
        {tab === "info" && (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">Contact Person Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className={inputCls(false)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">NGO Name <span className="text-[#E76F1A]">*</span></label>
                <input name="ngoName" value={form.ngoName} onChange={handleChange} placeholder="e.g. Sahara Foundation" className={inputCls(false)} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#374151]">Email Address</label>
              <input value={form.email} disabled className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[14px] text-[#9CA3AF] cursor-not-allowed" />
              <p className="text-[11px] text-[#9CA3AF]">Email cannot be changed.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputCls(false)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">City</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Mumbai" className={inputCls(false)} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#374151]">Registration Number</label>
              <input name="registrationNo" value={form.registrationNo} onChange={handleChange} placeholder="e.g. MH/NGO/2021/12345" className={inputCls(false)} />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all ${
                saving ? "bg-[#E76F1A]/60 cursor-not-allowed" : "bg-[#E76F1A] hover:bg-[#d4621a] hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(231,111,26,0.3)]"
              }`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Saving...
                </span>
              ) : "💾 Save Profile"}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {tab === "password" && (
          <form onSubmit={handlePwSave} className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm space-y-5">
            {[
              { name: "currentPassword", label: "Current Password",  placeholder: "Enter current password" },
              { name: "newPassword",     label: "New Password",      placeholder: "Min. 8 characters"       },
              { name: "confirmPassword", label: "Confirm Password",  placeholder: "Re-enter new password"   },
            ].map((f) => (
              <div key={f.name} className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">{f.label}</label>
                <input
                  name={f.name}
                  type="password"
                  value={pwForm[f.name]}
                  onChange={handlePwChange}
                  placeholder={f.placeholder}
                  className={inputCls(pwErrors[f.name])}
                />
                {pwErrors[f.name] && (
                  <p className="text-[12px] text-red-500">⚠ {pwErrors[f.name]}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all ${
                saving ? "bg-[#2D6A4F]/60 cursor-not-allowed" : "bg-[#2D6A4F] hover:bg-[#245a42] hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(45,106,79,0.3)]"
              }`}
            >
              {saving ? "Changing..." : "🔒 Change Password"}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm       { font-family: 'DM Sans', sans-serif; }
      `}</style>
    </NgoLayout>
  );
};

export default NgoProfile;
