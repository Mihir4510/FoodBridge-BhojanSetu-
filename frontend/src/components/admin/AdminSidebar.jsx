// src/components/admin/AdminSidebar.jsx

import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { logoutUser } from "../../service/authService"; // adjust path if needed

const navItems = [
  { to: "/admin/dashboard",  icon: "🏠", label: "Dashboard"     },
  { to: "/admin/pending",    icon: "⏳", label: "Pending Users"  },
  { to: "/admin/users",      icon: "👥", label: "All Users"      },
  { to: "/admin/donations",  icon: "🍱", label: "Donations"      },
  { to: "/admin/analytics",  icon: "📊", label: "Analytics"      },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  

const handleLogout = async () => {
  try {
    await logoutUser(); // ✅ uses correct backend URL
  } catch (_) {}
  navigate("/login");
};
  return (
    <aside className="fixed left-0 top-0 h-full w-[230px] bg-[#1A2E22] flex flex-col z-50 shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-gradient-to-br from-[#2D6A4F] to-[#40916C] rounded-lg flex items-center justify-center text-base">
          🌿
        </div>
        <div>
          <p className="font-playfair text-white font-bold text-[15px] leading-none">BhojanSetu</p>
          <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
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
            <span className="text-[17px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all duration-150"
        >
          <span className="text-[17px]">🚪</span> Logout
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>
    </aside>
  );
};

export default AdminSidebar;
