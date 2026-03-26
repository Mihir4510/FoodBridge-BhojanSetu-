// // src/pages/admin/Analytics.jsx
// // Requirements: npm install chart.js react-chartjs-2

// import { useEffect, useState } from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale, LinearScale, BarElement, LineElement,
//   PointElement, ArcElement, Title, Tooltip, Legend, Filler,
// } from "chart.js";
// import { Bar, Line, Doughnut } from "react-chartjs-2";
// import AdminLayout from "../../components/admin/AdminLayout";
// import { StatCard, Spinner, ErrorBanner, Table, Tr, Td, Empty } from "../../components/admin/AdminUI";
// import {
//   getSummary,
//   getDonationsOverTime,
//   getTopDonors,
//   getPriorityAnalytics,
// } from "../../service/adminapi";

// ChartJS.register(
//   CategoryScale, LinearScale, BarElement, LineElement,
//   PointElement, ArcElement, Title, Tooltip, Legend, Filler
// );

// // ── Chart card wrapper ────────────────────────────────────
// const ChartCard = ({ title, subtitle, children }) => (
//   <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
//     <div className="mb-4">
//       <h3 className="text-[15px] font-bold text-[#111827]">{title}</h3>
//       {subtitle && <p className="text-[12px] text-[#9CA3AF] mt-0.5">{subtitle}</p>}
//     </div>
//     {children}
//   </div>
// );

// // ── Shared chart options ──────────────────────────────────
// const baseOpts = {
//   responsive: true,
//   plugins: {
//     legend: { display: false },
//     tooltip: { backgroundColor: "#1A1A2E", padding: 10, cornerRadius: 8 },
//   },
//   scales: {
//     x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#9CA3AF" } },
//     y: { grid: { color: "#F3F4F6" }, ticks: { font: { size: 11 }, color: "#9CA3AF" }, beginAtZero: true },
//   },
// };

// // ── Analytics Page ────────────────────────────────────────
// const Analytics = () => {
//   const [summary,  setSummary]  = useState(null);
//   const [trends,   setTrends]   = useState([]);
//   const [donors,   setDonors]   = useState([]);
//   const [priority, setPriority] = useState([]);
//   const [loading,  setLoading]  = useState(true);
//   const [error,    setError]    = useState("");

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [sRes, tRes, dRes, pRes] = await Promise.all([
//           getSummary(),
//           getDonationsOverTime(),
//           getTopDonors(),
//           getPriorityAnalytics(),
//         ]);
//         setSummary(sRes.data);
//         setTrends(tRes.data?.trends || tRes.data || []);
//         setDonors(dRes.data?.donors || dRes.data || []);
//         setPriority(pRes.data?.priority || pRes.data || []);
//       } catch (e) {
//         setError(e.response?.data?.message || "Failed to load analytics.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   if (loading) return <AdminLayout title="Analytics"><Spinner /></AdminLayout>;

//   // ── Chart data builders ───────────────────────────────
//   const trendsData = {
//     labels: trends.map((t) => `Day ${t._id || t.day || t.date}`),
//     datasets: [{
//       label: "Donations",
//       data: trends.map((t) => t.total || t.count || 0),
//       borderColor: "#2D6A4F",
//       backgroundColor: "rgba(45,106,79,0.08)",
//       borderWidth: 2.5,
//       pointBackgroundColor: "#2D6A4F",
//       pointRadius: 4,
//       tension: 0.4,
//       fill: true,
//     }],
//   };

//   const priorityMap = {};
//   priority.forEach((p) => { priorityMap[p._id || p.priority] = p.total || p.count || 0; });
//   const priorityData = {
//     labels: ["High", "Medium", "Low"],
//     datasets: [{
//       data: [priorityMap["high"] || 0, priorityMap["medium"] || 0, priorityMap["low"] || 0],
//       backgroundColor: ["#FCA5A5", "#FCD34D", "#86EFAC"],
//       borderColor:     ["#EF4444",  "#F59E0B",  "#22C55E"],
//       borderWidth: 1.5,
//     }],
//   };

//   const roleData = summary?.usersByRole || [];
//   const roleChartData = {
//     labels: roleData.map((r) => r._id || r.role),
//     datasets: [{
//       data: roleData.map((r) => r.total || r.count || 0),
//       backgroundColor: ["#86EFAC", "#FCA5A5", "#93C5FD"],
//       borderColor:     ["#22C55E",  "#EF4444",  "#3B82F6"],
//       borderWidth: 1.5,
//     }],
//   };

//   const doughnutOpts = {
//     plugins: {
//       legend: { display: true, position: "bottom", labels: { font: { size: 11 }, padding: 12 } },
//     },
//     cutout: "65%",
//   };

//   return (
//     <AdminLayout title="Analytics" subtitle="Platform-wide statistics and donation trends.">
//       {error && <ErrorBanner message={error} />}

//       {/* ── Summary stat cards ── */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//         <StatCard icon="👥" label="Total Users"     value={summary?.totalUsers     ?? "—"} color="green"  />
//         <StatCard icon="🍱" label="Total Donations" value={summary?.totalDonations ?? "—"} color="blue"   />
//         <StatCard icon="⏱️" label="Avg Collection"  value={summary?.avgCollectionTime ? `${Math.round(summary.avgCollectionTime)}h` : "—"} color="orange" />
//         <StatCard icon="✅" label="Collection Rate" value={summary?.collectionRate  ? `${Math.round(summary.collectionRate)}%` : "—"} color="green" />
//       </div>

//       {/* ── Charts row 1 ── */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//         <div className="lg:col-span-2">
//           <ChartCard title="📈 Donations Over Time" subtitle="Daily donation volume trend">
//             {trends.length > 0
//               ? <Line data={trendsData} options={baseOpts} height={100} />
//               : <div className="flex items-center justify-center h-32 text-[13px] text-[#9CA3AF]">No trend data yet</div>
//             }
//           </ChartCard>
//         </div>
//         <ChartCard title="🔴 Priority Breakdown" subtitle="High / Medium / Low donations">
//           <div className="flex items-center justify-center py-2">
//             <div className="w-[180px] h-[180px]">
//               <Doughnut data={priorityData} options={doughnutOpts} />
//             </div>
//           </div>
//         </ChartCard>
//       </div>

//       {/* ── Charts row 2 ── */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//         <ChartCard title="👥 Users by Role" subtitle="Platform role distribution">
//           <div className="flex items-center justify-center py-2">
//             <div className="w-[180px] h-[180px]">
//               <Doughnut data={roleChartData} options={doughnutOpts} />
//             </div>
//           </div>
//         </ChartCard>
//         <div className="lg:col-span-2">
//           <ChartCard title="🍱 Donations by Type" subtitle="Food type breakdown">
//             {summary?.donationsByType?.length > 0
//               ? <Bar
//                   data={{
//                     labels: summary.donationsByType.map((d) => d._id || d.type || "Unknown"),
//                     datasets: [{
//                       label: "Donations",
//                       data: summary.donationsByType.map((d) => d.total || d.count || 0),
//                       backgroundColor: "#D8F3DC",
//                       borderColor: "#2D6A4F",
//                       borderWidth: 2,
//                       borderRadius: 8,
//                     }],
//                   }}
//                   options={baseOpts}
//                   height={100}
//                 />
//               : <div className="flex items-center justify-center h-32 text-[13px] text-[#9CA3AF]">No data available</div>
//             }
//           </ChartCard>
//         </div>
//       </div>

//       {/* ── Top donors table ── */}
//       <ChartCard title="🏆 Top Donors & Organizations" subtitle="Highest contributors by donation volume">
//         <Table
//           headers={["Rank", "Name", "Role", "Donations", "Total Quantity"]}
//           empty={donors.length === 0 ? <Empty message="No donor data available" /> : null}
//         >
//           {donors.map((d, i) => (
//             <Tr key={d._id || i} even={i % 2 === 1}>
//               <Td>
//                 <span className={`font-bold text-[15px] ${
//                   i === 0 ? "text-[#F59E0B]" : i === 1 ? "text-[#9CA3AF]" : i === 2 ? "text-[#CD7F32]" : "text-[#374151]"
//                 }`}>
//                   {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
//                 </span>
//               </Td>
//               <Td><span className="font-semibold text-[#111827]">{d.name || d._id || "—"}</span></Td>
//               <Td className="capitalize text-[#6B7280]">{d.role || "donor"}</Td>
//               <Td><span className="font-semibold text-[#2D6A4F]">{d.totalDonations || d.count || 0}</span></Td>
//               <Td>{d.totalQuantity ? `${d.totalQuantity} kg` : "—"}</Td>
//             </Tr>
//           ))}
//         </Table>
//       </ChartCard>
//     </AdminLayout>
//   );
// };

// export default Analytics;
// src/pages/admin/Analytics.jsx

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import AdminLayout from "../../components/admin/AdminLayout";
import { StatCard, Spinner, ErrorBanner, Table, Tr, Td, Empty } from "../../components/admin/AdminUI";
import {
  getSummary,
  getDonationsOverTime,
  getTopDonors,
  getPriorityAnalytics,
} from "../../service/adminapi";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
    <div className="mb-4">
      <h3 className="text-[15px] font-bold text-[#111827]">{title}</h3>
      {subtitle && <p className="text-[12px] text-[#9CA3AF] mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const baseOpts = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: "#1A1A2E", padding: 10, cornerRadius: 8 },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#9CA3AF" } },
    y: { grid: { color: "#F3F4F6" }, ticks: { font: { size: 11 }, color: "#9CA3AF" }, beginAtZero: true },
  },
};

const Analytics = () => {
  const [summary,  setSummary]  = useState(null);
  const [trends,   setTrends]   = useState([]);
  const [donors,   setDonors]   = useState([]);
  const [priority, setPriority] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, tRes, dRes, pRes] = await Promise.all([
          getSummary(),
          getDonationsOverTime(),
          getTopDonors(),
          getPriorityAnalytics(),
        ]);

        console.log("SUMMARY:", sRes.data);
        console.log("TRENDS:", tRes.data);
        console.log("DONORS:", dRes.data);
        console.log("PRIORITY:", pRes.data);

        // ✅ FIXED
        setSummary(sRes.data.summary || sRes.data);
        setTrends(Array.isArray(tRes.data?.trends) ? tRes.data.trends : []);
        setDonors(Array.isArray(dRes.data?.donors) ? dRes.data.donors : []);
        setPriority(Array.isArray(pRes.data?.priority) ? pRes.data.priority : []);
        // setPriority(Array.isArray(pRes.data) ? pRes.data : []);

      } catch (e) {
        setError(e.response?.data?.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <AdminLayout title="Analytics"><Spinner /></AdminLayout>;

  // ✅ FIXED LABELS
  const trendsData = {
    labels: trends.map((t) => t.date || t._id || ""),
    datasets: [{
      label: "Donations",
      data: trends.map((t) => t.total || t.count || 0),
      borderColor: "#2D6A4F",
      backgroundColor: "rgba(45,106,79,0.08)",
      borderWidth: 2.5,
      pointBackgroundColor: "#2D6A4F",
      pointRadius: 4,
      tension: 0.4,
      fill: true,
    }],
  };

  const priorityMap = {};
  priority.forEach((p) => {
    priorityMap[p._id || p.priority] = p.total || p.count || 0;
  });

  const priorityData = {
    labels: ["high", "medium", "low"],
    datasets: [{
      data: [
        priorityMap["high"] || 0,
        priorityMap["medium"] || 0,
        priorityMap["low"] || 0
      ],
      backgroundColor: ["#FCA5A5", "#FCD34D", "#86EFAC"],
      borderColor: ["#EF4444", "#F59E0B", "#22C55E"],
      borderWidth: 1.5,
    }],
  };


  // ✅ SAFE ROLE DATA
  const roleData = Array.isArray(summary?.usersByRole) ? summary.usersByRole : [];

  const roleChartData = {
    labels: roleData.map((r) => r._id || r.role),
    datasets: [{
      data: roleData.map((r) => r.total || r.count || 0),
      backgroundColor: ["#86EFAC", "#FCA5A5", "#93C5FD"],
      borderColor: ["#22C55E", "#EF4444", "#3B82F6"],
      borderWidth: 1.5,
    }],
  };

  const doughnutOpts = {
    plugins: {
      legend: { display: true, position: "bottom", labels: { font: { size: 11 }, padding: 12 } },
    },
    cutout: "65%",
  };

  return (
    <AdminLayout title="Analytics" subtitle="Platform-wide statistics and donation trends.">
      {error && <ErrorBanner message={error} />}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon="👥" label="Total Users" value={summary?.totalUsers ?? "—"} color="green" />
        <StatCard icon="🍱" label="Total Donations" value={summary?.totalDonations ?? "—"} color="blue" />
        <StatCard icon="⏱️" label="Avg Collection" value={summary?.avgCollectionTime ? `${Math.round(summary.avgCollectionTime)}h` : "—"} color="orange" />
        <StatCard icon="✅" label="Collection Rate" value={summary?.collectionRate ? `${Math.round(summary.collectionRate)}%` : "—"} color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ChartCard title="📈 Donations Over Time">
            {trends.length > 0
              ? <Line data={trendsData} options={baseOpts} height={100} />
              : <div className="h-32 flex items-center justify-center text-gray-400">No data</div>}
          </ChartCard>
        </div>

        <ChartCard title="🔴 Priority Breakdown">
          <Doughnut data={priorityData} options={doughnutOpts} />
        </ChartCard>
      </div>

      {/* Donors Table */}
      <ChartCard title="🏆 Top Donors">
        <Table headers={["Rank", "Name", "Donations"]}>
          {donors.length === 0 ? (
            <Empty message="No donor data" />
          ) : donors.map((d, i) => (
            <Tr key={i}>
              <Td>{i + 1}</Td>
              <Td>{d.name || d._id}</Td>
              <Td>{d.totalDonations || d.count || 0}</Td>
            </Tr>
          ))}
        </Table>
      </ChartCard>

    </AdminLayout>
  );
};

export default Analytics;