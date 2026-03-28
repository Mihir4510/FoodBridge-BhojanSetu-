// src/components/ngo/NgoLayout.jsx

import NgoSidebar from "./NgoSidebar";
import { useAuth } from "../../context/AuthContext";

const NgoLayout = ({ children, title, subtitle }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-dm">
      <div className="hidden lg:block">
        <NgoSidebar />
      </div>

      <main className="lg:ml-[220px] min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-7 h-7 bg-gradient-to-br from-[#E76F1A] to-[#F4A261] rounded-lg flex items-center justify-center text-sm">🏠</div>
            <span className="font-playfair text-[15px] font-bold text-[#E76F1A]">BhojanSetu</span>
          </div>
          {/* Desktop title */}
          <div className="hidden lg:block">
            <h1 className="text-[20px] font-bold text-[#111827] leading-none">{title}</h1>
            {subtitle && <p className="text-[13px] text-[#6B7280] mt-0.5">{subtitle}</p>}
          </div>
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E76F1A] to-[#F4A261] flex items-center justify-center text-white text-[12px] font-bold">
              {(user?.ngoName || user?.name || "N").charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold text-[#111827] leading-none">
                {user?.ngoName || user?.name || "NGO"}
              </p>
              <p className="text-[11px] text-[#9CA3AF]">🏠 Organization</p>
            </div>
          </div>
        </header>

        {/* Mobile title */}
        <div className="lg:hidden px-6 pt-5">
          <h1 className="text-[20px] font-bold text-[#111827]">{title}</h1>
          {subtitle && <p className="text-[13px] text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        .font-dm       { font-family: 'DM Sans', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default NgoLayout;
