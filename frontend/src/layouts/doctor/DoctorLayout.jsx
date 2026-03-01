import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import DoctorNavbar from "./DoctorNavbar";
import { useTheme } from "../../context/ThemeContext";

const DoctorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark: darkMode, toggleTheme } = useTheme();
  const location = useLocation();

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <div className={`d-flex vh-100 vw-100 overflow-hidden ${darkMode ? 'bg-dark text-light' : 'bg-light'}`}>
      <DoctorSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        darkMode={darkMode}
      />

      <div className="d-flex flex-column flex-grow-1 h-100 position-relative" style={{ minWidth: 0 }}>
        <DoctorNavbar
          collapsed={collapsed}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          onMobileMenuClick={() => setMobileOpen(true)}
        />
        <div className="flex-grow-1 overflow-auto p-3 p-md-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
