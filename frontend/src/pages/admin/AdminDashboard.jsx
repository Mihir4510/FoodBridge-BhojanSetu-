// src/pages/admin/AdminDashboard.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { StatCard, Spinner, ErrorBanner, Badge, Table, Tr, Td, Empty } from "../../components/admin/AdminUI";
import {
  getDashboardStats,
  getPendingUsers,
  getAllDonations,
  approveUser,
  rejectUser,
} from "../../service/adminapi";

const AdminDashboard = () => {
  const [stats, setStats]         = useState(null);
  const [pending, setPending]     = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, pRes, dRes] = await Promise.all([
          getDashboardStats(),
          getPendingUsers(),
          getAllDonations(),
        ]);
        setStats(sRes.data);
        setPending(pRes.data?.users || pRes.data || []);
        setDonations((dRes.data?.donations || dRes.data || []).slice(0, 6));
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      setPending((prev) => prev.filter((u) => u._id !== id));
    } catch { alert("Failed to approve user."); }
  };

  const handleReject = async (id) => {
    try {
      await rejectUser(id);
      setPending((prev) => prev.filter((u) => u._id !== id));
    } catch { alert("Failed to reject user."); }
  };

  if (loading) return <AdminLayout title="Dashboard"><Spinner /></AdminLayout>;

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back! Here's what's happening on BhojanSetu.">
      {error && <ErrorBanner message={error} />}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-8">
        <StatCard icon="👥" label="Total Users"      value={stats?.totalUsers        ?? "—"} color="green"  />
        <StatCard icon="⏳" label="Pending Approval" value={stats?.pendingUsers       ?? "—"} color="orange" />
        <StatCard icon="🍱" label="Total Donations"  value={stats?.totalDonations     ?? "—"} color="blue"   />
        <StatCard icon="✅" label="Completed"        value={stats?.completedDonations ?? "—"} color="green"  />
        <StatCard icon="🔴" label="High Priority"    value={stats?.highPriority       ?? "—"} color="red"    />
      </div>

      {/* ── Pending users ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#111827]">⏳ Pending Approvals</h2>
            <p className="text-[12px] text-[#9CA3AF]">NGOs awaiting verification</p>
          </div>
          <Link to="/admin/pending" className="text-[13px] font-semibold text-[#2D6A4F] hover:underline no-underline">
            View all →
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-[14px] text-[#9CA3AF]">No pending approvals</p>
          </div>
        ) : (
          <Table headers={["Name", "Email", "Role", "City", "Actions"]}>
            {pending.slice(0, 5).map((u, i) => (
              <Tr key={u._id} even={i % 2 === 1}>
                <Td><span className="font-semibold text-[#111827]">{u.name}</span></Td>
                <Td>{u.email}</Td>
                <Td><Badge status={u.role} /></Td>
                <Td>{u.location?.city || u.city || "—"}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(u._id)}
                      className="px-3 py-1.5 bg-[#2D6A4F] text-white text-[12px] font-semibold rounded-lg hover:bg-[#245a42] transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(u._id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-[12px] font-semibold rounded-lg hover:bg-red-100 transition-colors"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </div>

      {/* ── Recent donations ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#111827]">🍱 Recent Donations</h2>
            <p className="text-[12px] text-[#9CA3AF]">Latest food rescue activity</p>
          </div>
          <Link to="/admin/donations" className="text-[13px] font-semibold text-[#2D6A4F] hover:underline no-underline">
            View all →
          </Link>
        </div>

        <Table
          headers={["Donor", "Type", "Quantity", "Status", "Priority", "Date"]}
          empty={donations.length === 0 ? <Empty message="No donations yet" /> : null}
        >
          {donations.map((d, i) => (
            <Tr key={d._id} even={i % 2 === 1}>
              <Td><span className="font-semibold text-[#111827]">{d.donor?.name || "—"}</span></Td>
              <Td className="capitalize">{d.foodType || d.type || "—"}</Td>
              <Td>{d.quantity || "—"}</Td>
              <Td><Badge status={d.status} /></Td>
              <Td><Badge status={d.priority} /></Td>
              <Td className="text-[#9CA3AF]">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</Td>
            </Tr>
          ))}
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
