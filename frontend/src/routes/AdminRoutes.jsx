import { Route } from "react-router-dom";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PendingUsers   from "../pages/admin/PendingUsers";
import AllUsers       from "../pages/admin/AllUsers";
import AllDonations   from "../pages/admin/AllDonations";
import Analytics      from "../pages/admin/Analytics";

const AdminRoutes = [
  <Route key="admin-dash"      path="/admin/dashboard"  element={<AdminDashboard />} />,
  <Route key="admin-pending"   path="/admin/pending"    element={<PendingUsers />}   />,
  <Route key="admin-users"     path="/admin/users"      element={<AllUsers />}       />,
  <Route key="admin-donations" path="/admin/donations"  element={<AllDonations />}   />,
  <Route key="admin-analytics" path="/admin/analytics"  element={<Analytics />}      />,
];

export default AdminRoutes;