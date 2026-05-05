import axios from "axios";
import { API_BASE_URL } from "../../../config/env";

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const registerUser = (data) => API.post("/api/auth/register", data);

export const loginUser = (data) => API.post("/api/auth/login", data);
export const forgotPassword = (data) => API.post("/api/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/api/auth/reset-password", data);
