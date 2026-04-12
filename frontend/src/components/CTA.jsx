// CTA.jsx
// Place this file in: src/components/CTA.jsx (or src/components/landing/CTA.jsx)
// Usage: import CTA from './components/CTA'

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ── Small reusable animated counter ──────────────────────
function Counter({ target, suffix = "", duration = 1800 }) {
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
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.6 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="font-playfair text-[38px] font-bold block leading-none">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// ── Floating card ─────────────────────────────────────────
function FloatingCard({ emoji, title, sub, badge, badgeColor, delay }) {
  return (
    <div
      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{ animation: `floatCard 5s ease-in-out ${delay}s infinite` }}
    >
      <span className="text-[30px] flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-[14px] font-semibold truncate">{title}</p>
        <p className="text-white/55 text-[12px] truncate">{sub}</p>
      </div>
      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${badgeColor}`}>
        {badge}
      </span>
    </div>
  );
}

// ── Main CTA Component ────────────────────────────────────
const CTA = () => {
  const [activeTab, setActiveTab] = useState("donor");

  const tabs = [
    { id: "donor",  label: "🍴 Donor",  cta: "Start Donating",  link: "/register",           desc: "Have surplus food? List it in under 60 seconds and we'll find the right NGO near you automatically." },
    { id: "ngo",    label: "🏠 NGO",    cta: "Register NGO",    link: "/register?role=ngo",   desc: "Get real-time alerts for food donations in your area. Accept, collect, and track everything in one place." },
    { id: "resto",  label: "🍽️ Restaurant", cta: "Join as Restaurant", link: "/register?role=restaurant", desc: "Turn your daily surplus into meaningful impact. Set recurring donation schedules for your kitchen." },
  ];

  const activeRole = tabs.find((t) => t.id === activeTab);

  const stats = [
    { val: 12400, suffix: "+", label: "Meals rescued" },
    { val: 86,    suffix: "+", label: "NGO partners" },
    { val: 340,   suffix: "+", label: "Active donors" },
    { val: 98,    suffix: "%", label: "Collected" },
  ];

  return (
    <section id="join" className="scroll-mt-24 relative overflow-hidden bg-[#1A1A2E] py-24 px-6 md:px-16">

      {/* ── Background decoration ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Big radial blobs */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.15),transparent_70%)] -top-40 -left-40" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(231,111,26,0.12),transparent_70%)] -bottom-20 -right-20" />
        {/* Grid dots */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* ── Top label ── */}
      <div className="relative z-10 text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-[#D8F3DC] text-[12px] font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-[#40916C] animate-pulse" />
          Join 400+ donors &amp; NGOs across India
        </div>

        <h2 className="font-playfair text-[clamp(36px,5vw,60px)] text-white leading-[1.1] mb-5">
          Ready to make a{" "}
          <span className="relative inline-block">
            <span className="text-[#E76F1A]">real difference?</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 10" preserveAspectRatio="none" height="8">
              <path d="M0 8 Q100 0 200 8" fill="none" stroke="#E76F1A" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
            </svg>
          </span>
        </h2>

        <p className="text-white/55 text-[17px] max-w-lg mx-auto leading-[1.7]">
          Whether you have food to give or people to feed — BhojanSetu connects you instantly.
        </p>
      </div>

      {/* ── Main content grid ── */}
      <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* ── Left: Role tabs + CTA card ── */}
        <div>
          {/* Tab switcher */}
          <div className="flex gap-2 mb-6 bg-white/6 p-1.5 rounded-2xl border border-white/8">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2 px-3 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                  activeTab === t.id
                    ? "bg-white text-[#1A1A2E] shadow-sm"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white/6 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <p className="text-white/65 text-[15px] leading-[1.75] mb-8">
              {activeRole.desc}
            </p>

            {/* Features checklist */}
            {activeTab === "donor" && (
              <ul className="space-y-3 mb-8">
                {["List food in under 60 seconds", "Auto-matched to nearest NGO", "Track your donation history", "Get email confirmations"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[14px] text-white/75">
                    <span className="w-5 h-5 rounded-full bg-[#2D6A4F]/60 text-[#D8F3DC] text-[11px] flex items-center justify-center flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "ngo" && (
              <ul className="space-y-3 mb-8">
                {["Real-time Socket.IO alerts", "Geo-matched donations nearby", "One-tap accept & collect", "Full collection history"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[14px] text-white/75">
                    <span className="w-5 h-5 rounded-full bg-[#E76F1A]/40 text-[#FDE8D5] text-[11px] flex items-center justify-center flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "resto" && (
              <ul className="space-y-3 mb-8">
                {["Recurring donation schedules", "Verified NGO partners only", "Builds your CSR record", "Zero coordination hassle"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[14px] text-white/75">
                    <span className="w-5 h-5 rounded-full bg-[#2563EB]/50 text-[#BFDBFE] text-[11px] flex items-center justify-center flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={activeRole.link}
                className="flex-1 text-center bg-[#E76F1A] text-white py-3.5 rounded-xl text-[15px] font-semibold shadow-[0_4px_20px_rgba(231,111,26,0.3)] hover:bg-[#d4621a] hover:-translate-y-0.5 transition-all no-underline"
              >
                {activeRole.cta} →
              </Link>
              <Link
                to="/login"
                className="text-center border border-white/20 text-white/70 py-3.5 rounded-xl text-[15px] font-medium hover:border-white/40 hover:text-white transition-all no-underline px-5"
              >
                Login
              </Link>
            </div>

            <p className="text-white/30 text-[12px] text-center mt-4">
              Free to join · No credit card required · India only
            </p>
          </div>
        </div>

        {/* ── Right: Stats + live feed ── */}
        <div className="flex flex-col gap-6">

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-white/6 border border-white/10 rounded-2xl p-5 text-white"
              >
                <Counter target={s.val} suffix={s.suffix} />
                <span className="text-white/45 text-[12px] mt-1 block">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Live feed cards */}
          <div className="space-y-3">
            <p className="text-white/30 text-[12px] uppercase tracking-widest font-semibold">Live activity</p>
            <FloatingCard
              emoji="🍛"
              title="Dal Makhani + Rice"
              sub="Serves 25 · Pune · 2 min ago"
              badge="Matched ✓"
              badgeColor="bg-[#D8F3DC]/20 text-[#D8F3DC]"
              delay={0}
            />
            <FloatingCard
              emoji="🥗"
              title="Mixed Veg Biryani"
              sub="Serves 40 · Mumbai · 8 min ago"
              badge="Collecting"
              badgeColor="bg-[#FEF3C7]/20 text-[#FEF3C7]"
              delay={0.4}
            />
            <FloatingCard
              emoji="🍞"
              title="Bread + Curry"
              sub="Serves 12 · Nagpur · 15 min ago"
              badge="Collected ✓"
              badgeColor="bg-white/15 text-white/60"
              delay={0.8}
            />
          </div>

          {/* Trust badge */}
          <div className="border border-white/8 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/40 flex items-center justify-center text-xl flex-shrink-0">
              🛡️
            </div>
            <div>
              <p className="text-white text-[14px] font-semibold">Admin-verified NGOs and Resturant</p>
              <p className="text-white/45 text-[12px] mt-0.5">Every organization is manually approved before going live.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating animation keyframes ── */}
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
};

export default CTA;
