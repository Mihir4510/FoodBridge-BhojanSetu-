// ADD THIS SECTION to your existing LandingPage.jsx
// Replace your existing CTA section or add before footer
// This adds the "Become a Driver" and "Driver Login" buttons

// ── Driver CTA Banner (add to LandingPage.jsx) ────────────
// Import Link from react-router-dom if not already imported

import { Link } from "react-router-dom";

export const DriverCTABanner = () => (
  <section className="bg-[#1A2E22] py-16 px-6 md:px-16 font-dm">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* Left: text */}
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E76F1A]/20 text-[#F4A261] text-[12px] font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            🚗 Drive for BhojanSetu
          </div>
          <h2 className="font-playfair text-[clamp(28px,4vw,44px)] text-white leading-[1.15] mb-4">
            Not just feeding people —<br />
            <span className="text-[#E76F1A]">we create opportunities</span><br />
            to serve and earn.
          </h2>
          <p className="text-white/60 text-[15px] leading-[1.75] mb-8 max-w-md">
            Join as a delivery driver and help rescued food reach the right hands.
            Apply to a nearby NGO, get approved, and start delivering impact.
          </p>

          {/* Steps */}
          <div className="space-y-3 mb-8">
            {[
              { icon: "📝", step: "Apply online", desc: "Fill a quick form with your details and vehicle type" },
              { icon: "🏠", step: "Choose an NGO", desc: "Pick from verified NGOs near your location"          },
              { icon: "✅", step: "Get approved",   desc: "NGO reviews your application and activates your account" },
              { icon: "🚗", step: "Start delivering", desc: "Log in and begin picking up food donations"         },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[16px] flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="text-white text-[13px] font-semibold">{s.step}</p>
                  <p className="text-white/45 text-[12px]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/driver/apply"
              className="no-underline flex items-center gap-2 bg-[#E76F1A] text-white px-6 py-3.5 rounded-full text-[14px] font-semibold shadow-[0_4px_16px_rgba(231,111,26,0.35)] hover:bg-[#d4621a] hover:-translate-y-0.5 transition-all"
            >
              🚗 Become a Driver
            </Link>
            <Link
              to="/driver/login"
              className="no-underline flex items-center gap-2 border border-white/25 text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-white/10 transition-all"
            >
              🔐 Driver Login
            </Link>
            <Link
              to="/driver/status"
              className="no-underline flex items-center gap-2 text-white/50 text-[13px] font-medium hover:text-white/80 transition-colors"
            >
              📋 Check application status →
            </Link>
          </div>
        </div>

        {/* Right: stats card */}
        <div className="bg-white/6 border border-white/10 rounded-2xl p-7">
          <p className="text-white/40 text-[11px] uppercase tracking-widest font-semibold mb-5">Why drive with us?</p>
          <div className="space-y-4">
            {[
              { icon: "📍", title: "Geo-matched routes",      desc: "Our algorithm builds the shortest pickup route for you automatically" },
              { icon: "🔔", title: "Instant notifications",   desc: "Get notified the moment a donation is assigned to you"               },
              { icon: "🗺️", title: "Turn-by-turn navigation", desc: "Each stop links directly to Google Maps for easy navigation"          },
              { icon: "🤝", title: "Verified NGO partners",   desc: "Work only with admin-approved, legitimate food organizations"          },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white/8 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-[13px] font-semibold">{f.title}</p>
                  <p className="text-white/45 text-[12px] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>

    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
      .font-dm       { font-family: 'DM Sans', sans-serif; }
      .font-playfair { font-family: 'Playfair Display', serif; }
    `}</style>
  </section>
);
