import axios from "axios";
import { useAuthStore } from "../store/authStore";


export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  // withCredentials: true, // ถ้า backend ใช้ cookie/session ค่อยเปิด
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
