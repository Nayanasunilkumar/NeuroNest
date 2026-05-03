import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import DoctorNavbar from "./DoctorNavbar";
import { useTheme } from "../../shared/context/ThemeContext";

import Sidebar from "../../shared/components/Sidebar";
import DynamicIslandNav from "../../shared/components/DynamicIslandNav";
import "../../shared/styles/doctor-dark-overrides.css";

const DoctorLayout = () => {
  const { isDark: darkMode, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="doctor-layout-root vh-100 d-flex flex-column overflow-hidden" style={{ transition: 'all 0.3s' }}>
      <DoctorNavbar
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <div className="d-lg-none position-fixed bottom-0 start-0 w-100 p-3 mb-2" style={{ zIndex: 1000 }}>
         <DynamicIslandNav role="doctor" />
      </div>

      <div className="d-flex flex-grow-1 overflow-hidden" style={{ position: 'relative' }}>
        <main
          className={`doctor-main-shell flex-grow-1 d-flex flex-column overflow-y-auto p-3 p-md-4 pb-5 pb-lg-4`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
