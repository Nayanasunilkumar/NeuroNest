import React from 'react';
import { NavLink } from "react-router-dom";
import { useModuleConfig } from "../hooks/useModuleConfig";
import { getModulePathForRole, getModulesForRole } from "../modules/moduleRegistry";
import { logout } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import { X, LogOut, ChevronRight } from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen, role = "patient", title = "NeuroNest Panel" }) => {
    const { enabledMap } = useModuleConfig();
    const { isDark: darkMode } = useTheme();
    const menuItems = getModulesForRole(role, { enabledMap, sidebarOnly: true });

    const groupedItems = menuItems.reduce((acc, item) => {
        const group = item.group || 'General';
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-xl-none transition-all ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                style={{ zIndex: 1040, backdropFilter: 'blur(4px)' }}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Container */}
            <aside 
                className={`position-fixed top-0 start-0 h-100 shadow-lg border-end transition-all ${darkMode ? 'bg-dark border-secondary' : 'bg-white border-light'} ${isOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
                style={{ 
                    zIndex: 1045, 
                    width: isOpen ? '280px' : '80px',
                    paddingTop: '70px',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {/* Mobile Close Button */}
                <div className="d-flex d-xl-none justify-content-end p-3 position-absolute top-0 end-0">
                    <button className={`btn rounded-circle p-2 ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`} onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="d-flex flex-column h-100 py-4 overflow-hidden">
                    {/* Menu Sections */}
                    <div className="flex-grow-1 overflow-y-auto px-3 custom-scrollbar">
                        {Object.entries(groupedItems).map(([groupName, items]) => (
                            <div key={groupName} className="mb-4">
                                {isOpen && (
                                    <div className={`small fw-black text-uppercase mb-3 px-3 opacity-50 ${darkMode ? 'text-light' : 'text-secondary'}`} style={{ fontSize: '0.65rem', letterSpacing: '1.5px' }}>
                                        {groupName}
                                    </div>
                                )}
                                <div className="d-flex flex-column gap-1">
                                    {items.map((item) => {
                                        const Icon = item.icon;
                                        if (!Icon) return null;
                                        return (
                                            <NavLink
                                                key={item.key}
                                                to={getModulePathForRole(item, role)}
                                                className={({ isActive }) => `
                                                    d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition-all
                                                    ${isActive 
                                                        ? 'bg-primary text-white shadow-sm' 
                                                        : darkMode ? 'text-light-emphasis hover-bg-dark' : 'text-secondary hover-bg-light'}
                                                `}
                                                onClick={() => window.innerWidth < 1200 && setIsOpen(false)}
                                                title={!isOpen ? item.label : ''}
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '24px', height: '24px' }}>
                                                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                                        </div>
                                                        {isOpen && (
                                                            <div className="d-flex align-items-center justify-content-between flex-grow-1 min-w-0">
                                                                <span className="fw-bold small text-truncate">{item.label}</span>
                                                                <ChevronRight size={14} className="opacity-25" />
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Logout */}
                    <div className="px-3 mt-auto pt-4 border-top border-light border-opacity-10">
                        <button 
                            className={`btn w-100 d-flex align-items-center gap-3 px-3 py-3 rounded-3 border-0 transition-all ${darkMode ? 'text-danger-emphasis bg-danger bg-opacity-10' : 'text-danger bg-danger bg-opacity-10'} hover-bg-danger`}
                            onClick={logout}
                        >
                            <LogOut size={20} />
                            {isOpen && <span className="fw-black small text-uppercase" style={{ letterSpacing: '1px' }}>Disconnect</span>}
                        </button>
                    </div>
                </div>
            </aside>

            <style>{`
                .sidebar-collapsed {
                    transform: translateX(0);
                }
                
                @media (max-width: 1199.98px) {
                    .sidebar-collapsed {
                        transform: translateX(-100%);
                    }
                    .sidebar-expanded {
                        transform: translateX(0);
                        width: 280px !important;
                    }
                }

                .hover-bg-light:hover { background-color: rgba(0,0,0,0.03); color: #0d6efd !important; }
                .hover-bg-dark:hover { background-color: rgba(255,255,255,0.05); color: #fff !important; }
                .hover-bg-danger:hover { background-color: #dc3545 !important; color: white !important; }
                
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                
                .fw-black { font-weight: 950; }
            `}</style>
        </>
    );
};

export default Sidebar;
