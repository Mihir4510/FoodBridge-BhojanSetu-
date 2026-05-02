import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/driver`,
  withCredentials: true,
});

// ── Driver Auth ───────────────────────────────────────────
export const loginDriver = (data) => API.post("/login", data);

// ── Driver Actions ────────────────────────────────────────
export const getDriverDonations = () => API.get("/my-donations");
export const pickupDonation = (id) => API.put(`/pickup/${id}`);
export const completeDonation = (id) => API.put(`/complete/${id}`);
export const getOptimizedRoute = () => API.get("/route");
export const updateDriverLocation = (lat, lng) => API.put("/location", { lat, lng });

// ── NGO Managing Drivers ──────────────────────────────────
export const getAllDrivers = ()=> API.get("/all");
export const registerDriver= (data) => API.post("/register", data);

export default API;
