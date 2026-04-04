import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { logout, getUser } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';
import { useSystemConfig } from '../context/SystemConfigContext';
import '../styles/admin-theme.css';
import {
  BarChart3,
  Bell,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Stethoscope,
  Sun,
  User,
  Users,
  X,
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Patients', to: '/admin/manage-patients', icon: Users },
  { label: 'Doctors', to: '/admin/manage-doctors', icon: Stethoscope },
  { label: 'Appointments', to: '/admin/appointment-management', icon: CalendarDays },
  { label: 'Feedback & Reviews', to: '/admin/review-management', icon: Star },
  { label: 'Announcements', to: '/admin/announcements', icon: Bell },
  { label: 'Reports', to: '/admin/reports-analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

const SEARCH_ITEMS = [
  ...ADMIN_NAV_ITEMS,
  { label: 'Platform Settings', to: '/admin/settings', icon: Settings },
  { label: 'Announcements', to: '/admin/announcements', icon: Bell },
];

const NOTIFICATION_ITEMS = [
  { title: 'New appointment', detail: 'Neurology consult requested for 14:30', tone: 'info' },
  { title: 'Cancelled appointment', detail: 'Patient #442 cancelled tomorrow 09:00 slot', tone: 'warning' },
  { title: 'Critical alert', detail: 'High-risk escalation flagged in governance queue', tone: 'danger' },
  { title: 'New review', detail: 'A new patient review needs moderation', tone: 'success' },
  { title: 'System announcement', detail: 'Maintenance window scheduled for tonight', tone: 'neutral' },
];

const PROFILE_LINKS = [
  { label: 'My Profile', to: '/admin/dashboard', icon: User },
  { label: 'Platform Settings', to: '/admin/settings', icon: Settings },
  { label: 'Admin Management', to: '/admin/manage-doctors', icon: ShieldCheck },
  { label: 'Audit Logs', to: '/admin/reports-analytics', icon: BarChart3 },
];

const AdminLayout = () => {
  const { isDark: darkMode, toggleTheme } = useTheme();
  const { platformName } = useSystemConfig();
  const location = useLocation();
  const overlayRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const user = getUser();
  const adminName = user?.full_name || 'Admin';

  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSearchItems = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return SEARCH_ITEMS;
    return SEARCH_ITEMS.filter((item) => item.label.toLowerCase().includes(normalized));
  }, [searchQuery]);

  const togglePanel = (panel) => {
    setSearchOpen(panel === 'search' ? !searchOpen : false);
    setNotificationsOpen(panel === 'notifications' ? !notificationsOpen : false);
    setProfileOpen(panel === 'profile' ? !profileOpen : false);
  };

  return (
    <div
      className={`admin-theme ${darkMode ? 'admin-theme-dark' : 'admin-theme-light'} min-h-screen flex flex-col overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
    >
      <header
        className={`sticky top-0 z-[1050] border-b transition-all duration-300 ${
          darkMode ? 'bg-slate-950/88 border-slate-800' : 'bg-white/88 border-slate-200'
        }`}
      >
        <div className="admin-navbar-shell">
          <div className="admin-navbar-left">
            <Link to="/admin/dashboard" className="admin-navbar-brand" aria-label="NeuroNest Admin Home">
              <span className="admin-navbar-brandmark">N</span>
              <span className="admin-navbar-brandtext">{(platformName || 'NeuroNest').toUpperCase()}</span>
            </Link>

            <span className="admin-navbar-divider" aria-hidden="true" />

            <button
              type="button"
              className="admin-navbar-iconbtn admin-navbar-mobiletoggle"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>

            <nav className="admin-navbar-nav" aria-label="Admin Primary Navigation">
              {ADMIN_NAV_ITEMS.map(({ label, to, icon: Icon, end }, index) => (
                <div key={to} className="admin-navbar-navitem">
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) => `admin-navbar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </NavLink>
                  {index < ADMIN_NAV_ITEMS.length - 1 ? (
                    <span className="admin-navbar-navseparator" aria-hidden="true" />
                  ) : null}
                </div>
              ))}
            </nav>
          </div>

          <div className="admin-navbar-right" ref={overlayRef}>
            <button
              type="button"
              className={`admin-navbar-iconbtn ${searchOpen ? 'active' : ''}`}
              onClick={() => togglePanel('search')}
              aria-label="Open global search"
            >
              <Search size={19} />
            </button>

            <button
              type="button"
              className={`admin-navbar-iconbtn admin-navbar-bell ${notificationsOpen ? 'active' : ''}`}
              onClick={() => togglePanel('notifications')}
              aria-label="Open notifications"
            >
              <Bell size={19} />
              <span className="admin-navbar-bell-dot" aria-hidden="true" />
            </button>

            <div className="admin-navbar-time" aria-label="System time">
              <Clock3 size={16} />
              <div>
                <strong>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                <span>{currentTime.toLocaleDateString([], { month: 'short', day: '2-digit' })}</span>
              </div>
            </div>

            <button
              type="button"
              className="admin-navbar-iconbtn"
              onClick={toggleTheme}
              aria-label="Toggle dark and light theme"
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              type="button"
              className={`admin-navbar-iconbtn ${profileOpen ? 'active' : ''}`}
              onClick={() => togglePanel('profile')}
              aria-label="Open admin profile menu"
            >
              <User size={19} />
            </button>

            <button
              type="button"
              className="admin-navbar-iconbtn admin-navbar-logout"
              onClick={logout}
              aria-label="Logout"
            >
              <LogOut size={19} />
            </button>

            {searchOpen && (
              <div className="admin-navbar-popover admin-navbar-searchpanel">
                <div className="admin-navbar-popoverhead">
                  <strong>Global Search</strong>
                  <span>Patients, doctors, appointments, reports</span>
                </div>
                <div className="admin-navbar-searchbox">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <div className="admin-navbar-searchresults">
                  {filteredSearchItems.map(({ label, to, icon: Icon }) => (
                    <Link key={to} to={to} className="admin-navbar-searchitem">
                      <Icon size={16} />
                      <span>{label}</span>
                    </Link>
                  ))}
                  {filteredSearchItems.length === 0 && (
                    <div className="admin-navbar-empty">No matching destinations</div>
                  )}
                </div>
              </div>
            )}

            {notificationsOpen && (
              <div className="admin-navbar-popover admin-navbar-notificationspanel">
                <div className="admin-navbar-popoverhead">
                  <strong>Notifications</strong>
                  <span>Operational alerts and system updates</span>
                </div>
                <div className="admin-navbar-notificationlist">
                  {NOTIFICATION_ITEMS.map((item) => (
                    <div key={item.title} className={`admin-navbar-notification admin-${item.tone}`}>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileOpen && (
              <div className="admin-navbar-popover admin-navbar-profilepanel">
                <div className="admin-navbar-profilehead">
                  <span className="admin-navbar-avatar large">{adminName.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <strong>{adminName}</strong>
                    <span>Administrative Access</span>
                  </div>
                </div>
                <div className="admin-navbar-profilelinks">
                  {PROFILE_LINKS.map(({ label, to, icon: Icon }) => (
                    <Link key={label} to={to} className="admin-navbar-profilelink">
                      <Icon size={16} />
                      <span>{label}</span>
                    </Link>
                  ))}
                  <button type="button" className="admin-navbar-profilelink danger" onClick={logout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="admin-navbar-mobilepanel">
            <div className="admin-navbar-mobiletime">
              <Clock3 size={15} />
              <span>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                {currentTime.toLocaleDateString([], { month: 'short', day: '2-digit' })}
              </span>
            </div>
            <nav className="admin-navbar-mobilenav" aria-label="Admin Mobile Navigation">
              {ADMIN_NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `admin-navbar-mobilelink ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto scroll-smooth px-4 pb-6 pt-4 sm:px-6 lg:px-6">
        <div className="admin-page-shell min-h-full">
          <Outlet />
        </div>
      </main>

      <style>{`
        .scroll-smooth { scroll-behavior: smooth; }
        .admin-navbar-shell {
          height: 64px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          backdrop-filter: blur(18px);
        }
        .admin-navbar-left,
        .admin-navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }
        .admin-navbar-left {
          flex: 1 1 auto;
          overflow: hidden;
        }
        .admin-navbar-right {
          position: relative;
          flex: 0 0 auto;
          justify-content: flex-end;
          white-space: nowrap;
        }
        .admin-navbar-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .admin-navbar-brandmark {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2563eb 0%, #38bdf8 100%);
          color: white;
          font-size: 1rem;
          font-weight: 900;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.28);
        }
        .admin-navbar-brandtext {
          color: var(--nn-text-main);
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .admin-navbar-divider {
          width: 1px;
          height: 28px;
          background: var(--nn-border);
          flex-shrink: 0;
        }
        .admin-navbar-nav {
          display: flex;
          align-items: center;
          gap: 0;
          min-width: 0;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 0 6px;
        }
        .admin-navbar-navitem {
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
        }
        .admin-navbar-navseparator {
          width: 1px;
          height: 24px;
          margin: 0 10px;
          background: color-mix(in srgb, var(--nn-border) 78%, transparent);
          border-radius: 999px;
          flex-shrink: 0;
        }
        .admin-navbar-nav::-webkit-scrollbar {
          display: none;
        }
        .admin-navbar-link,
        .admin-navbar-mobilelink {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--nn-text-secondary);
          font-size: 0.95rem;
          font-weight: 700;
          line-height: 1;
          transition: all 0.2s ease;
          border-radius: 999px;
          white-space: nowrap;
        }
        .admin-navbar-link {
          min-height: 44px;
          padding: 0 16px;
        }
        .admin-navbar-link:hover,
        .admin-navbar-mobilelink:hover {
          color: var(--nn-text-main);
          background: color-mix(in srgb, var(--nn-surface-secondary) 92%, transparent);
        }
        .admin-navbar-link.active,
        .admin-navbar-mobilelink.active {
          color: #eaf3ff;
          background: linear-gradient(135deg, #2563eb 0%, #38bdf8 100%);
          box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.28), 0 12px 22px rgba(37, 99, 235, 0.24);
        }
        .admin-navbar-iconbtn,
        .admin-navbar-profile {
          min-height: 40px;
          border-radius: 999px;
          border: 1px solid var(--nn-border);
          background: color-mix(in srgb, var(--nn-surface) 90%, transparent);
          color: var(--nn-text-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s ease;
        }
        .admin-navbar-iconbtn {
          width: 40px;
        }
        .admin-navbar-iconbtn:hover,
        .admin-navbar-iconbtn.active,
        .admin-navbar-profile:hover,
        .admin-navbar-profile.active {
          color: var(--nn-text-main);
          border-color: color-mix(in srgb, var(--nn-primary) 35%, var(--nn-border));
          background: color-mix(in srgb, var(--nn-primary) 12%, var(--nn-surface));
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
        }
        .admin-navbar-bell {
          position: relative;
        }
        .admin-navbar-bell-dot {
          position: absolute;
          top: 9px;
          right: 10px;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #fb7185;
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--nn-surface) 94%, transparent);
        }
        .admin-navbar-time {
          min-height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid var(--nn-border);
          background: color-mix(in srgb, var(--nn-surface) 88%, transparent);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--nn-text-secondary);
        }
        .admin-navbar-time div {
          display: flex;
          flex-direction: column;
          line-height: 1.05;
        }
        .admin-navbar-time strong {
          font-size: 0.78rem;
          color: var(--nn-text-main);
        }
        .admin-navbar-time span {
          font-size: 0.68rem;
          color: var(--nn-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .admin-navbar-profile {
          padding: 0 12px 0 8px;
        }
        .admin-navbar-avatar {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .admin-navbar-avatar.large {
          width: 42px;
          height: 42px;
          font-size: 1rem;
        }
        .admin-navbar-profilecopy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.05;
        }
        .admin-navbar-profilecopy strong {
          font-size: 0.84rem;
          color: var(--nn-text-main);
        }
        .admin-navbar-profilecopy span {
          font-size: 0.68rem;
          color: var(--nn-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .admin-navbar-logout {
          color: #fda4af;
          background: rgba(190, 24, 93, 0.08);
          border-color: rgba(244, 114, 182, 0.18);
        }
        .admin-navbar-logout:hover {
          color: white;
          background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
          border-color: transparent;
        }
        .admin-navbar-popover {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          border-radius: 20px;
          border: 1px solid var(--nn-border);
          background: color-mix(in srgb, var(--nn-surface) 94%, transparent);
          box-shadow: 0 24px 50px rgba(2, 6, 23, 0.28);
          backdrop-filter: blur(20px);
          overflow: hidden;
          z-index: 20;
        }
        .admin-navbar-searchpanel {
          width: 320px;
        }
        .admin-navbar-notificationspanel,
        .admin-navbar-profilepanel {
          width: 340px;
        }
        .admin-navbar-popoverhead,
        .admin-navbar-profilehead {
          padding: 18px 18px 14px;
          border-bottom: 1px solid var(--nn-divider);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .admin-navbar-popoverhead strong,
        .admin-navbar-profilehead strong {
          color: var(--nn-text-main);
          font-size: 0.92rem;
        }
        .admin-navbar-popoverhead span,
        .admin-navbar-profilehead span {
          color: var(--nn-text-muted);
          font-size: 0.76rem;
        }
        .admin-navbar-profilehead {
          flex-direction: row;
          align-items: center;
          gap: 12px;
        }
        .admin-navbar-searchbox {
          margin: 16px 18px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 14px;
          border: 1px solid var(--nn-border);
          background: var(--nn-surface-secondary);
          padding: 0 14px;
        }
        .admin-navbar-searchbox input {
          width: 100%;
          height: 42px;
          border: 0;
          background: transparent;
          color: var(--nn-text-main);
          outline: none;
        }
        .admin-navbar-searchresults,
        .admin-navbar-profilelinks,
        .admin-navbar-notificationlist {
          padding: 0 10px 10px;
        }
        .admin-navbar-searchitem,
        .admin-navbar-profilelink {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--nn-text-secondary);
          border-radius: 14px;
          padding: 12px 12px;
          transition: all 0.2s ease;
          background: transparent;
          border: 0;
          text-align: left;
        }
        .admin-navbar-searchitem:hover,
        .admin-navbar-profilelink:hover {
          color: var(--nn-text-main);
          background: color-mix(in srgb, var(--nn-primary) 10%, var(--nn-surface-secondary));
        }
        .admin-navbar-profilelink.danger {
          color: #fb7185;
        }
        .admin-navbar-empty {
          padding: 8px 12px 16px;
          color: var(--nn-text-muted);
          font-size: 0.82rem;
        }
        .admin-navbar-notification {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px;
          border-radius: 16px;
          margin-bottom: 8px;
          border: 1px solid transparent;
          background: var(--nn-surface-secondary);
        }
        .admin-navbar-notification strong {
          color: var(--nn-text-main);
          font-size: 0.84rem;
        }
        .admin-navbar-notification span {
          color: var(--nn-text-muted);
          font-size: 0.75rem;
          line-height: 1.45;
        }
        .admin-navbar-notification.admin-info {
          border-color: rgba(59, 130, 246, 0.18);
        }
        .admin-navbar-notification.admin-warning {
          border-color: rgba(245, 158, 11, 0.22);
        }
        .admin-navbar-notification.admin-danger {
          border-color: rgba(244, 63, 94, 0.24);
        }
        .admin-navbar-notification.admin-success {
          border-color: rgba(34, 197, 94, 0.2);
        }
        .admin-navbar-mobiletoggle,
        .admin-navbar-mobilepanel {
          display: none;
        }
        .admin-navbar-mobilepanel {
          padding: 12px 16px 16px;
          border-top: 1px solid var(--nn-divider);
          background: color-mix(in srgb, var(--nn-surface) 96%, transparent);
        }
        .admin-navbar-mobiletime {
          display: none;
        }
        .admin-navbar-mobilenav {
          display: grid;
          gap: 10px;
        }
        .admin-navbar-mobilelink {
          min-height: 46px;
          padding: 0 14px;
        }
        @media (max-width: 1439.98px) {
          .admin-navbar-time {
            display: none;
          }
          .admin-navbar-profilecopy {
            display: none;
          }
        }
        @media (max-width: 1199.98px) {
          .admin-navbar-shell {
            gap: 16px;
            padding-inline: 16px;
          }
          .admin-navbar-navseparator {
            margin: 0 6px;
          }
          .admin-navbar-link {
            padding-inline: 14px;
          }
        }
        @media (max-width: 1023.98px) {
          .admin-navbar-divider,
          .admin-navbar-nav {
            display: none;
          }
          .admin-navbar-mobiletoggle,
          .admin-navbar-mobilepanel {
            display: inline-flex;
          }
          .admin-navbar-mobilepanel {
            display: block;
          }
          .admin-navbar-mobiletime {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            color: var(--nn-text-muted);
            font-size: 0.76rem;
          }
        }
        @media (max-width: 767.98px) {
          .admin-navbar-shell {
            padding-inline: 12px;
            gap: 12px;
          }
          .admin-navbar-brandtext {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .admin-navbar-right {
            gap: 10px;
          }
          .admin-navbar-profile {
            padding-right: 8px;
          }
          .admin-navbar-profilepanel,
          .admin-navbar-notificationspanel,
          .admin-navbar-searchpanel {
            width: min(92vw, 340px);
          }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark ::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
};

export default AdminLayout;
