import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./shared/styles/responsive.css";
import { applyTheme, getTheme } from "./shared/utils/theme";

applyTheme(getTheme()); // 👈 prevents flicker

const getLoadedEntryScript = () => {
  const scripts = [...document.querySelectorAll('script[type="module"][src*="/assets/index-"]')];
  return scripts.at(-1)?.getAttribute("src") || "";
};

const CURRENT_ENTRY_SCRIPT = getLoadedEntryScript();

const checkForNewBuild = async () => {
  if (!CURRENT_ENTRY_SCRIPT || document.visibilityState === "hidden") return;

  try {
    const response = await fetch(`/?_build_check=${Date.now()}`, { cache: "no-store" });
    const html = await response.text();
    const match = html.match(/<script[^>]+type="module"[^>]+src="([^"]*\/assets\/index-[^"]+\.js)"/i);
    const latestEntryScript = match?.[1];
    const reloadKey = `neuronest-reloaded-${latestEntryScript}`;

    if (latestEntryScript && latestEntryScript !== CURRENT_ENTRY_SCRIPT && sessionStorage.getItem(reloadKey) !== "1") {
      sessionStorage.setItem(reloadKey, "1");
      window.location.reload();
    }
  } catch {
    // Build checks should never interrupt the app.
  }
};

window.addEventListener("focus", checkForNewBuild);
document.addEventListener("visibilitychange", checkForNewBuild);
setTimeout(checkForNewBuild, 5000);

// 🚀 Backend warm-up: fires immediately on app start to wake Render server
// This runs in the background and does not block rendering.
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "https://neuronest-backend-2rn0.onrender.com";
fetch(`${BACKEND_URL}/`, { method: "GET", cache: "no-store" }).catch(() => {});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
