

import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

// ── Donor / Restaurant APIs ───────────────────────────────
export const createDonation  = (data) => API.post("/donation/create", data);
export const getMyDonations  = ()     => API.get("/donation/my-donations");

// ── Auth ──────────────────────────────────────────────────
export const logoutUser      = ()     => API.post("/auth/logout");

export default API;