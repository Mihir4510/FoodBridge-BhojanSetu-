

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// ── Donor / Restaurant APIs ───────────────────────────────
export const createDonation  = (data) => API.post("/donation/create", data);
export const getMyDonations  = ()     => API.get("/donation/my-donations");

// ── Organization (NGO) APIs ───────────────────────────────
export const getAllRequests   = ()     => API.get("donation/requests");
export const acceptDonation  = (id)   => API.put(`donation/accept/${id}`);
export const collectDonation = (id)   => API.put(`donation/collect/${id}`);

// ── Auth ──────────────────────────────────────────────────
export const logoutUser      = ()     => API.post("/auth/logout");

export default API;