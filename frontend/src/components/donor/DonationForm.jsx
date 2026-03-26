// src/components/donor/DonationForm.jsx

import { useState } from "react";
import { createDonation } from "../../service/Donorapi";
import { FormField, inputCls } from "./DonorUI";

// ── Auto priority calculator ──────────────────────────────
const calcPriority = (expiryTime) => {
  if (!expiryTime) return "low";
  const hours = (new Date(expiryTime) - new Date()) / 3600000;
  if (hours <= 3)  return "high";
  if (hours <= 12) return "medium";
  return "low";
};

const initialState = {
  title:         "",
  foodType:      "veg",
  quantity:      "",
  unit:          "plates",
  address:       "",
  expiryTime:    "",
  contactNumber: "",
  notes:         "",
};

// ── DonationForm ──────────────────────────────────────────
// Note: Edit is disabled — your backend only has POST /create
// For edit support, add a PUT /update/:id route to your backend
const DonationForm = ({ onSuccess, onCancel, toast }) => {
  const [form,      setForm]      = useState(initialState);
  const [errors,    setErrors]    = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())                   errs.title         = "Food title is required";
    if (!form.quantity || form.quantity <= 0) errs.quantity      = "Enter a valid quantity";
    if (!form.address.trim())                 errs.address       = "Pickup address is required";
    if (!form.expiryTime)                     errs.expiryTime    = "Expiry time is required";
    else if (new Date(form.expiryTime) <= new Date()) errs.expiryTime = "Expiry must be in the future";
    if (!form.contactNumber.trim())           errs.contactNumber = "Contact number is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      // Payload matches your backend /create route
      const payload = {
        title:         form.title,
        foodType:      form.foodType,
        quantity:      Number(form.quantity),
        unit:          form.unit,
        pickupAddress: form.address,
        expiryTime:    form.expiryTime,
        contactNumber: form.contactNumber,
        notes:         form.notes,
        priority:      calcPriority(form.expiryTime),
      };

      await createDonation(payload);
      toast.success("Donation created! Nearby NGOs have been notified. 🎉");
      setForm(initialState);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* Title + Food Type */}
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
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all text-[13px] font-semibold capitalize ${
                  form.foodType === type
                    ? type === "Food"
                      ? "border-[#2D6A4F] bg-[#D8F3DC] text-[#1A4731]"
                      : "border-[#2D6A4F] bg-[#D8F3DC] text-[#1A4731]"
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
                {type === "Food" ? "🥦" : ""} {type}
              </label>
            ))}
          </div>
        </FormField>
      </div>

      {/* Quantity + Unit */}
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
          <select name="unit" value={form.unit} onChange={handleChange} className={inputCls(false)}>
            <option value="plates">Plates</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="litres">Litres</option>
            <option value="boxes">Boxes</option>
          </select>
        </FormField>
      </div>

      {/* Pickup address */}
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

      {/* Expiry + Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Expiry Date & Time" error={errors.expiryTime} required>
          <input
            name="expiryTime"
            type="datetime-local"
            value={form.expiryTime}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            className={inputCls(errors.expiryTime)}
          />
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

      {/* Notes */}
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

      {/* Actions */}
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
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Creating donation...
            </span>
          ) : "🍱 Create Donation"}
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
    </form>
  );
};

export default DonationForm;
