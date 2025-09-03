
import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const url = config.url ?? "";
  const isAuthRoute = url.includes("/authen") || url.includes("/register");

  config.headers = config.headers ?? {};
  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
