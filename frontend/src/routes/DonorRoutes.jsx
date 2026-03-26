import { Routes, Route } from "react-router-dom";

import DonorDashboard from "../pages/donor/DonorDashboard";
import CreateDonation from "../pages/donor/CreateDonation";
import MyDonations from "../pages/donor/MyDonations";
import DonorNotifications from "../pages/donor/DonorNotifications";

const DonorRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<DonorDashboard />} />
      <Route path="create-donation" element={<CreateDonation />} />
      <Route path="my-donations" element={<MyDonations />} />
      <Route path="notifications" element={<DonorNotifications />} />
    </Routes>
  );
};

export default DonorRoutes;