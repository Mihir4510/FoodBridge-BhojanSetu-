// src/components/HowItWorks.jsx
// Place in: src/components/HowItWorks.jsx (or src/components/landing/HowItWorks.jsx)
// Requirements: Tailwind CSS, Google Fonts (Playfair Display + DM Sans)

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ── Scroll-reveal hook ────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Step card ─────────────────────────────────────────────
const steps = [
  {
    number: "01",
    emoji: "🍱",
    title: "Donate Surplus Food",
    desc: "Restaurants, event organizers, and households list their extra food on BhojanSetu instead of letting it go to waste.",
    role: "Donor",
    roleIcon: "🍴",
    accent: "#2D6A4F",
    pale: "#D8F3DC",
    darkPale: "#1A4731",
    highlights: ["Takes under 2 minutes", "Set quantity & pickup time", "Auto geo-tagged location"],
  },
  {
    number: "02",
    emoji: "🔔",
    title: "NGOs Receive Alerts",
    desc: "Nearby verified NGOs get instant real-time notifications and can accept the donation with a single tap.",
    role: "NGO",
    roleIcon: "🏠",
    accent: "#E76F1A",
    pale: "#FDE8D5",
    darkPale: "#7C2D12",
    highlights: ["Real-time Socket.IO alerts", "Location-based matching", "One-tap acceptance"],
  },
  {
    number: "03",
    emoji: "❤️",
    title: "Food Reaches Communities",
    desc: "NGO volunteers collect and distribute the food to shelters, schools, and families who need it most.",
    role: "Community",
    roleIcon: "🤝",
    accent: "#7C3AED",
    pale: "#EDE9FE",
    darkPale: "#4C1D95",
    highlights: ["Volunteer-driven pickup", "Tracked & confirmed", "Zero cost, real impact"],
  },
];

// ── Main Component ────────────────────────────────────────
const HowItWorks = () => {
  const header  = useReveal(0.2);
  const flow    = useReveal(0.1);
  const cards   = useReveal(0.1);
  const bottom  = useReveal(0.2);

  return (
    <section
      id="how-it-works"
      className="relative py-28 bg-[#F9FAFB] overflow-hidden font-dm"
    >
      {/* ── Background decoration ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.05),transparent_70%)] -top-40 -left-40" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(231,111,26,0.05),transparent_70%)] bottom-0 right-0" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">

        {/* ── Header ── */}
        <div
          ref={header.ref}
          className="text-center mb-16 transition-all duration-700"
          style={{
            opacity: header.visible ? 1 : 0,
            transform: header.visible ? "translateY(0)" : "translateY(32px)",
          }}
        >
          <div className="inline-flex items-center gap-2 bg-[#D8F3DC] text-[#1A4731] text-[12px] font-semibold px-4 py-1.5 rounded-full mb-5 border border-[#B7E4C7] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
            Simple 3-step process
          </div>
          <h2 className="font-playfair text-[clamp(32px,4.5vw,54px)] text-[#1A1A2E] leading-[1.15] mb-4">
            How BhojanSetu Works
          </h2>
          <p className="text-[17px] text-[#6B7280] max-w-xl mx-auto leading-[1.75]">
            A simple bridge connecting surplus food with people who need it most —
            from kitchen to community in three easy steps.
          </p>
        </div>

        {/* ── Visual flow bar ── */}
        <div
          ref={flow.ref}
          className="hidden md:flex items-center justify-center gap-0 mb-14 transition-all duration-700 delay-100"
          style={{
            opacity: flow.visible ? 1 : 0,
            transform: flow.visible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {[
            { icon: "🍱", label: "Donor + Resturant",     color: "bg-[#D8F3DC]", text: "text-[#1A4731]",  border: "border-[#B7E4C7]" },
            { icon: " 🌿", label: "BhojanSetu",  color: "bg-[#FEF9C3]", text: "text-[#854D0E]",  border: "border-[#FDE68A]" },
            { icon: "🚚", label: "NGO",       color: "bg-[#FDE8D5]", text: "text-[#7C2D12]",  border: "border-[#FCA572]" },
            { icon: "❤️", label: "Community", color: "bg-[#EDE9FE]", text: "text-[#4C1D95]",  border: "border-[#C4B5FD]" },
          ].map((item, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border ${item.color} ${item.border} shadow-sm`}>
                <span className="text-[22px]">{item.icon}</span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${item.text}`}>{item.label}</span>
              </div>
              {i < 3 && (
                <div className="flex items-center mx-1">
                  <div className="w-8 h-px bg-[#D1D5DB]" />
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Step cards ── */}
        <div
          ref={cards.ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-7 relative"
        >
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-[72px] left-[33%] right-[33%] h-px z-0">
            <div
              className="h-full transition-all duration-1000 delay-300"
              style={{
                background: "linear-gradient(90deg, #2D6A4F, #E76F1A, #7C3AED)",
                opacity: cards.visible ? 0.25 : 0,
                transform: cards.visible ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
              }}
            />
          </div>

          {steps.map((step, i) => (
            <div
              key={i}
              className="relative bg-white rounded-2xl border border-[#E5E7EB] p-7 shadow-sm group hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.09)] transition-all duration-300 cursor-default"
              style={{
                opacity: cards.visible ? 1 : 0,
                transform: cards.visible ? "translateY(0)" : "translateY(48px)",
                transition: `opacity 0.6s ease ${i * 0.15 + 0.2}s, transform 0.6s ease ${i * 0.15 + 0.2}s, box-shadow 0.3s, translate 0.3s`,
              }}
            >
              {/* Step number */}
              <div
                className="absolute -top-3.5 left-7 text-[11px] font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
                style={{ background: step.accent }}
              >
                Step {step.number}
              </div>

              {/* Icon circle */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-[32px] mb-5 mt-3 shadow-sm group-hover:scale-110 transition-transform duration-300"
                style={{ background: step.pale }}
              >
                {step.emoji}
              </div>

              {/* Role badge */}
              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4 uppercase tracking-wide"
                style={{ background: step.pale, color: step.darkPale }}
              >
                <span>{step.roleIcon}</span>
                {step.role}
              </div>

              {/* Title */}
              <h3 className="font-playfair text-[21px] font-bold text-[#1A1A2E] leading-tight mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[14px] text-[#6B7280] leading-[1.75] mb-5">
                {step.desc}
              </p>

              {/* Highlights */}
              <ul className="space-y-2">
                {step.highlights.map((h, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-[13px] text-[#374151]">
                    <span
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] flex-shrink-0 font-bold"
                      style={{ background: step.pale, color: step.accent }}
                    >
                      ✓
                    </span>
                    {h}
                  </li>
                ))}
              </ul>

              {/* Bottom accent bar */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${step.accent}, transparent)` }}
              />
            </div>
          ))}
        </div>

        {/* ── Bottom impact line + CTA ── */}
        <div
          ref={bottom.ref}
          className="mt-16 text-center transition-all duration-700"
          style={{
            opacity: bottom.visible ? 1 : 0,
            transform: bottom.visible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          {/* Tagline */}
          <div className="inline-flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-full px-6 py-3 shadow-sm mb-8">
            <span className="text-lg">🌿</span>
            <p className="text-[14px] text-[#374151] font-medium">
              Together, we reduce food waste and fight hunger —
              <span className="text-[#2D6A4F] font-semibold"> one meal at a time.</span>
            </p>
            <span className="text-lg">❤️</span>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="no-underline inline-flex items-center gap-2 bg-[#2D6A4F] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold shadow-[0_4px_16px_rgba(45,106,79,0.3)] hover:bg-[#245a42] hover:-translate-y-0.5 transition-all duration-200"
            >
              🍱 Start Donating
            </Link>
            <Link
              to="/register?role=ngo"
              className="no-underline inline-flex items-center gap-2 border-2 border-[#E76F1A] text-[#E76F1A] px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#E76F1A] hover:text-white hover:-translate-y-0.5 transition-all duration-200"
            >
              🏠 Register NGO
            </Link>
          </div>
        </div>
      </div>

      {/* ── Font injection ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm       { font-family: 'DM Sans', sans-serif; }
      `}</style>
    </section>
  );
};

export default HowItWorks;
