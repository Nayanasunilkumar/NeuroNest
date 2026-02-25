import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { logout } from "../utils/auth";
import "../styles/dashboard.css";

const PatientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>

            <div className="logo-group">
              <div className="dashboard-logo">NeuroNest</div>
              <div className="dashboard-role">Patient Panel</div>
            </div>
          </div>

          <div className="dashboard-header-right">
            <button
              className="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "" : ""}
            </button>

            <button
              className="logout-btn"
              onClick={logout}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        role="patient"
        title="NeuroNest Patient"
      />

      {/* PAGE CONTENT */}
      <main
        className={`dashboard-main ${!sidebarOpen ? 'sidebar-rail-offset' : ''} ${location.pathname === '/patient/messages' ? 'full-screen-chat' : ''}`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;
