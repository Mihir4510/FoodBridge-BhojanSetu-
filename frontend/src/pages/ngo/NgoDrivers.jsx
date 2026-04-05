// src/pages/ngo/NgoDrivers.jsx
// NGO can view all their drivers and register new ones
// Place in: src/pages/ngo/NgoDrivers.jsx

import { useEffect, useState } from "react";
import { getAllDrivers, registerDriver } from "../../service/driverApi";
import NgoLayout from "../../components/ngo/NgoLayout";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";

const inputCls = (err) =>
  `w-full bg-white border rounded-xl px-4 py-3 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all ${
    err ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-[#E5E7EB] focus:border-[#E76F1A] focus:ring-2 focus:ring-[#E76F1A]/10"
  }`;

const NgoDrivers = () => {
  const [drivers,     setDrivers]   = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [showForm,    setShowForm]  = useState(false);
  const [submitting,  setSubmitting] = useState(false);
  const { toasts, toast }           = useToast();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", capacity: "50", city: "", lat: "", lng: "",
  });
  const [errors, setErrors] = useState({});

  const load = async () => {
    try {
      const res = await getAllDrivers();
      setDrivers(res.data?.drivers || []);
    } catch { toast.error("Failed to load drivers."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = "Name required";
    if (!form.email.trim()) errs.email = "Email required";
    if (!form.phone.trim()) errs.phone = "Phone required";
    if (!form.capacity || Number(form.capacity) <= 0) errs.capacity = "Valid capacity required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await registerDriver({
        name:     form.name,
        email:    form.email,
        phone:    form.phone,
        capacity: Number(form.capacity),
        city:     form.city,
        lat:      Number(form.lat) || 0,
        lng:      Number(form.lng) || 0,
      });
      toast.success("Driver registered! Default password is their phone number.");
      setForm({ name: "", email: "", phone: "", capacity: "50", city: "", lat: "", lng: "" });
      setShowForm(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to register driver.");
    } finally { setSubmitting(false); }
  };

  const available  = drivers.filter((d) => d.isAvailable);
  const onDelivery = drivers.filter((d) => !d.isAvailable);

  return (
    <NgoLayout title="Drivers" subtitle="Manage your delivery team.">
      <ToastContainer toasts={toasts} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: "🚗", val: drivers.length, label: "Total Drivers", color: "text-[#E76F1A]" },
          { icon: "✅", val: available.length, label: "Available", color: "text-[#2D6A4F]" },
          { icon: "📦", val: onDelivery.length, label: "On Delivery", color: "text-[#2563EB]" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm text-center">
            <span className="text-[24px] block mb-2">{s.icon}</span>
            <p className={`font-bold text-[28px] ${s.color} leading-none`}>{s.val}</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[17px] font-bold text-[#111827]">Your Drivers</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#E76F1A] text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#d4621a] transition-colors">
          {showForm ? "✕ Cancel" : "➕ Add Driver"}
        </button>
      </div>

      {/* Register form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm mb-6 space-y-4">
          <h3 className="font-semibold text-[#111827] text-[15px] mb-2">Register New Driver</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "name",     label: "Full Name",      placeholder: "Driver's name"     },
              { name: "email",    label: "Email",          placeholder: "driver@email.com"  },
              { name: "phone",    label: "Phone",          placeholder: "+91 98765 43210"   },
              { name: "capacity", label: "Capacity (kg/plates)", placeholder: "50"          },
              { name: "city",     label: "City",           placeholder: "Indore"            },
            ].map((f) => (
              <div key={f.name} className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#374151]">{f.label}</label>
                <input name={f.name} value={form[f.name]} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                  placeholder={f.placeholder} className={inputCls(errors[f.name])} />
                {errors[f.name] && <p className="text-[12px] text-red-500">⚠ {errors[f.name]}</p>}
              </div>
            ))}
          </div>
          <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-3 text-[12px] text-[#92400E]">
            ℹ️ Default login password will be the driver's phone number. Ask them to change it on first login.
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#E76F1A] text-white font-semibold text-[14px] hover:bg-[#d4621a] disabled:opacity-50 transition-colors">
            {submitting ? "Registering..." : "➕ Register Driver"}
          </button>
        </form>
      )}

      {/* Driver list */}
      {loading ? (
        <div className="text-center py-12 text-[#9CA3AF]">Loading drivers...</div>
      ) : drivers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
          <p className="text-[40px] mb-3">🚗</p>
          <p className="text-[16px] font-semibold text-[#374151]">No drivers yet</p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">Add your first driver to enable auto-assignment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drivers.map((d) => (
            <div key={d._id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E76F1A] to-[#F4A261] flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0">
                {d.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px] text-[#111827]">{d.name}</p>
                <p className="text-[12px] text-[#9CA3AF]">{d.email} · {d.phone}</p>
                {d.currentDonationId && (
                  <p className="text-[11px] text-[#2563EB] font-medium mt-0.5">
                    📦 On delivery: {d.currentDonationId.title}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${d.isAvailable ? "bg-[#D8F3DC] text-[#1A4731]" : "bg-[#FEE2E2] text-[#7F1D1D]"}`}>
                  {d.isAvailable ? "✅ Available" : "🚗 On Delivery"}
                </span>
                <p className="text-[11px] text-[#9CA3AF] mt-1">Capacity: {d.capacity} | Deliveries: {d.totalDeliveries}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </NgoLayout>
  );
};

export default NgoDrivers;
