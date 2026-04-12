import { Routes, Route } from "react-router-dom";

import NgoDashboard     from "../pages/ngo/NgoDashboard";
import NgoAccepted      from "../pages/ngo/NgoAccepted";
import NgoNotifications from "../pages/ngo/NgoNotifications";
import NgoMap           from "../pages/ngo/NgoMap";
import NgoProfile       from "../pages/ngo/NgoProfile";
import NgoDonations from "../pages/ngo/NgoDonations";
import NgoDrivers from "../pages/ngo/NgoDrivers";
import NgoApplications from "../pages/ngo/NgoApplications";

const NgoRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<NgoDashboard />} />
      <Route path="donations" element={<NgoDonations />} />
      <Route path="accepted" element={<NgoAccepted />} />
      <Route path="notifications" element={<NgoNotifications />} />
      <Route path="map" element={<NgoMap />} />
      <Route path="profile" element={<NgoProfile />} />
       <Route path="drivers" element={<NgoDrivers />} />
        <Route path="applications" element={<NgoApplications />} />
    
    </Routes>
  );
};

export default NgoRoutes;