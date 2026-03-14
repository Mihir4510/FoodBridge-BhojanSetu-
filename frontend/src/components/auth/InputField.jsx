// src/components/InputField.jsx
import { useState } from "react";

const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  icon,
  error,
  required = false,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-[13px] font-semibold text-[#374151] tracking-wide"
      >
        {label}
        {required && <span className="text-[#E76F1A] ml-0.5">*</span>}
      </label>

      <div className="relative">
        {/* Left icon */}
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[16px] pointer-events-none">
            {icon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`
            w-full bg-white border rounded-xl px-4 py-3 text-[14px] text-[#111827]
            placeholder:text-[#9CA3AF] outline-none transition-all duration-200
            ${icon ? "pl-10" : ""}
            ${isPassword ? "pr-11" : ""}
            ${error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-[#E5E7EB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10"
            }
          `}
        />

        {/* Show/hide password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors text-[16px]"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-[12px] text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
