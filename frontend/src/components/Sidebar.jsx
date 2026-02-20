import React from 'react';
import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";
import { useModuleConfig } from "../hooks/useModuleConfig";
import { getModulePathForRole, getModulesForRole } from "../modules/moduleRegistry";
import { logout } from "../utils/auth";

const Sidebar = ({ isOpen, setIsOpen, role = "patient", title = "NeuroNest Panel" }) => {
  const { enabledMap } = useModuleConfig();
  const menuItems = getModulesForRole(role, { enabledMap, sidebarOnly: true });

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <h3>{title}</h3>

          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M5 7h14M5 12h14M5 17h14" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <div className="sidebar-scroll-container">
          <ul className="sidebar-links">
            {Object.entries(
              menuItems.reduce((acc, item) => {
                const group = item.group || 'General';
                if (!acc[group]) acc[group] = [];
                acc[group].push(item);
                return acc;
              }, {})
            ).map(([groupName, items]) => (
              <React.Fragment key={groupName}>
                {groupName !== 'General' && <li className="sidebar-group-label">{groupName}</li>}
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <NavLink
                        to={getModulePathForRole(item, role)}
                        className={({ isActive }) =>
                          isActive ? "sidebar-link active" : "sidebar-link"
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="sidebar-icon">
                          <Icon size={18} />
                        </span>
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </React.Fragment>
            ))}
          </ul>
        </div>

        {(role === "patient" || role === "admin") && (
          <div className="sidebar-footer">
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
