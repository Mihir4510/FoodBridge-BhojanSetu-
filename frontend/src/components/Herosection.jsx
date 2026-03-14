// src/components/Hero.jsx
// Place in: src/components/Hero.jsx (or src/components/landing/Hero.jsx)
// Requirements: React Router, Tailwind CSS, Google Fonts (Playfair Display + DM Sans)

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ── Animated counter hook ─────────────────────────────────
function useCounter(target, duration = 1600) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ── Floating badge ────────────────────────────────────────
function FloatingBadge({ emoji, value, label, className }) {
  return (
    <div className={`absolute bg-white rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-3 ${className}`}>
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="font-playfair text-[18px] font-bold text-[#1A1A2E] leading-none">{value}</p>
        <p className="text-[11px] text-[#6B7280] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Main Hero ─────────────────────────────────────────────
const Hero = () => {
  const meals  = useCounter(12400);
  const ngos   = useCounter(86);
  const cities = useCounter(24);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#FFFDF7] font-dm pt-20">

      {/* ── Background decoration ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large radial blobs */}
        <div className="absolute w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.07),transparent_65%)] -top-48 -right-48" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(231,111,26,0.07),transparent_65%)] bottom-0 left-0" />
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]">
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill="#2D6A4F" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
        {/* Diagonal green sweep bottom-right */}
        <div
          className="absolute bottom-0 right-0 w-[55%] h-[55%] opacity-[0.04]"
          style={{ background: "linear-gradient(135deg, transparent 40%, #2D6A4F 100%)" }}
        />
      </div>

      {/* ── Floating ambient food icons ── */}
      {[
        { icon: "🥗", top: "12%", left: "5%",  size: "text-[28px]", delay: "0s",   dur: "7s"  },
        { icon: "🍛", top: "20%", right: "4%", size: "text-[24px]", delay: "1.5s", dur: "6s"  },
        { icon: "🍞", top: "70%", left: "3%",  size: "text-[20px]", delay: "3s",   dur: "8s"  },
        { icon: "🥘", top: "75%", right: "5%", size: "text-[22px]", delay: "2s",   dur: "6.5s"},
        { icon: "🌽", top: "40%", left: "8%",  size: "text-[18px]", delay: "4s",   dur: "7.5s"},
      ].map((f, i) => (
        <span
          key={i}
          className={`absolute ${f.size} opacity-30 select-none pointer-events-none`}
          style={{
            top: f.top, left: f.left, right: f.right,
            animation: `ambientFloat ${f.dur} ease-in-out ${f.delay} infinite`,
          }}
        >
          {f.icon}
        </span>
      ))}

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 grid lg:grid-cols-2 gap-16 items-center">

        {/* ── LEFT: Copy ── */}
        <div className="flex flex-col" style={{ animation: "heroFadeUp 0.9s ease 0.1s both" }}>

          {/* Mission pill */}
          <div className="inline-flex items-center gap-2 self-start bg-[#D8F3DC] text-[#1A4731] text-[13px] font-semibold px-4 py-1.5 rounded-full mb-7 border border-[#B7E4C7]">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
            Rescuing food across India
          </div>

          {/* Headline */}
          <h1 className="font-playfair text-[clamp(40px,5.5vw,70px)] leading-[1.06] text-[#1A1A2E] mb-6">
            Bridge Surplus Food
            <br />
            to{" "}
            <span className="relative inline-block text-[#E76F1A]">
              Empty Plates
              {/* Underline squiggle */}
              <svg
                viewBox="0 0 220 12"
                className="absolute -bottom-1.5 left-0 w-full"
                preserveAspectRatio="none"
                height="10"
              >
                <path
                  d="M4 8 Q30 2 60 8 Q90 14 120 8 Q150 2 180 8 Q200 12 216 7"
                  fill="none"
                  stroke="#E76F1A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              </svg>
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-[17px] text-[#5A6270] leading-[1.78] max-w-[520px] mb-10">
            BhojanSetu connects restaurants, events, and households with
            nearby NGOs to ensure surplus food reaches those who need it
            most — instead of going to waste.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Link
              to="/register"
              className="no-underline inline-flex items-center gap-2.5 bg-[#2D6A4F] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold shadow-[0_4px_20px_rgba(45,106,79,0.35)] hover:bg-[#245a42] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(45,106,79,0.4)] transition-all duration-200"
            >
              <span>🍱</span> Donate Food
            </Link>
            <Link
              to="/register?role=ngo"
              className="no-underline inline-flex items-center gap-2.5 bg-[#E76F1A] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold shadow-[0_4px_20px_rgba(231,111,26,0.3)] hover:bg-[#d4621a] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(231,111,26,0.4)] transition-all duration-200"
            >
              <span>🏠</span> Join as NGO
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6 pt-6 border-t border-[#E9EAE8]">
            {[
              { ref: meals.ref,  count: meals.count,  suffix: "+",  label: "Meals rescued",  icon: "🍽️" },
              { ref: ngos.ref,   count: ngos.count,   suffix: "+",  label: "NGO partners",   icon: "🤝" },
              { ref: cities.ref, count: cities.count, suffix: "+",  label: "Cities served",  icon: "📍" },
            ].map((s, i) => (
              <div key={i} ref={s.ref} className="flex items-center gap-2.5">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <p className="font-playfair text-[22px] font-bold text-[#1A1A2E] leading-none">
                    {s.count.toLocaleString()}{s.suffix}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF] mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Illustration + floating cards ── */}
        <div
          className="relative flex items-center justify-center"
          style={{ animation: "heroFadeIn 1.1s ease 0.35s both" }}
        >
          {/* Glow behind illustration */}
          <div className="absolute w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.12),transparent_65%)]" />

          {/* Main SVG illustration */}
          <div className="relative z-10">
            <svg
              viewBox="0 0 460 460"
              className="w-[340px] sm:w-[400px] lg:w-[440px] xl:w-[460px] drop-shadow-sm"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ── Ground / platform ── */}
              <ellipse cx="230" cy="415" rx="180" ry="18" fill="#2D6A4F" opacity="0.08" />

              {/* ── Restaurant building (left) ── */}
              <rect x="30" y="220" width="110" height="160" rx="10" fill="#2D6A4F" opacity="0.15" />
              <rect x="30" y="220" width="110" height="160" rx="10" fill="none" stroke="#2D6A4F" strokeWidth="1.5" opacity="0.4" />
              {/* roof */}
              <path d="M20 228 L85 185 L150 228Z" fill="#2D6A4F" opacity="0.25" />
              {/* windows */}
              <rect x="50" y="248" width="26" height="22" rx="4" fill="#2D6A4F" opacity="0.3" />
              <rect x="94" y="248" width="26" height="22" rx="4" fill="#2D6A4F" opacity="0.3" />
              <rect x="50" y="288" width="26" height="22" rx="4" fill="#2D6A4F" opacity="0.3" />
              <rect x="94" y="288" width="26" height="22" rx="4" fill="#2D6A4F" opacity="0.3" />
              {/* door */}
              <rect x="68" y="344" width="34" height="36" rx="5" fill="#2D6A4F" opacity="0.35" />
              {/* signage */}
              <rect x="44" y="232" width="82" height="14" rx="4" fill="#40916C" opacity="0.5" />
              <text x="85" y="243" textAnchor="middle" fontSize="7" fill="white" opacity="0.9" fontWeight="600">RESTAURANT</text>

              {/* ── NGO building (right) ── */}
              <rect x="320" y="230" width="110" height="150" rx="10" fill="#E76F1A" opacity="0.12" />
              <rect x="320" y="230" width="110" height="150" rx="10" fill="none" stroke="#E76F1A" strokeWidth="1.5" opacity="0.35" />
              {/* roof */}
              <path d="M312 238 L375 195 L438 238Z" fill="#E76F1A" opacity="0.2" />
              {/* windows */}
              <rect x="340" y="258" width="26" height="22" rx="4" fill="#E76F1A" opacity="0.3" />
              <rect x="384" y="258" width="26" height="22" rx="4" fill="#E76F1A" opacity="0.3" />
              {/* heart symbol on NGO */}
              <path d="M375 300 C375 300 363 290 357 296 C351 302 357 310 375 320 C393 310 399 302 393 296 C387 290 375 300 375 300Z" fill="#E76F1A" opacity="0.5" />
              {/* door */}
              <rect x="358" y="342" width="34" height="38" rx="5" fill="#E76F1A" opacity="0.3" />
              {/* signage */}
              <rect x="334" y="242" width="82" height="14" rx="4" fill="#E76F1A" opacity="0.45" />
              <text x="375" y="253" textAnchor="middle" fontSize="7" fill="white" opacity="0.9" fontWeight="600">NGO CENTRE</text>

              {/* ── Center: donation transfer ── */}
              {/* Path connecting buildings — dashed arc */}
              <path
                d="M148 330 Q230 270 322 330"
                stroke="#2D6A4F"
                strokeWidth="2.5"
                strokeDasharray="7 5"
                fill="none"
                opacity="0.4"
              />
              {/* Arrow tip */}
              <polygon points="316,322 328,330 316,338" fill="#2D6A4F" opacity="0.4" />

              {/* Food boxes on cart / tray */}
              <rect x="192" y="330" width="76" height="48" rx="10" fill="#2D6A4F" opacity="0.15" />
              <rect x="192" y="330" width="76" height="48" rx="10" fill="none" stroke="#2D6A4F" strokeWidth="1.5" opacity="0.5" />
              {/* box stacked */}
              <rect x="200" y="316" width="60" height="18" rx="6" fill="#40916C" opacity="0.35" />
              <rect x="200" y="316" width="60" height="18" rx="6" fill="none" stroke="#40916C" strokeWidth="1" opacity="0.6" />
              {/* food emoji */}
              <text x="230" y="360" textAnchor="middle" fontSize="20" opacity="0.75">🥘</text>
              {/* wheels */}
              <circle cx="210" cy="382" r="7" fill="#2D6A4F" opacity="0.3" />
              <circle cx="210" cy="382" r="4" fill="#2D6A4F" opacity="0.5" />
              <circle cx="250" cy="382" r="7" fill="#2D6A4F" opacity="0.3" />
              <circle cx="250" cy="382" r="4" fill="#2D6A4F" opacity="0.5" />

              {/* ── People ── */}
              {/* Donor person (left, handing over) */}
              <circle cx="168" cy="285" r="20" fill="#40916C" opacity="0.7" />
              <rect x="150" y="305" width="38" height="42" rx="19" fill="#40916C" opacity="0.6" />
              {/* arm extending */}
              <path d="M186 318 Q205 312 210 328" stroke="#40916C" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.6" />

              {/* Receiver person (right, hands out) */}
              <circle cx="294" cy="285" r="20" fill="#E76F1A" opacity="0.65" />
              <rect x="276" y="305" width="38" height="42" rx="19" fill="#E76F1A" opacity="0.55" />
              {/* arm receiving */}
              <path d="M276 318 Q258 312 252 328" stroke="#E76F1A" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.55" />

              {/* ── Top: sun / hopeful element ── */}
              <circle cx="230" cy="75" r="42" fill="#FEFAE0" opacity="0.7" />
              <circle cx="230" cy="75" r="32" fill="#FEF08A" opacity="0.5" />
              <text x="230" y="84" textAnchor="middle" fontSize="28" opacity="0.75">☀️</text>
              {/* rays */}
              {[0,45,90,135,180,225,270,315].map((deg, i) => {
                const r1 = 46, r2 = 56;
                const rad = (deg * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={230 + r1 * Math.cos(rad)}
                    y1={75 + r1 * Math.sin(rad)}
                    x2={230 + r2 * Math.cos(rad)}
                    y2={75 + r2 * Math.sin(rad)}
                    stroke="#FEF08A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                );
              })}

              {/* ── Connection lines from buildings to sun ── */}
              <line x1="85" y1="185" x2="188" y2="118" stroke="#2D6A4F" strokeWidth="1" strokeDasharray="5 4" opacity="0.2" />
              <line x1="375" y1="195" x2="272" y2="118" stroke="#E76F1A" strokeWidth="1" strokeDasharray="5 4" opacity="0.2" />

              {/* ── Small floating food sparkles ── */}
              <text x="55" y="195" fontSize="16" opacity="0.4">🍞</text>
              <text x="362" y="185" fontSize="14" opacity="0.35">🌾</text>
              <text x="200" y="160" fontSize="13" opacity="0.3">✨</text>
              <text x="260" y="148" fontSize="13" opacity="0.3">✨</text>
            </svg>

            {/* ── Floating impact cards ── */}
            <FloatingBadge
              emoji="🍛"
              value="12,400+"
              label="Meals rescued today"
              className="top-4 -left-6 animate-float-1"
            />
            <FloatingBadge
              emoji="🤝"
              value="86 NGOs"
              label="Active partners"
              className="bottom-16 -right-4 animate-float-2"
            />
            {/* Live ping */}
            <div className="absolute top-1/2 -right-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl px-3 py-2 flex items-center gap-2 shadow-md animate-float-3">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[12px] font-semibold text-[#166534]">Live donations</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom wave ── */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12" fill="none">
          <path d="M0 60 Q360 20 720 40 Q1080 60 1440 30 L1440 60Z" fill="#F3F4F6" opacity="0.5" />
        </svg>
      </div>

      {/* ── Animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm       { font-family: 'DM Sans', sans-serif; }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ambientFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-18px) rotate(6deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .animate-float-1 { animation: float1 4s ease-in-out infinite; }
        .animate-float-2 { animation: float2 5s ease-in-out 1s infinite; }
        .animate-float-3 { animation: float3 3.5s ease-in-out 0.5s infinite; }
      `}</style>
    </section>
  );
};

export default Hero;
