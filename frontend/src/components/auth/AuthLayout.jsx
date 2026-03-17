// src/components/AuthLayout.jsx
// Shared split-screen layout for Login & Register pages
import { Link } from "react-router-dom";
const AuthLayout = ({ children, variant = "login" }) => {
  const isLogin = variant === "login";

  const quotes = [
    { text: "Every meal saved is a life touched.", author: "BhojanSetu Mission" },
    { text: "Food waste ends where compassion begins.", author: "Our Community" },
    { text: "Bridge the gap between surplus and need.", author: "BhojanSetu" },
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="min-h-screen flex font-dm bg-[#F9FAFB]">

      {/* ── Left panel: illustration ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden bg-[#1A2E22] flex-col justify-between p-12">

        {/* Background layered blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.35),transparent_65%)] -top-32 -left-32" />
          <div className="absolute w-[380px] h-[380px] rounded-full bg-[radial-gradient(circle,rgba(231,111,26,0.18),transparent_65%)] bottom-0 right-0" />
          <div className="absolute w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(64,145,108,0.2),transparent_65%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          {/* Dot grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#2D6A4F] to-[#40916C] rounded-xl flex items-center justify-center text-lg shadow-lg">
            🌿
          </div>
          <span className="font-playfair text-xl font-bold text-white">BhojanSetu</span>
       </Link>

        {/* Center illustration */}
        <div className="relative z-10 flex-1 flex items-center justify-center py-12">
          <div className="relative">
            {/* Main SVG Illustration */}
            <svg viewBox="0 0 380 340" className="w-[340px] xl:w-[380px]" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Table */}
              <rect x="40" y="260" width="300" height="14" rx="7" fill="#2D6A4F" opacity="0.5" />
              <rect x="80" y="274" width="12" height="40" rx="4" fill="#2D6A4F" opacity="0.35" />
              <rect x="288" y="274" width="12" height="40" rx="4" fill="#2D6A4F" opacity="0.35" />

              {/* Large bowl */}
              <ellipse cx="190" cy="248" rx="90" ry="20" fill="#1E4434" opacity="0.8" />
              <path d="M100 220 Q100 260 190 260 Q280 260 280 220" fill="#2D6A4F" opacity="0.9" />
              <ellipse cx="190" cy="220" rx="90" ry="18" fill="#40916C" opacity="0.8" />
              <ellipse cx="190" cy="218" rx="78" ry="14" fill="#52B788" opacity="0.5" />
              {/* Food in bowl */}
              <ellipse cx="190" cy="218" rx="60" ry="10" fill="#D8F3DC" opacity="0.4" />
              <circle cx="174" cy="214" r="7" fill="#E76F1A" opacity="0.7" />
              <circle cx="196" cy="217" r="5" fill="#F4A261" opacity="0.7" />
              <circle cx="212" cy="213" r="6" fill="#E76F1A" opacity="0.6" />
              <circle cx="184" cy="221" r="4" fill="#FEFAE0" opacity="0.5" />

              {/* Small plate left */}
              <ellipse cx="90" cy="250" rx="38" ry="10" fill="#1A3828" opacity="0.7" />
              <ellipse cx="90" cy="247" rx="35" ry="9" fill="#2D6A4F" opacity="0.7" />
              <ellipse cx="90" cy="246" rx="28" ry="7" fill="#52B788" opacity="0.4" />
              <circle cx="84" cy="244" r="5" fill="#FEFAE0" opacity="0.5" />
              <circle cx="96" cy="245" r="4" fill="#E76F1A" opacity="0.5" />

              {/* Small plate right */}
              <ellipse cx="290" cy="250" rx="38" ry="10" fill="#1A3828" opacity="0.7" />
              <ellipse cx="290" cy="247" rx="35" ry="9" fill="#2D6A4F" opacity="0.7" />
              <ellipse cx="290" cy="246" rx="28" ry="7" fill="#52B788" opacity="0.4" />
              <circle cx="283" cy="244" r="4" fill="#F4A261" opacity="0.5" />
              <circle cx="296" cy="245" r="5" fill="#FEFAE0" opacity="0.4" />

              {/* People silhouettes */}
              {/* Person 1 (donor - left) */}
              <circle cx="90" cy="148" r="22" fill="#40916C" opacity="0.8" />
              <rect x="68" y="168" width="44" height="50" rx="22" fill="#40916C" opacity="0.7" />
              {/* hands offering */}
              <path d="M58 195 Q45 185 50 175 Q56 168 62 178" fill="#40916C" opacity="0.7" />
              <path d="M122 195 Q135 185 130 175 Q124 168 118 178" fill="#40916C" opacity="0.7" />
              {/* Person 2 (receiver - right) */}
              <circle cx="290" cy="148" r="22" fill="#E76F1A" opacity="0.7" />
              <rect x="268" y="168" width="44" height="50" rx="22" fill="#E76F1A" opacity="0.6" />
              {/* hands receiving */}
              <path d="M258 195 Q245 195 248 182 Q254 174 262 184" fill="#E76F1A" opacity="0.6" />
              <path d="M322 195 Q335 195 332 182 Q326 174 318 184" fill="#E76F1A" opacity="0.6" />

              {/* Arrow connecting them */}
              <path d="M150 170 Q190 150 230 170" stroke="#D8F3DC" strokeWidth="2" fill="none" strokeDasharray="6 4" opacity="0.6" />
              <polygon points="228,163 236,173 220,173" fill="#D8F3DC" opacity="0.6" />

              {/* Heart above */}
              <path d="M190 110 C190 110 178 98 172 104 C166 110 172 118 190 130 C208 118 214 110 208 104 C202 98 190 110 190 110Z" fill="#E76F1A" opacity="0.6" />

              {/* Floating food icons */}
              <text x="28" y="100" fontSize="24" opacity="0.5">🥗</text>
              <text x="315" y="85" fontSize="20" opacity="0.45">🍛</text>
              <text x="145" y="52" fontSize="18" opacity="0.4">🍞</text>
              <text x="225" y="58" fontSize="16" opacity="0.35">🥘</text>

              {/* Stats floating cards */}
              <rect x="10" y="20" width="110" height="46" rx="12" fill="white" opacity="0.08" />
              <text x="30" y="40" fontSize="11" fill="white" opacity="0.7" fontWeight="600">Meals rescued</text>
              <text x="30" y="57" fontSize="16" fill="#52B788" fontWeight="700">12,400+</text>

              <rect x="258" y="20" width="110" height="46" rx="12" fill="white" opacity="0.08" />
              <text x="274" y="40" fontSize="11" fill="white" opacity="0.7" fontWeight="600">NGO Partners</text>
              <text x="274" y="57" fontSize="16" fill="#E76F1A" fontWeight="700">86+</text>
            </svg>

            {/* Floating ping badges */}
            <div className="absolute -top-2 -right-4 bg-white/10 border border-white/15 rounded-2xl px-3 py-2 text-white text-[11px] font-semibold backdrop-blur-sm animate-bounce-slow">
              🔔 New donation nearby!
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <blockquote className="border-l-2 border-[#40916C] pl-4">
            <p className="text-white/80 text-[15px] leading-relaxed italic">"{quote.text}"</p>
            <cite className="text-[#52B788] text-[12px] font-semibold not-italic mt-1 block">— {quote.author}</cite>
          </blockquote>
          <div className="flex gap-2 mt-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${isLogin ? (i === 0 ? "w-6 bg-[#40916C]" : "w-2 bg-white/20") : (i === 1 ? "w-6 bg-[#E76F1A]" : "w-2 bg-white/20")}`} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
         
          <div className="w-8 h-8 bg-gradient-to-br from-[#2D6A4F] to-[#40916C] rounded-lg flex items-center justify-center text-base">
            🌿
          </div>
          <span className="font-playfair text-lg font-bold text-[#2D6A4F]">BhojanSetu</span>
        </div>
        

        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm       { font-family: 'DM Sans', sans-serif; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AuthLayout;
