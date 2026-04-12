// src/routes/DriverRoutes.jsx

import { Routes, Route } from "react-router-dom";

import DriverLogin      from "../pages/driver/DriverLogin";
import DriverDashboard  from "../pages/driver/DriverDashboard";
import DriverApply      from "../pages/driver/DriverApply";
import DriverStatus     from "../pages/driver/DriverStatus";

const DriverRoutes = () => {
  return (
    <Routes>
      {/* ── Public driver pages ───────────────────────── */}
      <Route path="login" element={<DriverLogin />} />
      <Route path="apply" element={<DriverApply />} />
      <Route path="status" element={<DriverStatus />} />

      {/* ── Protected driver page ─────────────────────── */}
      <Route path="dashboard" element={<DriverDashboard />} />
    </Routes>
  );
};

export default DriverRoutes;