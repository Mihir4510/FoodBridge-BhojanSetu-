import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/auth",
   withCredentials: true, 
});

export const registerUser = (data) => {
  return API.post("/register", data);
};

export const loginUser = (data) => {
  return API.post("/login", data);
};

export const getMe = () => API.get("/me");

export const logoutUser = ()=> API.post("/logout")