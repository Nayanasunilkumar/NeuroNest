import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { logout } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import { Menu, Sun, Moon, LogOut, Search, Bell } from "lucide-react";

const PatientLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isDark: darkMode, toggleTheme } = useTheme();
    const location = useLocation();

    const isMessagePath = location.pathname.includes('/messages');

    return (
        <div className={`min-vh-100 d-flex flex-column ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`} style={{ transition: 'all 0.3s' }}>
            {/* Navbar */}
            <header className={`navbar navbar-expand-lg sticky-top ${darkMode ? 'navbar-dark bg-dark border-secondary' : 'navbar-light bg-white'} border-bottom shadow-sm px-3`} style={{ height: '70px', zIndex: 1050 }}>
                <div className="container-fluid gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <button 
                            className={`btn ${darkMode ? 'btn-outline-secondary text-light' : 'btn-outline-primary'} border-0 rounded-circle p-2 d-xl-none`}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle navigation"
                        >
                            <Menu size={24} />
                        </button>
                        
                        <div className="d-flex flex-column lh-1">
                            <span className="h4 fw-black mb-0 text-primary" style={{ letterSpacing: '-1px' }}>NEURONEST</span>
                            <span className="small fw-bold text-uppercase opacity-50" style={{ fontSize: '0.65rem', letterSpacing: '2px' }}>Patient Portal</span>
                        </div>
                    </div>

                    <div className="d-none d-md-flex flex-grow-1 justify-content-center max-w-400">
                        <div className="input-group input-group-sm bg-light rounded-pill px-3 py-1 shadow-xs" style={{ maxWidth: '400px', border: darkMode ? '1px solid #444' : '1px solid #eee' }}>
                            <span className="input-group-text bg-transparent border-0 text-secondary p-0 me-2"><Search size={16} /></span>
                            <input type="text" className={`form-control bg-transparent border-0 shadow-none py-1 ${darkMode ? 'text-light' : ''}`} placeholder="Search medical records..." style={{ fontSize: '0.85rem' }} />
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 gap-md-3">
                        <button className={`btn p-2 rounded-circle border-0 d-none d-sm-flex ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary opacity-75'}`}>
                            <Bell size={20} />
                        </button>

                        <button 
                            className={`btn p-2 rounded-circle border-0 ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary opacity-75'}`}
                            onClick={toggleTheme}
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="vr d-none d-sm-block mx-1 opacity-10"></div>

                        <button 
                            className="btn btn-danger-soft rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 border-0 shadow-sm"
                            onClick={logout}
                        >
                            <LogOut size={18} />
                            <span className="d-none d-md-inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="d-flex flex-grow-1 overflow-hidden" style={{ position: 'relative' }}>
                {/* Sidebar Component */}
                <Sidebar 
                    isOpen={sidebarOpen} 
                    setIsOpen={setSidebarOpen} 
                    role="patient" 
                    title="NeuroNest Patient" 
                />

                {/* Main Content Area */}
                <main 
                    className={`flex-grow-1 overflow-auto position-relative ${!sidebarOpen ? 'sidebar-minimized' : ''} ${isMessagePath ? 'p-0' : 'p-3 p-md-4 p-lg-5'}`}
                    style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                    <div className={isMessagePath ? 'h-100' : 'container-fluid max-w-1400 mx-auto'}>
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
