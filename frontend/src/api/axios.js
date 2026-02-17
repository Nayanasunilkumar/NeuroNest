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

// ✅ Optional: Handle 401 globally (auto logout if token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("neuronest_token");
      localStorage.removeItem("neuronest_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
