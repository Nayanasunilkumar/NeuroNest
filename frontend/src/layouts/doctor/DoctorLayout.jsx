import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import DoctorNavbar from "./DoctorNavbar";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/doctor.css";

const DoctorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isDark: darkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const isChatRoute = location.pathname === '/doctor/chat';

  return (
    <div className={`doctor-layout ${darkMode ? 'dark' : ''}`}>
      <DoctorSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className="doctor-main">
        <DoctorNavbar 
          collapsed={collapsed} 
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
        <div className={`doctor-content ${isChatRoute ? 'no-padding' : ''}`}>
           <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
