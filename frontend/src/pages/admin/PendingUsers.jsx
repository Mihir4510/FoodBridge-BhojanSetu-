// src/pages/admin/PendingUsers.jsx

import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner, ErrorBanner, Badge, Table, Tr, Td, Empty } from "../../components/admin/AdminUI";
import { getPendingUsers, approveUser, rejectUser } from "../../service/adminapi";

const PendingUsers = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    getPendingUsers()
      .then((r) => setUsers(r.data?.users || r.data || []))
      .catch((e) => setError(e.response?.data?.message || "Failed to load pending users."))
      .finally(() => setLoading(false));
  }, []);

  const act = async (id, type) => {
    setActionId(id);
    try {
      type === "approve" ? await approveUser(id) : await rejectUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch { alert(`Failed to ${type} user.`); }
    finally { setActionId(null); }
  };

  if (loading) return <AdminLayout title="Pending Users"><Spinner /></AdminLayout>;

  return (
    <AdminLayout title="Pending Users" subtitle="Review and approve NGO registrations.">
      {error && <ErrorBanner message={error} />}

      <div className="mb-5 flex items-center gap-3">
        <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[13px] font-semibold px-4 py-2 rounded-full">
          ⏳ {users.length} awaiting approval
        </div>
      </div>

      <Table
        headers={["Name", "Email", "Role", "Phone", "City", "Reg. No", "Actions"]}
        empty={users.length === 0 ? <Empty message="All caught up! No pending users." /> : null}
      >
        {users.map((u, i) => (
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
            <Td>{u.phone || "—"}</Td>
            <Td>{u.location?.city || u.city || "—"}</Td>
            <Td>{u.registrationNo || u.ngoRegistrationNumber || "—"}</Td>
            <Td>
              <div className="flex gap-2">
                <button
                  onClick={() => act(u._id, "approve")}
                  disabled={actionId === u._id}
                  className="px-3.5 py-1.5 bg-[#2D6A4F] text-white text-[12px] font-semibold rounded-lg hover:bg-[#245a42] disabled:opacity-50 transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => act(u._id, "reject")}
                  disabled={actionId === u._id}
                  className="px-3.5 py-1.5 bg-white border border-red-300 text-red-600 text-[12px] font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  ✕ Reject
                </button>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>
    </AdminLayout>
  );
};

export default PendingUsers;
