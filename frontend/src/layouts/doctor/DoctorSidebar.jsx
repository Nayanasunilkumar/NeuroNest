import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, AlignLeft, X } from 'lucide-react';
import { logout } from '../../utils/auth';
import { useModuleConfig } from '../../hooks/useModuleConfig';
import { getModulePathForRole, getModulesForRole } from '../../modules/moduleRegistry';

const DoctorSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { enabledMap } = useModuleConfig();
  const menuItems = getModulesForRole('doctor', { enabledMap, sidebarOnly: true });

  return (
    <div className={`doctor-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Sidebar Header */}
      <div className={`doc-sidebar-header flex items-center py-6 mb-2 ${collapsed ? 'justify-center' : 'justify-between px-4'}`}>
        {/* Desktop collapse toggle */}
        <button
          className="doc-sidebar-toggle-btn hide-on-mobile"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <AlignLeft size={22} strokeWidth={2.5} />
        </button>

        {/* Mobile close button */}
        <button
          className="doc-sidebar-toggle-btn show-on-mobile"
          onClick={() => setMobileOpen(false)}
          title="Close menu"
          aria-label="Close navigation menu"
        >
          <X size={22} strokeWidth={2.5} />
        </button>

        {!collapsed && (
          <span className="ml-3 font-bold text-base tracking-tight text-slate-800 dark:text-white whitespace-nowrap">
            Doctor's Panel
          </span>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={getModulePathForRole(item, 'doctor')}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div
          className="nav-item text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorSidebar;
