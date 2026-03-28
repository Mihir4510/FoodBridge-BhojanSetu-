// Handles all 3 backend response cases:
// Case 1: 1 NGO found  → auto create donation
// Case 2: Many NGOs   → show dropdown, resubmit with organizationId
// Case 3: No NGO      → show error toast

import { useState } from "react";
import { createDonation } from "../../service/Donorapi";
import { FormField, inputCls } from "./DonorUI";

// ── Auto priority from expiry time ────────────────────────
const calcPriority = (expiryTime) => {
  if (!expiryTime) return "low";
  const hours = (new Date(expiryTime) - new Date()) / 3600000;
  if (hours <= 3)  return "high";
  if (hours <= 12) return "medium";
  return "low";
};

const initialState = {
  title:         "",
  foodType:      "Food",
  quantity:      "",
  unit:          "plates",
  address:       "",
  expiryTime:    "",
  contactNumber: "",
  notes:         "",
};

// ── DonationForm ──────────────────────────────────────────
const DonationForm = ({ onSuccess, onCancel, toast }) => {
  const [form,       setForm]       = useState(initialState);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── NGO selection state ───────────────────────────────
  const [orgOptions,   setOrgOptions]   = useState([]); // list from backend
  const [selectedOrg,  setSelectedOrg]  = useState(""); // chosen org id
  const [noNGO,        setNoNGO]        = useState(false); // Case 3 flag

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev)   => ({ ...prev,   [name]: value }));
    setErrors((prev) => ({ ...prev,   [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())                   errs.title         = "Food title is required";
    if (!form.quantity || form.quantity <= 0) errs.quantity      = "Enter a valid quantity";
    if (!form.address.trim())                 errs.address       = "Pickup address is required";
    if (!form.expiryTime)                     errs.expiryTime    = "Expiry time is required";
    else if (new Date(form.expiryTime) <= new Date())
      errs.expiryTime = "Expiry must be in the future";
    if (!form.contactNumber.trim())           errs.contactNumber = "Contact number is required";

    // If NGO dropdown is showing, user must select one
    if (orgOptions.length > 0 && !selectedOrg)
      errs.organization = "Please select an NGO to continue";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setNoNGO(false);

    try {
      const payload = {
        title:          form.title,
        foodType:       form.foodType,
        quantity:       Number(form.quantity),
        unit:           form.unit,
        pickupAddress:  form.address,
        expiryTime:     form.expiryTime,
        contactNumber:  form.contactNumber,
        notes:          form.notes,
        priority:       calcPriority(form.expiryTime),
        organizationId: selectedOrg || undefined, // sent on 2nd submit
      };

      const res = await createDonation(payload);

// CASE 2: Multiple NGOs → show dropdown
if (res.data?.organizations && res.data.organizations.length > 0) {
  setOrgOptions(res.data.organizations); // populate dropdown
  toast.info(res.data.message || "Multiple NGOs found — please select one.");
  return;
}

// CASE 1: Single NGO assigned → donation created
if (res.data?.success && res.data?.donation) {
  toast.success("Donation created! Nearby NGO has been notified. 🎉");
  setForm(initialState);
  setOrgOptions([]);
  setSelectedOrg("");
  onSuccess?.();
  return;
}

// CASE 3: No NGOs → show toast / error message
if (!res.data.success && res.data?.organizations?.length === 0) {
  setNoNGO(true);
  toast.error(res.data.message || "No NGOs available nearby");

  return;
}
    } catch (err) {
      // Backend returned error (4xx / 5xx)
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset NGO selection ────────────────────────────────
  const handleCancelOrgSelection = () => {
    setOrgOptions([]);
    setSelectedOrg("");
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* ── Title + Food Type ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Food Title" error={errors.title} required>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Dal Makhani & Rice"
            className={inputCls(errors.title)}
          />
        </FormField>

        <FormField label="Food Type" required>
          <div className="flex gap-3">
            {["Food", "Grocery"].map((type) => (
              <label
                key={type}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all text-[13px] font-semibold ${
                  form.foodType === type
                    ? "border-[#2D6A4F] bg-[#D8F3DC] text-[#1A4731]"
                    : "border-[#E5E7EB] text-[#9CA3AF] hover:border-[#D1D5DB]"
                }`}
              >
                <input
                  type="radio"
                  name="foodType"
                  value={type}
                  checked={form.foodType === type}
                  onChange={handleChange}
                  className="sr-only"
                />
                {type === "Food" ? "🍛" : "🛒"} {type}
              </label>
            ))}
          </div>
        </FormField>
      </div>

      {/* ── Quantity + Unit ── */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Quantity" error={errors.quantity} required>
          <input
            name="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            placeholder="e.g. 25"
            className={inputCls(errors.quantity)}
          />
        </FormField>

        <FormField label="Unit">
          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className={inputCls(false)}
          >
            <option value="plates">Plates</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="litres">Litres</option>
            <option value="boxes">Boxes</option>
             <option value="boxes">Piece</option>
          </select>
        </FormField>
      </div>

      {/* ── Pickup Address ── */}
      <FormField label="Pickup Address" error={errors.address} required>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={2}
          placeholder="Full pickup address..."
          className={`${inputCls(errors.address)} resize-none`}
        />
      </FormField>

      {/* ── Expiry + Contact ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Expiry Date & Time" error={errors.expiryTime} required>
          <input
            type="datetime-local"
            name="expiryTime"
            value={form.expiryTime}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            className={inputCls(errors.expiryTime)}
          />
          {/* Auto priority preview */}
          {form.expiryTime && (
            <p className={`text-[11px] font-semibold mt-1 ${
              calcPriority(form.expiryTime) === "high"   ? "text-red-500"
              : calcPriority(form.expiryTime) === "medium" ? "text-yellow-500"
              : "text-[#2D6A4F]"
            }`}>
              Auto priority: {calcPriority(form.expiryTime).toUpperCase()}
            </p>
          )}
        </FormField>

        <FormField label="Contact Number" error={errors.contactNumber} required>
          <input
            name="contactNumber"
            type="tel"
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className={inputCls(errors.contactNumber)}
          />
        </FormField>
      </div>

      {/* ── Notes ── */}
      <FormField label="Additional Notes">
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          placeholder="Any special instructions for pickup..."
          className={`${inputCls(false)} resize-none`}
        />
      </FormField>

      {/* ── ⚠️ CASE 2: NGO Selection Dropdown ── */}
      {orgOptions.length > 0 && (
        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[14px] font-bold text-[#92400E] flex items-center gap-2">
                🏠 Multiple NGOs Found
              </p>
              <p className="text-[12px] text-[#92400E]/80 mt-0.5">
                {orgOptions.length} NGOs are available. Please select one to receive your donation.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancelOrgSelection}
              className="text-[#92400E]/60 hover:text-[#92400E] text-[12px] font-medium"
            >
              ✕ Cancel
            </button>
          </div>

          <FormField label="Select NGO" error={errors.organization} required>
            <select
              value={selectedOrg}
              onChange={(e) => {
                setSelectedOrg(e.target.value);
                setErrors((prev) => ({ ...prev, organization: "" }));
              }}
              className={inputCls(errors.organization)}
            >
              <option value="">-- Choose an NGO --</option>
              {orgOptions.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name || org.restaurantName || org.email}
                  {org.location?.city ? ` — ${org.location.city}` : ""}
                </option>
              ))}
            </select>
          </FormField>

          {/* NGO cards preview */}
          <div className="mt-3 space-y-2">
            {orgOptions.slice(0, 3).map((org) => (
              <label
                key={org._id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedOrg === org._id
                    ? "border-[#E76F1A] bg-[#FDE8D5]"
                    : "border-[#FDE68A] bg-white hover:border-[#E76F1A]/50"
                }`}
              >
                <input
                  type="radio"
                  name="orgSelect"
                  value={org._id}
                  checked={selectedOrg === org._id}
                  onChange={() => {
                    setSelectedOrg(org._id);
                    setErrors((prev) => ({ ...prev, organization: "" }));
                  }}
                  className="sr-only"
                />
                <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-base flex-shrink-0">
                  🏠
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1A1A2E] truncate">
                    {org.name || org.email}
                  </p>
                  {org.location?.city && (
                    <p className="text-[11px] text-[#9CA3AF]">📍 {org.location.city}</p>
                  )}
                </div>
                {selectedOrg === org._id && (
                  <span className="text-[#E76F1A] text-[16px] flex-shrink-0">✓</span>
                )}
              </label>
            ))}
            {orgOptions.length > 3 && (
              <p className="text-[11px] text-[#9CA3AF] text-center pt-1">
                +{orgOptions.length - 3} more in dropdown above
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── ❌ CASE 3: No NGO available ── */}
      {noNGO && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="text-xl mt-0.5">😔</span>
          <div>
            <p className="text-[13px] font-bold text-red-700">No NGOs available nearby</p>
            <p className="text-[12px] text-red-600 mt-0.5">
              There are currently no NGOs registered in your area. Please try again later or contact support.
            </p>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className={`flex-1 py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 ${
            submitting
              ? "bg-[#2D6A4F]/60 cursor-not-allowed"
              : "bg-[#2D6A4F] hover:bg-[#245a42] hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(45,106,79,0.3)]"
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              {orgOptions.length > 0 ? "Confirming..." : "Creating..."}
            </span>
          ) : (
            orgOptions.length > 0
              ? "✅ Confirm Donation with Selected NGO"
              : "🍱 Create Donation"
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3.5 rounded-xl border border-[#E5E7EB] text-[#6B7280] font-semibold text-[15px] hover:bg-[#F9FAFB] transition-all"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Step indicator when NGO selection is needed */}
      {orgOptions.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF]">
            <span className="w-5 h-5 rounded-full bg-[#2D6A4F] text-white text-[10px] flex items-center justify-center font-bold">✓</span>
            <span className="text-[#2D6A4F] font-medium">Form filled</span>
          </div>
          <div className="w-8 h-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2 text-[12px]">
            <span className="w-5 h-5 rounded-full bg-[#E76F1A] text-white text-[10px] flex items-center justify-center font-bold">2</span>
            <span className="text-[#E76F1A] font-medium">Select NGO</span>
          </div>
          <div className="w-8 h-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF]">
            <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[10px] flex items-center justify-center font-bold">3</span>
            <span>Confirm</span>
          </div>
        </div>
      )}
    </form>
  );
};

export default DonationForm;
