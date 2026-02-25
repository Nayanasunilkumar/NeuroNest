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

      {!isOpen && (role === "patient" || role === "admin") && (
        <div className="sidebar-quick-rail" aria-label="Quick navigation">
          <div className="quick-rail-links">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={`quick-${item.key}`}
                  to={getModulePathForRole(item, role)}
                  className={({ isActive }) =>
                    isActive ? "quick-rail-link active" : "quick-rail-link"
                  }
                  title={item.label}
                >
                  <Icon size={19} />
                </NavLink>
              );
            })}
          </div>

          <div className="quick-rail-footer">
            <button
              type="button"
              className="quick-rail-link quick-rail-logout"
              onClick={logout}
              title="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
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
      )}
    </>
  );
};

export default Sidebar;
