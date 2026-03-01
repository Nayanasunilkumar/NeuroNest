import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DynamicIslandNav from '../components/DynamicIslandNav';
import { logout } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';
import { 
    Search, Bell, LogOut, Menu, Activity, 
    Monitor, Shield, Clock, Sun, Moon 
} from 'lucide-react';

const AdminLayout = () => {
  const { isDark: darkMode, toggleTheme } = useTheme();
  const [nodeCount, setNodeCount] = useState(4285);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodeCount(prev => {
        const drift = Math.floor(Math.random() * 5) - 2;
        return Math.max(4000, prev + drift);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`vh-100 d-flex flex-column overflow-hidden ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`} style={{ transition: 'all 0.3s ease' }}>
      {/* Premium Admin Header */}
      <header 
        className={`navbar sticky-top shadow-sm px-4 ${darkMode ? 'bg-dark border-bottom border-secondary' : 'bg-white'}`}
        style={{ height: '80px', zIndex: 1050 }}
      >
        <div className="container-fluid align-items-center flex-nowrap">
            {/* Left: Branding */}
            <div className="d-flex align-items-center flex-shrink-0 me-3 me-xl-5">
                <span className={`h4 fw-black mb-0 ${darkMode ? 'text-white' : 'text-primary'}`} style={{ letterSpacing: '-0.05em' }}>NEURONEST</span>
            </div>

            {/* Center: Dynamic Island Navigation */}
            <div className="d-none d-lg-flex overflow-hidden" style={{ minWidth: 0, flexShrink: 1 }}>
                <DynamicIslandNav role="admin" />
            </div>

            {/* Spacer */}
            <div className="flex-grow-1 d-none d-lg-block"></div>

            {/* Right Actions */}
            <div className="d-flex align-items-center justify-content-end gap-3 flex-shrink-0 ms-3">
                 <div className="d-none d-xl-flex flex-column align-items-end pe-3 border-end border-secondary border-opacity-25 me-1">
                    <span className="fw-black font-monospace lh-1" style={{ fontSize: '0.95rem' }}>
                        {currentTime.toLocaleTimeString([], { hour12: false })}
                    </span>
                    <span className="small text-uppercase opacity-50 fw-bold" style={{ fontSize: '0.6rem' }}>
                        {currentTime.toLocaleDateString([], { day: '2-digit', month: 'short' })}
                    </span>
                 </div>

                 <button 
                    className={`btn p-2 rounded-circle border-0 d-flex align-items-center justify-content-center transition-all ${darkMode ? 'btn-outline-light text-warning' : 'btn-outline-dark text-secondary'}`}
                    onClick={toggleTheme}
                    title="Toggle Theme"
                    style={{ width: '40px', height: '40px' }}
                 >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                 </button>

                 <button 
                  className="btn btn-danger-soft rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 border-0 shadow-sm transition-all"
                  onClick={logout}
                >
                  <LogOut size={20} />
                  <span className="d-none d-md-inline">Logout</span>
                </button>
            </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="d-lg-none position-fixed bottom-0 start-0 w-100 p-3 mb-2" style={{ zIndex: 1000 }}>
         <DynamicIslandNav role="admin" />
      </div>

      {/* Main Execution Flow */}
      <main 
        className={`flex-grow-1 overflow-y-auto pt-4 pb-5`}
        style={{ transition: 'padding 0.3s ease' }}
      >
        <div className="container-fluid px-4 px-lg-5 pb-5 pb-lg-0">
           <Outlet />
        </div>
      </main>

      <style>{`
        .fw-black { font-weight: 900; }
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
        .pulse-slow { animation: pulse 3s infinite; }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
