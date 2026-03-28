import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// // ── Organization (NGO) APIs ───────────────────────────────
export const getAllRequests   = ()     => API.get("/donation/requests");
export const acceptDonation  = (id)   => API.put(`/donation/accept/${id}`);
export const collectDonation = (id)   => API.put(`/donation/collect/${id}`);

export default API;