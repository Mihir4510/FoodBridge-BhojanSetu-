// // src/pages/Register.jsx

// import { useState , useEffect } from "react";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import AuthLayout from "../components/auth/AuthLayout";
// import InputField from "../components/auth/InputField";
// import { getPasswordStrength } from "./LoginPage";

// import { registerUser } from "../service/authService";

// // ── Role config ───────────────────────────────────────────
// const ROLES = [
//   {
//     id: "individual",
//     label: "Donor",
//     emoji: "🍴",
//     desc: "I have surplus food to donate",
//     color: "green",
//   },
//   {
//     id: "organization",
//     label: "NGO",
//     emoji: "🏠",
//     desc: "We collect & distribute food",
//     color: "orange",
//   },
//   {
//     id: "restaurant",
//     label: "Restaurant",
//     emoji: "🍽️",
//     desc: "We generate daily food surplus",
//     color: "blue",
//   },
// ];

// // ── Password strength bar ─────────────────────────────────
// const PasswordStrengthBar = ({ password }) => {
//   const strength = getPasswordStrength(password);
//   if (!password) return null;

//   return (
//     <div className="mt-1.5">
//       <div className="flex gap-1 mb-1">
//         {[1, 2, 3, 4].map((i) => (
//           <div
//             key={i}
//             className={`flex-1 h-1 rounded-full transition-all duration-300 ${
//               i <= strength.score ? strength.color : "bg-[#E5E7EB]"
//             }`}
//           />
//         ))}
//       </div>
//       <p className={`text-[11px] font-semibold ${
//         strength.score <= 1 ? "text-red-500"
//         : strength.score === 2 ? "text-yellow-500"
//         : strength.score === 3 ? "text-blue-500"
//         : "text-[#2D6A4F]"
//       }`}>
//         {strength.label} password
//       </p>
//     </div>
//   );
// };

// // ── Register Page ─────────────────────────────────────────
// const Register = () => {
//   const navigate       = useNavigate();
//   const [searchParams] = useSearchParams();
//   const defaultRole    = searchParams.get("role") === "ngo" ? "organization" : "individual";

//   const [role, setRole]         = useState(defaultRole);
//   const [loading, setLoading]   = useState(false);
//   const [success, setSuccess]   = useState(false);
//   const [apiError, setApiError] = useState("");
//   const [errors, setErrors]     = useState({});
//   const [coordinates, setCoordinates] = useState(null);
// const [locationLoading, setLocationLoading] = useState(true);
// const [locationError, setLocationError] = useState("");

//   const [form, setForm] = useState({
//     name:             "",
//     email:            "",
//     password:         "",
//     confirmPassword:  "",
//     phone:            "",
//     city:             "",
//     // NGO
//     ngoName:          "",
//     registrationNo:   "",
//     // Restaurant
//     restaurantName:   "",
//     address:          "",
//     // location (sent as GeoJSON — for simplicity, city string here)
//   });
//   useEffect(() => {
//   if (!navigator.geolocation) {
//     setLocationError("Geolocation not supported");
//     setLocationLoading(false);
//     return;
//   }

//   navigator.geolocation.getCurrentPosition(
//     (position) => {
//       const latitude = position.coords.latitude;
//       const longitude = position.coords.longitude;

//       setCoordinates([longitude, latitude]); // GeoJSON format
//       setLocationLoading(false);
//     },
//     (error) => {
//       console.log(error);
//       setLocationError(
//   "Location access denied. Please enable location to continue."
// );
//       setLocationLoading(false);
//     },
//     {
//       enableHighAccuracy: true,
//       timeout: 10000,
//     }
//   );
// }, []);
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setErrors({ ...errors, [e.target.name]: "" });
//     setApiError("");
//   };

//   const validate = () => {
//     const errs = {};
//     if (!form.name.trim())        errs.name  = "Full name is required";
//     if (!form.email.trim())       errs.email = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
//     if (!form.password)           errs.password = "Password is required";
//     else if (form.password.length < 8) errs.password = "Minimum 8 characters";
//     if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
//     if (!form.phone.trim())       errs.phone = "Phone number is required";
//     if (!form.city.trim())        errs.city  = "City is required";

//     if (role === "organization") {
//       if (!form.ngoName.trim())        errs.ngoName        = "NGO name is required";
//       if (!form.registrationNo.trim()) errs.registrationNo = "Registration number is required";
//     }
//     if (role === "restaurant") {
//       if (!form.restaurantName.trim()) errs.restaurantName = "Restaurant name is required";
//       if (!form.address.trim())        errs.address        = "Address is required";
//     }
//     return errs;
//   };

//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   const errs = validate();

//   // ✅ HARD BLOCK if location not available
//   if (!coordinates) {
//     setApiError("Please allow location access to register.");
//     return;
//   }

//   if (Object.keys(errs).length) {
//     setErrors(errs);
//     return;
//   }

//   setLoading(true);

//   try {
//     const payload = {
//       name: form.name,
//       email: form.email,
//       password: form.password,
//       role,
//       phone: form.phone,

//       location: {
//         type: "Point",
//         coordinates: coordinates, // ✅ must exist
//       },

//       ...(role === "organization" && {
//         ngoName: form.ngoName,
//         registrationNo: form.registrationNo,
//       }),
//       ...(role === "restaurant" && {
//         restaurantName: form.restaurantName,
//         address: form.address,
//       }),
//     };

//    const res = await registerUser(payload);

// // ✅ STORE TOKEN
// // localStorage.setItem("token", res.data.token);
//     setSuccess(true);
//     setTimeout(() => navigate("/login"), 3000);

//   } catch (err) {
//     setApiError(err.response?.data?.message || "Registration failed");
//   } finally {
//     setLoading(false);
//   }
// };
//   // ── Success state ────────────────────────────────────────
//   if (success) {
//     return (
//       <AuthLayout variant="register">
//         <div className="flex flex-col items-center text-center py-10">
//           <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center text-[40px] mb-6 shadow-lg">
//             🎉
//           </div>
//           <h2 className="font-playfair text-[28px] font-bold text-[#111827] mb-3">
//             You're registered!
//           </h2>
//           <p className="text-[#6B7280] text-[15px] leading-relaxed mb-6 max-w-sm">
//             {role === "organization"
//               ? "Your NGO account is pending admin approval. We'll notify you via email once verified."
//               : "Welcome to BhojanSetu! Redirecting you to login..."}
//           </p>
//           <div className="flex items-center gap-2 text-[#2D6A4F] text-[14px] font-semibold">
//             <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
//               <circle cx="12" cy="12" r="10" stroke="#2D6A4F" strokeWidth="3" strokeOpacity="0.3" />
//               <path d="M12 2 A10 10 0 0 1 22 12" stroke="#2D6A4F" strokeWidth="3" strokeLinecap="round" />
//             </svg>
//             Redirecting to login...
//           </div>
//         </div>
//       </AuthLayout>
//     );
//   }

//   const activeRole = ROLES.find((r) => r.id === role);
//   const roleAccent = {
//     individual:   { ring: "ring-[#2D6A4F]",  bg: "bg-[#F0FDF4]", text: "text-[#2D6A4F]",  border: "border-[#2D6A4F]"  },
//     organization: { ring: "ring-[#E76F1A]",  bg: "bg-[#FFF7ED]", text: "text-[#E76F1A]",  border: "border-[#E76F1A]"  },
//     restaurant:   { ring: "ring-[#2563EB]",  bg: "bg-[#EFF6FF]", text: "text-[#2563EB]",  border: "border-[#2563EB]"  },
//   }[role];

//   return (
//     <AuthLayout variant="register">
//       {/* Heading */}
//       <div className="mb-6">
//         <h1 className="font-playfair text-[30px] font-bold text-[#111827] leading-tight mb-1.5">
//           Create your account
//         </h1>
//         <p className="text-[#6B7280] text-[14px]">
//           Join BhojanSetu and start making an impact today.
//         </p>
//       </div>

//       {/* Role selector */}
//       <div className="grid grid-cols-3 gap-2.5 mb-6">
//         {ROLES.map((r) => {
//           const isActive = role === r.id;
//           return (
//             <button
//               key={r.id}
//               type="button"
//               onClick={() => { setRole(r.id); setErrors({}); }}
//               className={`
//                 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center
//                 ${isActive
//                   ? `${roleAccent.border} ${roleAccent.bg} ring-2 ${roleAccent.ring}/20`
//                   : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
//                 }
//               `}
//             >
//               <span className="text-[22px]">{r.emoji}</span>
//               <span className={`text-[12px] font-semibold ${isActive ? roleAccent.text : "text-[#374151]"}`}>
//                 {r.label}
//               </span>
//               <span className="text-[10px] text-[#9CA3AF] leading-tight hidden sm:block">{r.desc}</span>
//             </button>
//           );
//         })}
//       </div>

//       {/* API error */}
//       {apiError && (
//         <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2">
//           <span>⚠️</span> {apiError}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

//         {/* Role-specific name */}
//         {role === "organization" && (
//           <InputField
//             label="NGO Name"
//             name="ngoName"
//             value={form.ngoName}
//             onChange={handleChange}
//             placeholder="e.g. Sahara Foundation"
//             icon="🏠"
//             error={errors.ngoName}
//             required
//           />
//         )}
//         {role === "restaurant" && (
//           <InputField
//             label="Restaurant / Hotel Name"
//             name="restaurantName"
//             value={form.restaurantName}
//             onChange={handleChange}
//             placeholder="e.g. Spice Garden Restaurant"
//             icon="🍽️"
//             error={errors.restaurantName}
//             required
//           />
//         )}

//         {/* Common fields */}
//         <InputField
//           label="Full Name"
//           name="name"
//           value={form.name}
//           onChange={handleChange}
//           placeholder="Your full name"
//           icon="👤"
//           error={errors.name}
//           required
//           autoComplete="name"
//         />

//         <InputField
//           label="Email address"
//           type="email"
//           name="email"
//           value={form.email}
//           onChange={handleChange}
//           placeholder="you@example.com"
//           icon="📧"
//           error={errors.email}
//           required
//           autoComplete="email"
//         />

//         {/* Password + strength */}
//         <div>
//           <InputField
//             label="Password"
//             type="password"
//             name="password"
//             value={form.password}
//             onChange={handleChange}
//             placeholder="Min. 8 characters"
//             icon="🔒"
//             error={errors.password}
//             required
//             autoComplete="new-password"
//           />
//           <PasswordStrengthBar password={form.password} />
//         </div>

//         <InputField
//           label="Confirm Password"
//           type="password"
//           name="confirmPassword"
//           value={form.confirmPassword}
//           onChange={handleChange}
//           placeholder="Re-enter your password"
//           icon="🔒"
//           error={errors.confirmPassword}
//           required
//           autoComplete="new-password"
//         />

//         {/* Two column: phone + city */}
//         <div className="grid grid-cols-2 gap-3">
//           <InputField
//             label="Phone"
//             type="tel"
//             name="phone"
//             value={form.phone}
//             onChange={handleChange}
//             placeholder="+91 98765 43210"
//             icon="📱"
//             error={errors.phone}
//             required
//           />
//           <InputField
//             label="City"
//             name="city"
//             value={form.city}
//             onChange={handleChange}
//             placeholder="Mumbai"
//             icon="📍"
//             error={errors.city}
//             required
//           />
//         </div>

//         {/* NGO extra */}
//         {role === "organization" && (
//           <InputField
//             label="Registration Number"
//             name="registrationNo"
//             value={form.registrationNo}
//             onChange={handleChange}
//             placeholder="e.g. MH/NGO/2021/12345"
//             icon="📋"
//             error={errors.registrationNo}
//             required
//           />
//         )}

//         {/* Restaurant extra */}
//         {role === "restaurant" && (
//           <InputField
//             label="Restaurant Address"
//             name="address"
//             value={form.address}
//             onChange={handleChange}
//             placeholder="Full address"
//             icon="📍"
//             error={errors.address}
//             required
//           />
//         )}

//         {/* NGO note */}
//         {role === "organization" && (
//           <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl px-4 py-3 flex gap-2.5">
//             <span className="text-base mt-0.5">ℹ️</span>
//             <p className="text-[12px] text-[#92400E] leading-relaxed">
//               NGO accounts require admin approval before activation. You'll receive an email once verified.
//             </p>
//           </div>
//         )}

//         {/* Terms */}
//         <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
//           By registering, you agree to our{" "}
//           <Link to="/terms" className="text-[#2D6A4F] font-semibold hover:underline">Terms of Service</Link>
//           {" "}and{" "}
//           <Link to="/privacy" className="text-[#2D6A4F] font-semibold hover:underline">Privacy Policy</Link>.
//         </p>

//         {/* Location Status */}
// {locationLoading && (
//   <p className="text-[12px] text-[#6B7280]">
//     📍 Fetching your location...
//   </p>
// )}

// {locationError && (
//   <p className="text-[12px] text-red-500 font-semibold">
//     ⚠️ {locationError}
//   </p>
// )}

// {coordinates && (
//   <p className="text-[12px] text-green-600 font-semibold">
//     ✅ Location captured successfully
//   </p>
// )}

//         {/* Submit */}
//         <button
//           type="submit"
//           disabled={loading || locationLoading}
//           className={`
//             w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 mt-1
//             ${loading
//               ? "opacity-60 cursor-not-allowed"
//               : "hover:-translate-y-0.5"
//             }
//             ${role === "individual"   ? "bg-[#2D6A4F] hover:bg-[#245a42] shadow-[0_4px_16px_rgba(45,106,79,0.3)]"  : ""}
//             ${role === "organization" ? "bg-[#E76F1A] hover:bg-[#d4621a] shadow-[0_4px_16px_rgba(231,111,26,0.3)]" : ""}
//             ${role === "restaurant"   ? "bg-[#2563EB] hover:bg-[#1d4ed8] shadow-[0_4px_16px_rgba(37,99,235,0.3)]"  : ""}
//           `}
//         >
//           {loading ? (
//             <span className="flex items-center justify-center gap-2">
//               <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
//                 <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
//                 <path d="M12 2 A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
//               </svg>
//               Creating account...
//             </span>
//           ) : (
//             `Create ${activeRole.label} Account →`
//           )}
//         </button>
//       </form>

//       {/* Login link */}
//       <p className="text-center text-[14px] text-[#6B7280] mt-6">
//         Already have an account?{" "}
//         <Link
//           to="/login"
//           className="text-[#E76F1A] font-semibold hover:text-[#d4621a] transition-colors no-underline"
//         >
//           Log in →
//         </Link>
//       </p>
//     </AuthLayout>
//   );
// };

// export default Register;
// Register.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import InputField from "../components/auth/InputField";
import { getPasswordStrength } from "./LoginPage";
import { registerUser } from "../service/authService";

// ── Major Indian cities with pre-set coordinates ──────────
// This is the fallback when GPS is denied
// Format: [longitude, latitude] — GeoJSON standard
const INDIAN_CITIES = [
  { name: "Mumbai",       coords: [72.8777, 19.0760] },
  { name: "Delhi",        coords: [77.1025, 28.7041] },
  { name: "Bangalore",    coords: [77.5946, 12.9716] },
  { name: "Hyderabad",    coords: [78.4867, 17.3850] },
  { name: "Chennai",      coords: [80.2707, 13.0827] },
  { name: "Kolkata",      coords: [88.3639, 22.5726] },
  { name: "Pune",         coords: [73.8567, 18.5204] },
  { name: "Ahmedabad",    coords: [72.5714, 23.0225] },
  { name: "Jaipur",       coords: [75.7873, 26.9124] },
  { name: "Surat",        coords: [72.8311, 21.1702] },
  { name: "Lucknow",      coords: [80.9462, 26.8467] },
  { name: "Kanpur",       coords: [80.3319, 26.4499] },
  { name: "Nagpur",       coords: [79.0882, 21.1458] },
  { name: "Indore",       coords: [75.8577, 22.7196] },
  { name: "Bhopal",       coords: [77.4126, 23.2599] },
  { name: "Patna",        coords: [85.1376, 25.5941] },
  { name: "Vadodara",     coords: [73.1812, 22.3072] },
  { name: "Coimbatore",   coords: [76.9558, 11.0168] },
  { name: "Agra",         coords: [78.0081, 27.1767] },
  { name: "Visakhapatnam",coords: [83.2185, 17.6868] },
  { name: "Other",        coords: null },  // manual lat/lng entry
];

const ROLES = [
  { id: "individual",   label: "Donor",      emoji: "🍴", desc: "I have surplus food to donate"  },
  { id: "organization", label: "NGO",         emoji: "🏠", desc: "We collect & distribute food"   },
  { id: "restaurant",   label: "Restaurant",  emoji: "🍽️", desc: "We generate daily food surplus" },
];

const PasswordStrengthBar = ({ password }) => {
  const strength = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${
            i <= strength.score ? strength.color : "bg-[#E5E7EB]"
          }`} />
        ))}
      </div>
      <p className={`text-[11px] font-semibold ${
        strength.score <= 1 ? "text-red-500"
        : strength.score === 2 ? "text-yellow-500"
        : strength.score === 3 ? "text-blue-500"
        : "text-[#2D6A4F]"
      }`}>{strength.label} password</p>
    </div>
  );
};

// ── Location Status Banner ────────────────────────────────
const LocationBanner = ({ status, onRetry, onCitySelect, selectedCity, onManualCoords, manualLat, manualLng, onManualLatChange, onManualLngChange }) => {

  // ✅ GPS working — show success
  if (status === "granted") {
    return (
      <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3">
        <span className="text-green-600 text-base">✅</span>
        <p className="text-[12px] text-green-700 font-semibold">
          GPS location captured — we can find nearby NGOs for you
        </p>
      </div>
    );
  }

  // ✅ Still fetching GPS
  if (status === "fetching") {
    return (
      <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3">
        <svg className="animate-spin w-4 h-4 text-[#2D6A4F] shrink-0" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
          <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <p className="text-[12px] text-[#2D6A4F] font-semibold">
          Detecting your location... please allow access when prompted
        </p>
      </div>
    );
  }

  // ✅ GPS denied — show city selector fallback
  if (status === "denied" || status === "unsupported") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 flex flex-col gap-3">

        {/* Warning header */}
        <div className="flex items-start gap-2">
          <span className="text-amber-500 text-base mt-0.5">📍</span>
          <div>
            <p className="text-[13px] text-amber-800 font-bold">
              Location access denied
            </p>
            <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
              Location is required to match donations with nearby NGOs.
              Select your city below as an alternative.
            </p>
          </div>
        </div>

        {/* City dropdown fallback */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-amber-800">
            Select your city *
          </label>
          <select
            value={selectedCity}
            onChange={(e) => onCitySelect(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-amber-300 bg-white text-[13px] text-[#374151] focus:outline-none focus:border-[#2D6A4F] transition-colors"
          >
            <option value="">— Choose your city —</option>
            {INDIAN_CITIES.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Manual coordinates for "Other" */}
        {selectedCity === "Other" && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-amber-700 font-semibold">
              Enter approximate coordinates for your city:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-amber-700 font-medium">Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 19.0760"
                  value={manualLat}
                  onChange={(e) => onManualLatChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-amber-300 bg-white text-[13px] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
              <div>
                <label className="text-[10px] text-amber-700 font-medium">Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 72.8777"
                  value={manualLng}
                  onChange={(e) => onManualLngChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-amber-300 bg-white text-[13px] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
            </div>
            <p className="text-[10px] text-amber-600">
              💡 Find your city coordinates at{" "}
              <a href="https://www.latlong.net" target="_blank" rel="noreferrer"
                className="underline font-semibold">latlong.net</a>
            </p>
          </div>
        )}

        {/* Retry GPS button */}
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border-2 border-amber-300 bg-white text-[12px] font-semibold text-amber-700 hover:bg-amber-100 transition-all"
        >
          🔄 Retry GPS location instead
        </button>
      </div>
    );
  }

  return null;
};


// ── Main Register Component ───────────────────────────────
const Register = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole    = searchParams.get("role") === "ngo" ? "organization" : "individual";

  const [role,           setRole]           = useState(defaultRole);
  const [loading,        setLoading]        = useState(false);
  const [success,        setSuccess]        = useState(false);
  const [apiError,       setApiError]       = useState("");
  const [errors,         setErrors]         = useState({});

  // ── Location state ─────────────────────────────────────
  const [coordinates,    setCoordinates]    = useState(null);
  // "idle" | "fetching" | "granted" | "denied" | "unsupported"
  const [locationStatus, setLocationStatus] = useState("idle");
  const [selectedCity,   setSelectedCity]   = useState("");
  const [manualLat,      setManualLat]      = useState("");
  const [manualLng,      setManualLng]      = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", city: "",
    ngoName: "", registrationNo: "",
    restaurantName: "", address: "",
  });

  // ── GPS fetch logic (extracted so retry can reuse it) ──
  const fetchGPS = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("fetching");
    setCoordinates(null);
    setSelectedCity("");

    // Hard timeout — if browser hangs without calling error callback
    const hardTimeout = setTimeout(() => {
      setLocationStatus("denied");
    }, 10000); // 10 seconds max

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(hardTimeout);
        // ✅ GeoJSON format: [longitude, latitude]
        setCoordinates([pos.coords.longitude, pos.coords.latitude]);
        setLocationStatus("granted");
      },
      (err) => {
        clearTimeout(hardTimeout);
        console.warn("GPS error:", err.code, err.message);
        setLocationStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,      // slightly less than hard timeout
        maximumAge: 60000,  // accept cached position up to 1 min old
      }
    );
  };

  // Auto-fetch GPS on mount
  useEffect(() => {
    fetchGPS();
  }, []);

  // ── When user selects a city from dropdown ─────────────
  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
    const found = INDIAN_CITIES.find((c) => c.name === cityName);
    if (found && found.coords) {
      // ✅ Use pre-set city centroid coordinates
      setCoordinates(found.coords);
    } else {
      // "Other" selected — wait for manual input
      setCoordinates(null);
    }
  };

  // ── When user enters manual lat/lng for "Other" city ───
  useEffect(() => {
    if (selectedCity === "Other" && manualLat && manualLng) {
      const lat = parseFloat(manualLat);
      const lng = parseFloat(manualLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCoordinates([lng, lat]); // GeoJSON: [longitude, latitude]
      }
    }
  }, [manualLat, manualLng, selectedCity]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())       errs.name     = "Full name is required";
    if (!form.email.trim())      errs.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password)          errs.password = "Password is required";
    else if (form.password.length < 8)          errs.password = "Minimum 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!form.phone.trim())      errs.phone    = "Phone number is required";
    if (!form.city.trim())       errs.city     = "City is required";

    if (role === "organization") {
      if (!form.ngoName.trim())        errs.ngoName        = "NGO name is required";
      if (!form.registrationNo.trim()) errs.registrationNo = "Registration number is required";
    }
    if (role === "restaurant") {
      if (!form.restaurantName.trim()) errs.restaurantName = "Restaurant name is required";
      if (!form.address.trim())        errs.address        = "Address is required";
    }

    // ✅ Location validation — GPS OR city selection required
    if (!coordinates) {
      if (locationStatus === "fetching") {
        errs._location = "Still fetching location, please wait...";
      } else if (locationStatus === "denied" || locationStatus === "unsupported") {
        if (!selectedCity) {
          errs._location = "Please select your city from the dropdown above";
        } else if (selectedCity === "Other" && (!manualLat || !manualLng)) {
          errs._location = "Please enter your latitude and longitude";
        }
      }
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      // ✅ Show location error as apiError so user sees it clearly
      if (errs._location) setApiError(errs._location);
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const payload = {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role,
        phone:    form.phone,
        city:     form.city,

        // ✅ Always present at this point due to validate() check above
        location: {
          type: "Point",
          coordinates, // [longitude, latitude]
        },

        ...(role === "organization" && {
          ngoName:        form.ngoName,
          registrationNo: form.registrationNo,
        }),
        ...(role === "restaurant" && {
          restaurantName: form.restaurantName,
          address:        form.address,
        }),
      };

      const res = await registerUser(payload);

      // ✅ Store token for Bearer auth on subsequent requests
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);

    } catch (err) {
      console.error("Registration error:", err);
      console.error("Server response:", err.response?.data);
      setApiError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────
  if (success) {
    return (
      <AuthLayout variant="register">
        <div className="flex flex-col items-center text-center py-10">
          <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center text-[40px] mb-6 shadow-lg">🎉</div>
          <h2 className="font-playfair text-[28px] font-bold text-[#111827] mb-3">You're registered!</h2>
          <p className="text-[#6B7280] text-[15px] leading-relaxed mb-6 max-w-sm">
            {role === "organization"
              ? "Your NGO account is pending admin approval. We'll notify you via email once verified."
              : "Welcome to BhojanSetu! Redirecting you to login..."}
          </p>
          <div className="flex items-center gap-2 text-[#2D6A4F] text-[14px] font-semibold">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#2D6A4F" strokeWidth="3" strokeOpacity="0.3"/>
              <path d="M12 2 A10 10 0 0 1 22 12" stroke="#2D6A4F" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Redirecting to login...
          </div>
        </div>
      </AuthLayout>
    );
  }

  const activeRole = ROLES.find((r) => r.id === role);
  const roleAccent = {
    individual:   { ring: "ring-[#2D6A4F]", bg: "bg-[#F0FDF4]", text: "text-[#2D6A4F]", border: "border-[#2D6A4F]" },
    organization: { ring: "ring-[#E76F1A]", bg: "bg-[#FFF7ED]", text: "text-[#E76F1A]", border: "border-[#E76F1A]" },
    restaurant:   { ring: "ring-[#2563EB]", bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", border: "border-[#2563EB]" },
  }[role];

  // ✅ Button is only disabled during active loading OR GPS is still fetching
  const isButtonDisabled = loading || locationStatus === "fetching";

  return (
    <AuthLayout variant="register">
      <div className="mb-6">
        <h1 className="font-playfair text-[30px] font-bold text-[#111827] leading-tight mb-1.5">
          Create your account
        </h1>
        <p className="text-[#6B7280] text-[14px]">Join BhojanSetu and start making an impact today.</p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {ROLES.map((r) => {
          const isActive = role === r.id;
          return (
            <button key={r.id} type="button"
              onClick={() => { setRole(r.id); setErrors({}); }}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center ${
                isActive
                  ? `${roleAccent.border} ${roleAccent.bg} ring-2 ${roleAccent.ring}/20`
                  : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
              }`}
            >
              <span className="text-[22px]">{r.emoji}</span>
              <span className={`text-[12px] font-semibold ${isActive ? roleAccent.text : "text-[#374151]"}`}>{r.label}</span>
              <span className="text-[10px] text-[#9CA3AF] leading-tight hidden sm:block">{r.desc}</span>
            </button>
          );
        })}
      </div>

      {apiError && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2">
          <span>⚠️</span> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

        {role === "organization" && (
          <InputField label="NGO Name" name="ngoName" value={form.ngoName}
            onChange={handleChange} placeholder="e.g. Sahara Foundation"
            icon="🏠" error={errors.ngoName} required />
        )}
        {role === "restaurant" && (
          <InputField label="Restaurant / Hotel Name" name="restaurantName" value={form.restaurantName}
            onChange={handleChange} placeholder="e.g. Spice Garden Restaurant"
            icon="🍽️" error={errors.restaurantName} required />
        )}

        <InputField label="Full Name" name="name" value={form.name}
          onChange={handleChange} placeholder="Your full name"
          icon="👤" error={errors.name} required autoComplete="name" />

        <InputField label="Email address" type="email" name="email" value={form.email}
          onChange={handleChange} placeholder="you@example.com"
          icon="📧" error={errors.email} required autoComplete="email" />

        <div>
          <InputField label="Password" type="password" name="password" value={form.password}
            onChange={handleChange} placeholder="Min. 8 characters"
            icon="🔒" error={errors.password} required autoComplete="new-password" />
          <PasswordStrengthBar password={form.password} />
        </div>

        <InputField label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword}
          onChange={handleChange} placeholder="Re-enter your password"
          icon="🔒" error={errors.confirmPassword} required autoComplete="new-password" />

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Phone" type="tel" name="phone" value={form.phone}
            onChange={handleChange} placeholder="+91 98765 43210"
            icon="📱" error={errors.phone} required />
          <InputField label="City" name="city" value={form.city}
            onChange={handleChange} placeholder="Mumbai"
            icon="📍" error={errors.city} required />
        </div>

        {role === "organization" && (
          <InputField label="Registration Number" name="registrationNo" value={form.registrationNo}
            onChange={handleChange} placeholder="e.g. MH/NGO/2021/12345"
            icon="📋" error={errors.registrationNo} required />
        )}
        {role === "restaurant" && (
          <InputField label="Restaurant Address" name="address" value={form.address}
            onChange={handleChange} placeholder="Full address"
            icon="📍" error={errors.address} required />
        )}

        {role === "organization" && (
          <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl px-4 py-3 flex gap-2.5">
            <span className="text-base mt-0.5">ℹ️</span>
            <p className="text-[12px] text-[#92400E] leading-relaxed">
              NGO accounts require admin approval before activation. You'll receive an email once verified.
            </p>
          </div>
        )}

        <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
          By registering, you agree to our{" "}
          <Link to="/terms" className="text-[#2D6A4F] font-semibold hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link to="/privacy" className="text-[#2D6A4F] font-semibold hover:underline">Privacy Policy</Link>.
        </p>

        {/* ✅ Location banner — GPS success OR city fallback */}
        <LocationBanner
          status={locationStatus}
          onRetry={fetchGPS}
          onCitySelect={handleCitySelect}
          selectedCity={selectedCity}
          manualLat={manualLat}
          manualLng={manualLng}
          onManualLatChange={setManualLat}
          onManualLngChange={setManualLng}
        />

        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 mt-1 ${
            isButtonDisabled ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5"
          } ${role === "individual"   ? "bg-[#2D6A4F] hover:bg-[#245a42] shadow-[0_4px_16px_rgba(45,106,79,0.3)]"  : ""}
            ${role === "organization" ? "bg-[#E76F1A] hover:bg-[#d4621a] shadow-[0_4px_16px_rgba(231,111,26,0.3)]" : ""}
            ${role === "restaurant"   ? "bg-[#2563EB] hover:bg-[#1d4ed8] shadow-[0_4px_16px_rgba(37,99,235,0.3)]"  : ""}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2 A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Creating account...
            </span>
          ) : `Create ${activeRole.label} Account →`}
        </button>
      </form>

      <p className="text-center text-[14px] text-[#6B7280] mt-6">
        Already have an account ?{" "}
        <Link to="/login" className="text-[#E76F1A] font-semibold hover:text-[#d4621a] transition-colors no-underline">
          Log in →
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;