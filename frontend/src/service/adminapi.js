import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/admin",
  withCredentials: true, // include JWT cookie
});

// ── User APIs ─────────────────────────────────────────────
export const getPendingUsers = () => API.get("/pending-users");
export const getAllUsers = () => API.get("/users");
export const approveUser = (userId) => API.put(`/approve-user/${userId}`);
export const rejectUser = (userId) => API.put(`/reject-user/${userId}`);

// ── Donation APIs ────────────────────────────────────────
export const getAllDonations = () => API.get("/donations");

// ── Dashboard Stats ─────────────────────────────────────
export const getDashboardStats = () => API.get("/dashboard-stats");

// ── Analytics APIs ──────────────────────────────────────
export const getSummary = () => API.get("/analytics/summary");
export const getDonationsOverTime = () => API.get("/analytics/trends");
export const getTopDonors = () => API.get("/analytics/top-donors");
export const getPriorityAnalytics = () => API.get("/analytics/urgent-donations");

// ── New Analytics APIs ───────────────────────────────────
export const getLocationAnalytics = () => API.get("/analytics/locations");
export const getAvgCollectionTime = () => API.get("/analytics/avg-collection-time");