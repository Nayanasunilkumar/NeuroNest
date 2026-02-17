import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LogOut, AlignLeft
} from 'lucide-react';
import { logout } from '../../utils/auth';
import { useModuleConfig } from '../../hooks/useModuleConfig';
import { getModulePathForRole, getModulesForRole } from '../../modules/moduleRegistry';

const DoctorSidebar = ({ collapsed, setCollapsed }) => {
  const { enabledMap } = useModuleConfig();
  const menuItems = getModulesForRole('doctor', { enabledMap, sidebarOnly: true });

  return (
    <div className={`doctor-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Toggle Header */}
      <div className={`doc-sidebar-header flex items-center ${collapsed ? 'justify-center' : 'justify-start px-6'} py-6 mb-2`}>
        <button 
            className="text-slate-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-200 transition-colors bg-transparent border-none outline-none ring-0 w-auto h-auto min-w-0 min-h-0 flex items-center justify-center p-0"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
            <AlignLeft size={24} strokeWidth={2.5} />
        </button>
        {!collapsed && (
            <span className="ml-4 font-bold text-lg tracking-tight text-slate-800 dark:text-white whitespace-nowrap">
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
