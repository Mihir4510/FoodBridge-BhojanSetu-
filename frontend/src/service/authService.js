import axios from "axios";

console.log("API URL:", import.meta.env.VITE_API_URL); 
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/auth`,
  withCredentials: true,
   timeout: 15000,
});

export const registerUser = (data) => {
  return API.post("/register", data);
};

export const loginUser = (data) => {
  return API.post("/login", data);
};

export const getMe = () => API.get("/me");

export const logoutUser = ()=> API.post("/logout")