import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { logout } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';
import '../styles/theme.css';
import '../styles/dashboard.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark: darkMode, toggleTheme } = useTheme();
  const [nodeCount, setNodeCount] = useState(4285);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  // Operationalize real-time telemetry fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setNodeCount(prev => {
        const drift = Math.floor(Math.random() * 5) - 2; // -2 to +2 drift
        return Math.max(4000, prev + drift);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page admin-portal">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>

            <div className="logo-group">
              <div className="dashboard-logo">NeuroNest</div>
              <div className="dashboard-role">Console v2.4.0</div>
            </div>

            <div className="system-status-pill" title="Active clinical nodes and data streams in NeuroNest lattice">
              <span className="status-dot pulse"></span>
              Live: {nodeCount.toLocaleString()} Nodes
            </div>

            <div className="header-search">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Terminal search..." />
            </div>
          </div>

          <div className="dashboard-header-right">
            <div className="institutional-clock" style={{
              fontSize: '0.75rem', 
              fontWeight: 700, 
              fontFamily: 'monospace', 
              color: 'var(--admin-text-muted)',
              borderRight: '1px solid var(--admin-border)',
              paddingRight: '1rem',
              marginRight: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              lineHeight: 1.1
            }}>
              <span style={{color: 'var(--admin-text-main)'}}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </span>
              <span style={{fontSize: '0.6rem', opacity: 0.7}}>
                {currentTime.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
              </span>
            </div>

            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {/* CSS pseudo-elements handle icons */}
            </button>

            <button className="header-icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="notification-badge"></span>
            </button>

            <button className="logout-btn" onClick={logout} title="Sign Out">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
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
      </header>

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        role="admin"
        title="Admin Control"
      />

      <main className={`dashboard-main ${!sidebarOpen ? 'sidebar-rail-offset' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
