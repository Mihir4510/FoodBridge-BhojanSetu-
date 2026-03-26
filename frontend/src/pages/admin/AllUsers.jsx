// src/pages/admin/AllUsers.jsx

import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner, ErrorBanner, Badge, Table, Tr, Td, Empty } from "../../components/admin/AdminUI";
import { getAllUsers } from "../../service/adminapi";

const ROLES = ["all", "individual", "organization", "restaurant"];

const AllUsers = () => {
  const [users, setUsers]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [roleFilter, setRole]   = useState("all");

  useEffect(() => {
    getAllUsers()
      .then((r) => {
        const data = r.data?.users || r.data || [];
        setUsers(data);
        setFiltered(data);
      })
      .catch((e) => {
      console.log("🔥 FULL ERROR:", e);                // complete error object
      console.log("📦 RESPONSE:", e.response);        // backend response
      console.log("📄 DATA:", e.response?.data);      // actual error message
      console.log("📊 STATUS:", e.response?.status);  // status code
      
      setError(e.response?.data?.message || "Failed to load users.");
    })
    .finally(() => setLoading(false));
      
  }, []);

  useEffect(() => {
    let data = [...users];
    if (roleFilter !== "all") data = data.filter((u) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.location?.city?.toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [search, roleFilter, users]);

  if (loading) return <AdminLayout title="All Users"><Spinner /></AdminLayout>;

  return (
    <AdminLayout title="All Users" subtitle={`${users.length} registered users on the platform.`}>
      {error && <ErrorBanner message={error} />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[14px]">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, city..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] bg-white outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold capitalize transition-all ${
                roleFilter === r
                  ? "bg-[#2D6A4F] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
              }`}
            >
              {r === "all" ? "All Roles" : r}
            </button>
          ))}
        </div>
      </div>

      <Table
        headers={["User", "Email", "Role", "Status", "Phone", "Location", "Joined"]}
        empty={filtered.length === 0 ? <Empty message="No users match your filters" /> : null}
      >
        {filtered.map((u, i) => (
          <Tr key={u._id} even={i % 2 === 1}>
            <Td>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#D8F3DC] flex items-center justify-center text-[13px] font-bold text-[#2D6A4F] flex-shrink-0">
                  {u.name?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="font-semibold text-[#111827]">{u.name}</span>
              </div>
            </Td>
            <Td>{u.email}</Td>
            <Td><Badge status={u.role} /></Td>
            <Td><Badge status={u.isApproved ? "approved" : u.approvalStatus || "pending"} /></Td>
            <Td>{u.phone || "—"}</Td>
            <Td>{u.location?.city || u.city || "—"}</Td>
            <Td className="text-[#9CA3AF]">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</Td>
          </Tr>
        ))}
      </Table>
    </AdminLayout>
  );
};

export default AllUsers;
