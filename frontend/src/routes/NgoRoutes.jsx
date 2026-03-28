import { Routes, Route } from "react-router-dom";

import NgoDashboard     from "../pages/ngo/NgoDashboard";
import NgoAccepted      from "../pages/ngo/NgoAccepted";
import NgoNotifications from "../pages/ngo/NgoNotifications";
import NgoMap           from "../pages/ngo/NgoMap";
import NgoProfile       from "../pages/ngo/NgoProfile";
import NgoDonations from "../pages/ngo/NgoDonations";

const NgoRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<NgoDashboard />} />
      <Route path="donations" element={<NgoDonations />} />
      <Route path="accepted" element={<NgoAccepted />} />
      <Route path="notifications" element={<NgoNotifications />} />
      <Route path="map" element={<NgoMap />} />
      <Route path="profile" element={<NgoProfile />} />
    </Routes>
  );
};

export default NgoRoutes;