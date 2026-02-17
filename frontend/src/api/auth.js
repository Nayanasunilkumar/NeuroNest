import axios from "axios";
import { API_BASE_URL } from "../config/env";

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const registerUser = (data) => API.post("/auth/register", data);

export const loginUser = (data) => API.post("/auth/login", data);
