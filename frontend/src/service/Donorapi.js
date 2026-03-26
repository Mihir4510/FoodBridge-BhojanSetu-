

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// ── Donor / Restaurant APIs ───────────────────────────────
export const createDonation  = (data) => API.post("/create", data);
export const getMyDonations  = ()     => API.get("/my-donation");

// ── Organization (NGO) APIs ───────────────────────────────
export const getAllRequests   = ()     => API.get("/request");
export const acceptDonation  = (id)   => API.put(`/accept/${id}`);
export const collectDonation = (id)   => API.put(`/collect/${id}`);

// ── Auth ──────────────────────────────────────────────────
export const logoutUser      = ()     => API.post("/auth/logout");

export default API;