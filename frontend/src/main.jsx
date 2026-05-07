import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./shared/styles/responsive.css";
import { applyTheme, getTheme } from "./shared/utils/theme";

applyTheme(getTheme()); // 👈 prevents flicker

// 🚀 Backend warm-up: fires immediately on app start to wake Render server
// This runs in the background and does not block rendering.
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "https://neuronest-backend-2rn0.onrender.com";
fetch(`${BACKEND_URL}/`, { method: "GET", cache: "no-store" }).catch(() => {});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
