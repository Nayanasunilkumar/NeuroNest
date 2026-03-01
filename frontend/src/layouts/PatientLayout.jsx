import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DynamicIslandNav from "../components/DynamicIslandNav";
import { logout } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import { Activity, Sun, Moon, LogOut, Search, Bell } from "lucide-react";

const PatientLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isDark: darkMode, toggleTheme } = useTheme();
    const location = useLocation();

    const isMessagePath = location.pathname.includes('/messages');

    return (
        <div className={`vh-100 d-flex flex-column overflow-hidden ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`} style={{ transition: 'all 0.3s' }}>
            {/* Navbar */}
            <header className={`navbar navbar-expand-lg sticky-top ${darkMode ? 'navbar-dark bg-dark border-secondary' : 'navbar-light bg-white'} border-bottom shadow-sm px-3`} style={{ height: '80px', zIndex: 1050 }}>
                <div className="container-fluid align-items-center flex-nowrap">
                    {/* Left: Branding */}
                    <div className="d-flex align-items-center flex-shrink-0 me-3 me-xl-5">
                        <span className={`h4 fw-black mb-0 ${darkMode ? 'text-white' : 'text-primary'}`} style={{ letterSpacing: '-0.05em' }}>NEURONEST</span>
                    </div>

                    {/* Center: Dynamic Island Navigation */}
                    <div className="d-none d-lg-flex overflow-hidden" style={{ minWidth: 0, flexShrink: 1 }}>
                        <DynamicIslandNav role="patient" />
                    </div>

                    {/* Spacer */}
                    <div className="flex-grow-1 d-none d-lg-block"></div>

                    {/* Right Actions */}
                    <div className="d-flex align-items-center justify-content-end gap-2 gap-md-3 flex-shrink-0 ms-3">
                        <button 
                            className={`btn p-2 rounded-circle border-0 d-flex align-items-center justify-content-center transition-all ${darkMode ? 'btn-outline-light text-warning' : 'btn-outline-secondary text-secondary opacity-75'}`}
                            onClick={toggleTheme}
                            title="Toggle Theme"
                            style={{ width: '40px', height: '40px' }}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button className={`btn p-2 rounded-circle border-0 d-none d-sm-flex align-items-center justify-content-center ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary opacity-75'}`} style={{ width: '40px', height: '40px' }}>
                            <Bell size={20} />
                        </button>

                        <button 
                            className="btn btn-danger-soft rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 border-0 shadow-sm transition-all"
                            onClick={logout}
                        >
                            <LogOut size={18} />
                            <span className="d-none d-md-inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Nav (Floating at bottom for better UX) */}
            <div className="d-lg-none position-fixed bottom-0 start-0 w-100 p-3 mb-2" style={{ zIndex: 1000 }}>
                <DynamicIslandNav role="patient" />
            </div>

            <div className="d-flex flex-grow-1 overflow-hidden" style={{ position: 'relative' }}>
                {/* Main Content Area - Full width now */}
                <main 
                    className={`flex-grow-1 d-flex flex-column ${isMessagePath ? 'overflow-hidden' : 'overflow-auto'} position-relative ${isMessagePath ? 'p-0' : 'p-3 p-md-4 p-lg-5'}`}
                    style={{ transition: 'all 0.4s' }}
                >
                    <div className={isMessagePath ? 'h-100' : 'container-fluid max-w-1400 mx-auto pb-5 pb-lg-0'}>
                        <Outlet />
                    </div>
                </main>
            </div>

            <style>{`
                .fw-black { font-weight: 950; }
                .shadow-xs { box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
                .max-w-400 { max-width: 400px; }
                .max-w-1400 { max-width: 1400px; }
                .btn-danger-soft { 
                    background-color: rgba(220, 53, 69, 0.1); 
                    color: #dc3545; 
                    transition: all 0.2s;
                }
                .btn-danger-soft:hover { 
                    background-color: #dc3545; 
                    color: white; 
                    transform: scale(1.05);
                }
                
                @media (min-width: 1200px) {
                    main:not(.sidebar-minimized) {
                        margin-left: 280px;
                    }
                    main.sidebar-minimized {
                        margin-left: 80px;
                    }
                }
            `}</style>
        </div>
    );
};

export default PatientLayout;
