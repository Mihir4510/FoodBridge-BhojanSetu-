// src/pages/admin/AllDonations.jsx

import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner, ErrorBanner, Badge, Table, Tr, Td, Empty } from "../../components/admin/AdminUI";
import { getAllDonations } from "../../service/adminapi";

const STATUSES   = ["all", "pending", "accepted", "collected", "expired"];
const PRIORITIES = ["all", "high", "medium", "low"];

const AllDonations = () => {
  const [donations, setDonations] = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState("all");
  const [priority, setPriority]   = useState("all");

  useEffect(() => {
    getAllDonations()
      .then((r) => {
        const data = r.data?.donations || r.data || [];
        setDonations(data);
        setFiltered(data);
      })
      .catch((e) => setError(e.response?.data?.message || "Failed to load donations."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = [...donations];
    if (status !== "all")   data = data.filter((d) => d.status === status);
    if (priority !== "all") data = data.filter((d) => d.priority === priority);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((d) =>
        d.donor?.name?.toLowerCase().includes(q) ||
        d.organization?.name?.toLowerCase().includes(q) ||
        d.foodType?.toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [search, status, priority, donations]);

  if (loading) return <AdminLayout title="Donations"><Spinner /></AdminLayout>;

  return (
    <AdminLayout title="All Donations" subtitle={`${donations.length} total donation records.`}>
      {error && <ErrorBanner message={error} />}

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative max-w-sm">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[14px]">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor, NGO, food type..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] bg-white outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-[12px] text-[#9CA3AF] self-center mr-1">Status:</span>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all ${
                status === s
                  ? "bg-[#2D6A4F] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
          <span className="text-[12px] text-[#9CA3AF] self-center ml-3 mr-1">Priority:</span>
          {PRIORITIES.map((p) => (
            <button key={p} onClick={() => setPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all ${
                priority === p
                  ? "bg-[#E76F1A] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#E76F1A] hover:text-[#E76F1A]"
              }`}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      <Table
        headers={["Donor", "Organization", "Food Type", "Quantity", "Status", "Priority", "Date"]}
        empty={filtered.length === 0 ? <Empty message="No donations match your filters" /> : null}
      >
        {filtered.map((d, i) => (
          <Tr key={d._id} even={i % 2 === 1}>
            <Td><span className="font-semibold text-[#111827]">{d.donor?.name || "—"}</span></Td>
            <Td>{d.organization?.name || d.assignedOrg?.name || "Unassigned"}</Td>
            <Td className="capitalize">{d.foodType || d.type || "—"}</Td>
            <Td>{d.quantity ? `${d.quantity} kg` : "—"}</Td>
            <Td><Badge status={d.status} /></Td>
            <Td><Badge status={d.priority || "low"} /></Td>
            <Td className="text-[#9CA3AF]">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</Td>
          </Tr>
        ))}
      </Table>
    </AdminLayout>
  );
};

export default AllDonations;
