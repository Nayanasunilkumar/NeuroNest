import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { logout } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';
import { 
    Search, Bell, LogOut, Menu, Activity, 
    Monitor, Shield, Clock, Sun, Moon 
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        style={{ height: '70px', zIndex: 1050 }}
      >
        <div className="container-fluid gap-3">
          <div className="d-flex align-items-center gap-3">
            <button 
              className={`btn btn-link p-0 text-decoration-none ${darkMode ? 'text-light' : 'text-dark'}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>

            <div className="d-flex flex-column lh-1">
              <span className="h5 fw-black mb-0 mb-1" style={{ letterSpacing: '-0.5px' }}>NEURONEST</span>
              <span className="small text-uppercase fw-bold opacity-50 font-monospace" style={{ fontSize: '0.65rem' }}>Core v2.4.0 • Admin Console</span>
            </div>

            <div className="d-none d-lg-flex align-items-center bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill ms-3 border border-primary border-opacity-25 shadow-sm">
                <Activity size={12} className="me-2 pulse-slow" />
                <span className="small fw-black font-monospace">{nodeCount.toLocaleString()} Live Nodes</span>
            </div>
          </div>

          <div className="flex-grow-1 d-none d-md-block mx-5">
            <div className="position-relative">
              <Search size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 opacity-50" />
              <input 
                type="text" 
                className={`form-control border-0 rounded-pill ps-5 py-2 ${darkMode ? 'bg-secondary bg-opacity-25 text-light placeholder-light' : 'bg-light text-dark'}`} 
                placeholder="Terminal search..." 
                style={{ fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-sm-flex flex-column align-items-end pe-3 border-end border-secondary border-opacity-25 me-1">
               <span className="fw-black font-monospace lh-1" style={{ fontSize: '0.95rem' }}>
                  {currentTime.toLocaleTimeString([], { hour12: false })}
               </span>
               <span className="small text-uppercase opacity-50 fw-bold" style={{ fontSize: '0.6rem' }}>
                  {currentTime.toLocaleDateString([], { day: '2-digit', month: 'short' })}
               </span>
            </div>

            <button 
              className={`btn btn-circle rounded-circle p-2 border-0 ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
              onClick={toggleTheme}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="position-relative">
              <button className={`btn btn-circle rounded-circle p-2 border-0 ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}>
                <Bell size={20} />
              </button>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.5rem', padding: '2px 4px' }}>
                4
              </span>
            </div>

            <button 
              className="btn btn-danger rounded-circle p-2 shadow-sm ms-2"
              onClick={logout}
              title="Terminate Session"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Control Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        role="admin"
        title="Admin Control"
      />

      {/* Main Execution Flow */}
      <main 
        className={`flex-grow-1 overflow-y-auto pt-4 pb-5 ${!sidebarOpen ? 'sidebar-rail-offset' : 'sidebar-open-offset'}`}
        style={{ transition: 'padding 0.3s ease' }}
      >
        <div className="container-fluid px-4 px-lg-5">
           <Outlet />
        </div>
      </main>

      <style>{`
        .fw-black { font-weight: 900; }
        .sidebar-rail-offset { padding-left: 80px; }
        .sidebar-open-offset { padding-left: 280px; }
        .pulse-slow { animation: pulse 3s infinite; }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 992px) {
          .sidebar-rail-offset, .sidebar-open-offset { padding-left: 0; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
