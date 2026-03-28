// src/components/ngo/NgoSidebar.jsx

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const navItems = [
  { to: "/ngo/dashboard",      icon: "🏠", label: "Dashboard"      },
  { to: "/ngo/donations",      icon: "🍱", label: "Donations"      },
  { to: "/ngo/accepted",       icon: "✅", label: "Accepted"       },
  { to: "/ngo/map",            icon: "🗺️", label: "Map View"       },
  { to: "/ngo/notifications",  icon: "🔔", label: "Notifications"  },
  { to: "/ngo/profile",        icon: "👤", label: "Profile"        },
];

const getInitials = (name = "") =>
  name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

const NgoSidebar = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } catch (_) {}
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-[#1A1A2E] flex flex-col z-50 shadow-xl">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-gradient-to-br from-[#E76F1A] to-[#F4A261] rounded-lg flex items-center justify-center text-base">
          🏠
        </div>
        <div>
          <p className="font-playfair text-white font-bold text-[15px] leading-none">BhojanSetu</p>
          <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">NGO Portal</p>
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 mt-4 mb-2 bg-white/6 border border-white/10 rounded-xl px-3 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E76F1A] to-[#F4A261] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
          {getInitials(user?.ngoName || user?.name || "N")}
        </div>
        <div className="min-w-0">
          <p className="text-white text-[13px] font-semibold leading-tight truncate">
            {user?.ngoName || user?.name || "NGO"}
          </p>
          <p className="text-white/40 text-[10px] mt-0.5 flex items-center gap-1">
            🏠 Organization
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 no-underline ${
                isActive
                  ? "bg-[#E76F1A] text-white shadow-sm"
                  : "text-white/55 hover:text-white hover:bg-white/8"
              }`
            }
          >
            <span className="text-[16px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all"
        >
          <span className="text-[16px]">🚪</span> Logout
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>
    </aside>
  );
};

export default NgoSidebar;
