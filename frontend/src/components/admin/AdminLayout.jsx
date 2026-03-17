// src/components/admin/AdminLayout.jsx

import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-[#F4F6F8] font-dm">
    <AdminSidebar />
    <main className="ml-[230px] min-h-screen">
      {/* Top bar */}
      <header className="bg-white border-b border-[#E5E7EB] px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1 className="text-[20px] font-bold text-[#111827] leading-none">{title}</h1>
          {subtitle && <p className="text-[13px] text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D8F3DC] flex items-center justify-center text-sm">🛡️</div>
          <div>
            <p className="text-[13px] font-semibold text-[#111827] leading-none">Admin</p>
            <p className="text-[11px] text-[#9CA3AF]">BhojanSetu</p>
          </div>
        </div>
      </header>
      <div className="p-8">{children}</div>
    </main>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
      .font-dm       { font-family: 'DM Sans', sans-serif; }
      .font-playfair { font-family: 'Playfair Display', serif; }
    `}</style>
  </div>
);

export default AdminLayout;
