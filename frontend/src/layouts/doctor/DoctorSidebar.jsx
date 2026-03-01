import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, AlignLeft, X } from 'lucide-react';
import { logout } from '../../utils/auth';
import { useModuleConfig } from '../../hooks/useModuleConfig';
import { getModulePathForRole, getModulesForRole } from '../../modules/moduleRegistry';

const DoctorSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, darkMode }) => {
  const { enabledMap } = useModuleConfig();
  const menuItems = getModulesForRole('doctor', { enabledMap, sidebarOnly: true });

  const sidebarWidth = collapsed ? '80px' : '260px';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" 
          onClick={() => setMobileOpen(false)}
          style={{ zIndex: 1040 }}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`d-flex flex-column h-100 shadow-sm ${darkMode ? 'bg-dark border-secondary' : 'bg-white border-end'} ${mobileOpen ? 'position-fixed start-0 top-0 bottom-0' : 'd-none d-md-flex'}`}
        style={{ 
          width: sidebarWidth, 
          minWidth: sidebarWidth, 
          transition: 'width 0.3s ease',
          zIndex: 1050,
          transform: mobileOpen ? 'translateX(0)' : 'none'
        }}
      >
        {/* Header */}
        <div className={`d-flex align-items-center py-4 ${collapsed ? 'justify-content-center' : 'justify-content-between px-4'} border-bottom ${darkMode ? 'border-secondary' : ''}`} style={{ height: '80px' }}>
          <button
            className="btn btn-link text-decoration-none p-0 d-none d-md-flex align-items-center text-secondary"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <AlignLeft size={22} strokeWidth={2.5} />
          </button>

          <button
            className="btn btn-link text-decoration-none p-0 d-flex d-md-none align-items-center text-secondary"
            onClick={() => setMobileOpen(false)}
            title="Close menu"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          {!collapsed && (
            <span className={`ms-3 fw-bold text-truncate ${darkMode ? 'text-white' : 'text-dark'}`} style={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
              Doctor's Panel
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-grow-1 overflow-auto d-flex flex-column p-3 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={getModulePathForRole(item, 'doctor')}
                className={({ isActive }) => 
                  `d-flex align-items-center rounded-3 py-2 ${collapsed ? 'justify-content-center px-0' : 'px-3 gap-3'} text-decoration-none fw-medium transition-all ` + 
                  (isActive 
                    ? `bg-primary bg-opacity-10 text-primary fw-bold` 
                    : `${darkMode ? 'text-light' : 'text-secondary'} hover-bg-light`)
                }
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="text-truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-3 border-top ${darkMode ? 'border-secondary' : ''} mt-auto`}>
          <div
            className={`d-flex align-items-center rounded-3 py-2 ${collapsed ? 'justify-content-center px-0' : 'px-3 gap-3'} text-danger text-decoration-none fw-medium transition-all`}
            onClick={logout}
            style={{ cursor: 'pointer' }}
            title="Logout"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorSidebar;
