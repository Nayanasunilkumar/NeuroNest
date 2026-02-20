import axios from "axios";
import { API_BASE_URL } from "../config/env";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("neuronest_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Keep session until explicit logout or inactivity manager decides.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default api;
