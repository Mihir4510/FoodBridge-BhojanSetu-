import { Routes, Route } from "react-router-dom";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PendingUsers from "../pages/admin/PendingUsers";
import AllUsers from "../pages/admin/AllUsers";
import AllDonations from "../pages/admin/AllDonations";
import Analytics from "../pages/admin/Analytics";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="pending" element={<PendingUsers />} />
      <Route path="users" element={<AllUsers />} />
      <Route path="donations" element={<AllDonations />} />
      <Route path="analytics" element={<Analytics />} />
    </Routes>
  );
};

export default AdminRoutes;