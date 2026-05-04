// // src/pages/Login.jsx

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import AuthLayout from "../components/auth/AuthLayout";
// import InputField from "../components/auth/InputField";
// import { loginUser } from "../service/authService";
// import { useAuth } from "../context/AuthContext";

// export const getPasswordStrength = (password) => {
//   if (!password) return { score: 0, label: "", color: "" };
//   let score = 0;
//   if (password.length >= 8)          score++;
//   if (/[A-Z]/.test(password))        score++;
//   if (/[0-9]/.test(password))        score++;
//   if (/[^A-Za-z0-9]/.test(password)) score++;
//   const map = {
//     1: { label: "Weak",   color: "bg-red-400"    },
//     2: { label: "Fair",   color: "bg-yellow-400" },
//     3: { label: "Good",   color: "bg-blue-400"   },
//     4: { label: "Strong", color: "bg-[#2D6A4F]"  },
//   };
//   return { score, ...(map[score] || { label: "", color: "" }) };
// };

// const Login = () => {
//   const navigate    = useNavigate();
//   const { setUser } = useAuth(); // ← from AuthContext

//   const [form,     setForm]     = useState({ email: "", password: "" });
//   const [errors,   setErrors]   = useState({});
//   const [remember, setRemember] = useState(false);
//   const [loading,  setLoading]  = useState(false);
//   const [apiError, setApiError] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setErrors({ ...errors, [e.target.name]: "" });
//     setApiError("");
//   };

//   const validate = () => {
//     const errs = {};
//     if (!form.email)    errs.email    = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
//     if (!form.password) errs.password = "Password is required";
//     return errs;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const errs = validate();
//     if (Object.keys(errs).length) { setErrors(errs); return; }

//     setLoading(true);
//     try {
//       // POST /api/auth/login
//       const res  = await loginUser(form);

//       // localStorage.setItem("token", res.data.token);

//       const user = res.data?.user || res.data;

//       // ── 1. Store in AuthContext globally ─────────────
//       setUser(user);

//       // ── 2. Redirect by role ──────────────────────────
//       const role = user?.role;
//       if (role === "admin")             navigate("/admin/dashboard");
//       else if (role === "organization") navigate("/ngo/dashboard");
//       else                              navigate("/donor/dashboard");
//       // individual + restaurant → same donor dashboard

//     } catch (err) {
//       setApiError(err.response?.data?.message || "Invalid email or password.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthLayout variant="login">
//       <div className="mb-8">
//         <h1 className="font-playfair text-[32px] font-bold text-[#111827] leading-tight mb-2">
//           Welcome back 👋
//         </h1>
//         <p className="text-[#6B7280] text-[15px] leading-relaxed">
//           Log in to continue rescuing food and helping communities.
//         </p>
//       </div>

//       {apiError && (
//         <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2">
//           <span>⚠️</span> {apiError}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
//         <InputField
//           label="Email address" type="email" name="email"
//           value={form.email} onChange={handleChange}
//           placeholder="you@example.com" icon="📧"
//           error={errors.email} required autoComplete="email"
//         />
//         <InputField
//           label="Password" type="password" name="password"
//           value={form.password} onChange={handleChange}
//           placeholder="Enter your password" icon="🔒"
//           error={errors.password} required autoComplete="current-password"
//         />

//         <div className="flex items-center justify-between">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <div
//               onClick={() => setRemember(!remember)}
//               className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all cursor-pointer ${
//                 remember ? "bg-[#2D6A4F] border-[#2D6A4F]" : "border-[#D1D5DB] bg-white"
//               }`}
//             >
//               {remember && <span className="text-white text-[11px] leading-none">✓</span>}
//             </div>
//             <span className="text-[13px] text-[#6B7280] select-none">Remember me</span>
//           </label>
//           <Link to="/forgot-password" className="text-[13px] font-semibold text-[#2D6A4F] hover:text-[#40916C] no-underline">
//             Forgot password?
//           </Link>
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 mt-1 ${
//             loading
//               ? "bg-[#2D6A4F]/60 cursor-not-allowed"
//               : "bg-[#2D6A4F] hover:bg-[#245a42] hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(45,106,79,0.3)]"
//           }`}
//         >
//           {loading ? (
//             <span className="flex items-center justify-center gap-2">
//               <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
//                 <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
//                 <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
//               </svg>
//               Logging in...
//             </span>
//           ) : "Log In →"}
//         </button>
//       </form>

//       <div className="flex items-center gap-3 my-6">
//         <div className="flex-1 h-px bg-[#E5E7EB]" />
//         <span className="text-[12px] text-[#9CA3AF] font-medium">or</span>
//         <div className="flex-1 h-px bg-[#E5E7EB]" />
//       </div>

//       <p className="text-center text-[14px] text-[#6B7280]">
//         Don't have an account?{" "}
//         <Link to="/register" className="text-[#E76F1A] font-semibold hover:text-[#d4621a] no-underline">
//           Create one free →
//         </Link>
//       </p>

//       <div className="mt-8 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 flex items-start gap-3">
//         <span className="text-lg mt-0.5">🌿</span>
//         <p className="text-[12px] text-[#166534] leading-relaxed">
//           BhojanSetu has rescued <strong>12,400+ meals</strong> across India.
//         </p>
//       </div>
//     </AuthLayout>
//   );
// };

// export default Login;
// src/pages/Login.jsx
// ✅ FIX: localStorage.setItem("token") is now UNCOMMENTED
// ✅ FIX: setUser stores user in AuthContext
// Everything else unchanged

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import InputField from "../components/auth/InputField";
import { loginUser } from "../service/authService";
import { useAuth } from "../context/AuthContext";

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = {
    1: { label: "Weak",   color: "bg-red-400"    },
    2: { label: "Fair",   color: "bg-yellow-400" },
    3: { label: "Good",   color: "bg-blue-400"   },
    4: { label: "Strong", color: "bg-[#2D6A4F]"  },
  };
  return { score, ...(map[score] || { label: "", color: "" }) };
};

const Login = () => {
  const navigate    = useNavigate();
  const { setUser } = useAuth();

  const [form,     setForm]     = useState({ email: "", password: "" });
  const [errors,   setErrors]   = useState({});
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res  = await loginUser(form);
      const user  = res.data?.user || res.data;
      const token = res.data?.token;

      // ✅ FIXED: store token so all API calls can send Authorization header
      if (token) {
        localStorage.setItem("token", token);
      }

      // ✅ Store user in AuthContext
      setUser(user);

      // ✅ Redirect by role
      const role = user?.role;
      if (role === "admin")             navigate("/admin/dashboard");
      else if (role === "organization") navigate("/ngo/dashboard");
      else                              navigate("/donor/dashboard");

    } catch (err) {
      setApiError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <div className="mb-8">
        <h1 className="font-playfair text-[32px] font-bold text-[#111827] leading-tight mb-2">
          Welcome back 👋
        </h1>
        <p className="text-[#6B7280] text-[15px] leading-relaxed">
          Log in to continue rescuing food and helping communities.
        </p>
      </div>

      {apiError && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2">
          <span>⚠️</span> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <InputField
          label="Email address" type="email" name="email"
          value={form.email} onChange={handleChange}
          placeholder="you@example.com" icon="📧"
          error={errors.email} required autoComplete="email"
        />
        <InputField
          label="Password" type="password" name="password"
          value={form.password} onChange={handleChange}
          placeholder="Enter your password" icon="🔒"
          error={errors.password} required autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setRemember(!remember)}
              className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all cursor-pointer ${
                remember ? "bg-[#2D6A4F] border-[#2D6A4F]" : "border-[#D1D5DB] bg-white"
              }`}
            >
              {remember && <span className="text-white text-[11px] leading-none">✓</span>}
            </div>
            <span className="text-[13px] text-[#6B7280] select-none">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-[13px] font-semibold text-[#2D6A4F] hover:text-[#40916C] no-underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 mt-1 ${
            loading
              ? "bg-[#2D6A4F]/60 cursor-not-allowed"
              : "bg-[#2D6A4F] hover:bg-[#245a42] hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(45,106,79,0.3)]"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Logging in...
            </span>
          ) : "Log In →"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[#E5E7EB]" />
        <span className="text-[12px] text-[#9CA3AF] font-medium">or</span>
        <div className="flex-1 h-px bg-[#E5E7EB]" />
      </div>

      <p className="text-center text-[14px] text-[#6B7280]">
        Don't have an account?{" "}
        <Link to="/register" className="text-[#E76F1A] font-semibold hover:text-[#d4621a] no-underline">
          Create one free →
        </Link>
      </p>

      <div className="mt-8 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-lg mt-0.5">🌿</span>
        <p className="text-[12px] text-[#166534] leading-relaxed">
          BhojanSetu has rescued <strong>12,400+ meals</strong> across India.
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;