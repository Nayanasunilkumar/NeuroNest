import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import DoctorNavbar from "./DoctorNavbar";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/doctor.css";
import "../../styles/responsive.css";

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

  const isChatRoute = location.pathname === '/doctor/chat';

  return (
    <div className={`doctor-layout ${darkMode ? 'dark' : ''}`}>
      {/* Mobile backdrop overlay */}
      <div
        className={`sidebar-mobile-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <DoctorSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="doctor-main">
        <DoctorNavbar
          collapsed={collapsed}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          onMobileMenuClick={() => setMobileOpen(true)}
        />
        <div className={`doctor-content ${isChatRoute ? 'no-padding' : ''}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
