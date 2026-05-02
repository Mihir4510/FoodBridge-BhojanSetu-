import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

// // ── Organization (NGO) APIs ───────────────────────────────
export const getAllRequests   = ()     => API.get("/donation/requests");
export const acceptDonation  = (id)   => API.put(`/donation/accept/${id}`);
export const collectDonation = (id)   => API.put(`/donation/collect/${id}`);

export default API;