// src/pages/Register.jsx

import { useState , useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import InputField from "../components/auth/InputField";
import { getPasswordStrength } from "./LoginPage";

import { registerUser } from "../service/authService";

// ── Role config ───────────────────────────────────────────
const ROLES = [
  {
    id: "individual",
    label: "Donor",
    emoji: "🍴",
    desc: "I have surplus food to donate",
    color: "green",
  },
  {
    id: "organization",
    label: "NGO",
    emoji: "🏠",
    desc: "We collect & distribute food",
    color: "orange",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    emoji: "🍽️",
    desc: "We generate daily food surplus",
    color: "blue",
  },
];

// ── Password strength bar ─────────────────────────────────
const PasswordStrengthBar = ({ password }) => {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              i <= strength.score ? strength.color : "bg-[#E5E7EB]"
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-semibold ${
        strength.score <= 1 ? "text-red-500"
        : strength.score === 2 ? "text-yellow-500"
        : strength.score === 3 ? "text-blue-500"
        : "text-[#2D6A4F]"
      }`}>
        {strength.label} password
      </p>
    </div>
  );
};

// ── Register Page ─────────────────────────────────────────
const Register = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole    = searchParams.get("role") === "ngo" ? "organization" : "individual";

  const [role, setRole]         = useState(defaultRole);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors]     = useState({});
  const [coordinates, setCoordinates] = useState(null);
const [locationLoading, setLocationLoading] = useState(true);
const [locationError, setLocationError] = useState("");

  const [form, setForm] = useState({
    name:             "",
    email:            "",
    password:         "",
    confirmPassword:  "",
    phone:            "",
    city:             "",
    // NGO
    ngoName:          "",
    registrationNo:   "",
    // Restaurant
    restaurantName:   "",
    address:          "",
    // location (sent as GeoJSON — for simplicity, city string here)
  });
  useEffect(() => {
  if (!navigator.geolocation) {
    setLocationError("Geolocation not supported");
    setLocationLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setCoordinates([longitude, latitude]); // GeoJSON format
      setLocationLoading(false);
    },
    (error) => {
      console.log(error);
      setLocationError(
  "Location access denied. Please enable location to continue."
);
      setLocationLoading(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  );
}, []);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())        errs.name  = "Full name is required";
    if (!form.email.trim())       errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password)           errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Minimum 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!form.phone.trim())       errs.phone = "Phone number is required";
    if (!form.city.trim())        errs.city  = "City is required";

    if (role === "organization") {
      if (!form.ngoName.trim())        errs.ngoName        = "NGO name is required";
      if (!form.registrationNo.trim()) errs.registrationNo = "Registration number is required";
    }
    if (role === "restaurant") {
      if (!form.restaurantName.trim()) errs.restaurantName = "Restaurant name is required";
      if (!form.address.trim())        errs.address        = "Address is required";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const errs = validate();

  // ✅ HARD BLOCK if location not available
  if (!coordinates) {
    setApiError("Please allow location access to register.");
    return;
  }

  if (Object.keys(errs).length) {
    setErrors(errs);
    return;
  }

  setLoading(true);

  try {
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role,
      phone: form.phone,

      location: {
        type: "Point",
        coordinates: coordinates, // ✅ must exist
      },

      ...(role === "organization" && {
        ngoName: form.ngoName,
        registrationNo: form.registrationNo,
      }),
      ...(role === "restaurant" && {
        restaurantName: form.restaurantName,
        address: form.address,
      }),
    };

   const res = await registerUser(payload);

// ✅ STORE TOKEN
localStorage.setItem("token", res.data.token);
    setSuccess(true);
    setTimeout(() => navigate("/login"), 3000);

  } catch (err) {
    setApiError(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};
  // ── Success state ────────────────────────────────────────
  if (success) {
    return (
      <AuthLayout variant="register">
        <div className="flex flex-col items-center text-center py-10">
          <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center text-[40px] mb-6 shadow-lg">
            🎉
          </div>
          <h2 className="font-playfair text-[28px] font-bold text-[#111827] mb-3">
            You're registered!
          </h2>
          <p className="text-[#6B7280] text-[15px] leading-relaxed mb-6 max-w-sm">
            {role === "organization"
              ? "Your NGO account is pending admin approval. We'll notify you via email once verified."
              : "Welcome to BhojanSetu! Redirecting you to login..."}
          </p>
          <div className="flex items-center gap-2 text-[#2D6A4F] text-[14px] font-semibold">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#2D6A4F" strokeWidth="3" strokeOpacity="0.3" />
              <path d="M12 2 A10 10 0 0 1 22 12" stroke="#2D6A4F" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Redirecting to login...
          </div>
        </div>
      </AuthLayout>
    );
  }

  const activeRole = ROLES.find((r) => r.id === role);
  const roleAccent = {
    individual:   { ring: "ring-[#2D6A4F]",  bg: "bg-[#F0FDF4]", text: "text-[#2D6A4F]",  border: "border-[#2D6A4F]"  },
    organization: { ring: "ring-[#E76F1A]",  bg: "bg-[#FFF7ED]", text: "text-[#E76F1A]",  border: "border-[#E76F1A]"  },
    restaurant:   { ring: "ring-[#2563EB]",  bg: "bg-[#EFF6FF]", text: "text-[#2563EB]",  border: "border-[#2563EB]"  },
  }[role];

  return (
    <AuthLayout variant="register">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="font-playfair text-[30px] font-bold text-[#111827] leading-tight mb-1.5">
          Create your account
        </h1>
        <p className="text-[#6B7280] text-[14px]">
          Join BhojanSetu and start making an impact today.
        </p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {ROLES.map((r) => {
          const isActive = role === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => { setRole(r.id); setErrors({}); }}
              className={`
                flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center
                ${isActive
                  ? `${roleAccent.border} ${roleAccent.bg} ring-2 ${roleAccent.ring}/20`
                  : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                }
              `}
            >
              <span className="text-[22px]">{r.emoji}</span>
              <span className={`text-[12px] font-semibold ${isActive ? roleAccent.text : "text-[#374151]"}`}>
                {r.label}
              </span>
              <span className="text-[10px] text-[#9CA3AF] leading-tight hidden sm:block">{r.desc}</span>
            </button>
          );
        })}
      </div>

      {/* API error */}
      {apiError && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2">
          <span>⚠️</span> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

        {/* Role-specific name */}
        {role === "organization" && (
          <InputField
            label="NGO Name"
            name="ngoName"
            value={form.ngoName}
            onChange={handleChange}
            placeholder="e.g. Sahara Foundation"
            icon="🏠"
            error={errors.ngoName}
            required
          />
        )}
        {role === "restaurant" && (
          <InputField
            label="Restaurant / Hotel Name"
            name="restaurantName"
            value={form.restaurantName}
            onChange={handleChange}
            placeholder="e.g. Spice Garden Restaurant"
            icon="🍽️"
            error={errors.restaurantName}
            required
          />
        )}

        {/* Common fields */}
        <InputField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
          icon="👤"
          error={errors.name}
          required
          autoComplete="name"
        />

        <InputField
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          icon="📧"
          error={errors.email}
          required
          autoComplete="email"
        />

        {/* Password + strength */}
        <div>
          <InputField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 8 characters"
            icon="🔒"
            error={errors.password}
            required
            autoComplete="new-password"
          />
          <PasswordStrengthBar password={form.password} />
        </div>

        <InputField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          icon="🔒"
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        {/* Two column: phone + city */}
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Phone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            icon="📱"
            error={errors.phone}
            required
          />
          <InputField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Mumbai"
            icon="📍"
            error={errors.city}
            required
          />
        </div>

        {/* NGO extra */}
        {role === "organization" && (
          <InputField
            label="Registration Number"
            name="registrationNo"
            value={form.registrationNo}
            onChange={handleChange}
            placeholder="e.g. MH/NGO/2021/12345"
            icon="📋"
            error={errors.registrationNo}
            required
          />
        )}

        {/* Restaurant extra */}
        {role === "restaurant" && (
          <InputField
            label="Restaurant Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Full address"
            icon="📍"
            error={errors.address}
            required
          />
        )}

        {/* NGO note */}
        {role === "organization" && (
          <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl px-4 py-3 flex gap-2.5">
            <span className="text-base mt-0.5">ℹ️</span>
            <p className="text-[12px] text-[#92400E] leading-relaxed">
              NGO accounts require admin approval before activation. You'll receive an email once verified.
            </p>
          </div>
        )}

        {/* Terms */}
        <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
          By registering, you agree to our{" "}
          <Link to="/terms" className="text-[#2D6A4F] font-semibold hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link to="/privacy" className="text-[#2D6A4F] font-semibold hover:underline">Privacy Policy</Link>.
        </p>

        {/* Location Status */}
{locationLoading && (
  <p className="text-[12px] text-[#6B7280]">
    📍 Fetching your location...
  </p>
)}

{locationError && (
  <p className="text-[12px] text-red-500 font-semibold">
    ⚠️ {locationError}
  </p>
)}

{coordinates && (
  <p className="text-[12px] text-green-600 font-semibold">
    ✅ Location captured successfully
  </p>
)}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || locationLoading}
          className={`
            w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 mt-1
            ${loading
              ? "opacity-60 cursor-not-allowed"
              : "hover:-translate-y-0.5"
            }
            ${role === "individual"   ? "bg-[#2D6A4F] hover:bg-[#245a42] shadow-[0_4px_16px_rgba(45,106,79,0.3)]"  : ""}
            ${role === "organization" ? "bg-[#E76F1A] hover:bg-[#d4621a] shadow-[0_4px_16px_rgba(231,111,26,0.3)]" : ""}
            ${role === "restaurant"   ? "bg-[#2563EB] hover:bg-[#1d4ed8] shadow-[0_4px_16px_rgba(37,99,235,0.3)]"  : ""}
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M12 2 A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Creating account...
            </span>
          ) : (
            `Create ${activeRole.label} Account →`
          )}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center text-[14px] text-[#6B7280] mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#E76F1A] font-semibold hover:text-[#d4621a] transition-colors no-underline"
        >
          Log in →
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
