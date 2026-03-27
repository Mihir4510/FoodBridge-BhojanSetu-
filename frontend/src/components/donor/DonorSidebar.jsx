// src/components/donor/DonorSidebar.jsx

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/donor/dashboard",       icon: "🏠", label: "Dashboard"       },
  { to: "/donor/create-donation", icon: "➕", label: "Create Donation" },
  { to: "/donor/my-donations",    icon: "🍱", label: "My Donations"    },
  { to: "/donor/notifications",   icon: "🔔", label: "Notifications"   },
  { to: "/donor/profile",         icon: "👤", label: "Profile"         },
];

// ── Helpers ───────────────────────────────────────────────
const getDisplayName = (user) => {
  if (!user) return "Guest";
  // Restaurant → show restaurant name
  // Individual → show full name
  return user.role === "restaurant"
    ? (user.restaurantName || user.name || "Restaurant")
    : (user.name || "Donor");
};

const getRoleConfig = (role) => {
  const map = {
    restaurant: { portalLabel: "Restaurant Portal", icon: "🍽️" },
    individual: { portalLabel: "Donor Portal",      icon: "🍴" },
  };
  return map[role] || { portalLabel: "Donor Portal", icon: "🍴" };
};

const getInitials = (name = "") =>
  name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

// ── DonorSidebar ──────────────────────────────────────────
const DonorSidebar = () => {
  const { user, logout } = useAuth(); // ← reads from AuthContext
  const navigate         = useNavigate();
  const displayName      = getDisplayName(user);
  const roleConfig       = getRoleConfig(user?.role);

  const handleLogout = async () => {
    await logout(); // clears user from context + calls /api/auth/logout
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-[#1A2E22] flex flex-col z-50 shadow-xl">

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-gradient-to-br from-[#2D6A4F] to-[#40916C] rounded-lg flex items-center justify-center text-base">
          🌿
        </div>
        <div>
          <p className="font-playfair text-white font-bold text-[15px] leading-none">BhojanSetu</p>
          {/* Shows "Restaurant Portal" or "Donor Portal" */}
          <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">
            {roleConfig.portalLabel}
          </p>
        </div>
      </div>

      {/* ── User card ── */}
      <div className="mx-3 mt-4 mb-2 bg-white/6 border border-white/10 rounded-xl px-3 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#40916C] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
          {getInitials(displayName)}
        </div>
        <div className="min-w-0">
          {/* "Spice Garden Restaurant" or "Mihir Sharma" */}
          <p className="text-white text-[13px] font-semibold leading-tight truncate">
            {displayName}
          </p>
          <p className="text-white/40 text-[10px] mt-0.5 capitalize flex items-center gap-1">
            <span>{roleConfig.icon}</span>
            {user?.role || "donor"}
          </p>
        </div>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 no-underline ${
                isActive
                  ? "bg-[#2D6A4F] text-white shadow-sm"
                  : "text-white/55 hover:text-white hover:bg-white/8"
              }`
            }
          >
            <span className="text-[16px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ── Logout ── */}
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

export default DonorSidebar;
