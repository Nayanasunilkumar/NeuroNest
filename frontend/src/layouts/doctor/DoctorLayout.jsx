import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import DoctorNavbar from "./DoctorNavbar";
import "../../styles/doctor.css";

const DoctorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
     if (darkMode) {
       document.body.classList.add("dark");
     } else {
       document.body.classList.remove("dark");
     }
  }, [darkMode]);

  const isChatRoute = location.pathname === '/doctor/chat';

  return (
    <div className={`doctor-layout ${darkMode ? 'dark' : ''}`}>
      <DoctorSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className="doctor-main">
        <DoctorNavbar 
          collapsed={collapsed} 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <div className={`doctor-content ${isChatRoute ? 'no-padding' : ''}`}>
           <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
