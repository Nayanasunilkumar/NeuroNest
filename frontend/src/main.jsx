import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./shared/styles/responsive.css";
import { applyTheme, getTheme } from "./shared/utils/theme";

applyTheme(getTheme()); // 👈 prevents flicker

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
