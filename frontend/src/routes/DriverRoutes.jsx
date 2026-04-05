
import { Route }        from "react-router-dom";
import DriverLogin      from "../pages/driver/DriverLogin";
import DriverDashboard  from "../pages/driver/DriverDashboard";
import NgoDrivers       from "../pages/ngo/NgoDrivers";

const DriverRoutes = [
  <Route key="driver-login" path="/driver/login"     element={<DriverLogin />}     />,
  <Route key="driver-dash"  path="/driver/dashboard" element={<DriverDashboard />} />,
  <Route key="ngo-drivers"  path="/ngo/drivers"      element={<NgoDrivers />}      />,
];

export default DriverRoutes;
