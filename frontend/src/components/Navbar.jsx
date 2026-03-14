import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-[#FFFDF7]/85 backdrop-blur-md border-b border-black/5 transition-shadow duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
      style={{ animation: "slideDown 0.6s ease both" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D6A4F] to-[#40916C] flex items-center justify-center text-lg">
          🌿
        </div>
        <span className="font-playfair text-xl font-bold text-[#2D6A4F]">
          BhojanSetu
        </span>
      </div>

      <ul className="hidden md:flex items-center gap-9 list-none">
  {[
    ["#how-it-works", "How it Works"],
    ["#join", "Join Us"],
  ].map(([href, label]) => (
    <li key={href}>
      <a
        href={href}
        className="text-[15px] font-medium text-[#2C2C2C] hover:text-[#2D6A4F] transition-colors no-underline"
      >
        {label}
      </a>
    </li>
  ))}

  <li>
    <Link
      to="/login"
      className="bg-[#E76F1A] text-white px-5 py-2.5 rounded-full text-[15px] font-semibold hover:bg-[#d4621a] hover:-translate-y-0.5 transition-all no-underline"
    >
      Login
    </Link>
  </li>
</ul>
    </nav>
  );
}

export default Navbar;