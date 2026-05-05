import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { logout, getUser } from '../shared/utils/auth';
import { useTheme } from '../shared/context/ThemeContext';
import { useSystemConfig } from '../shared/context/SystemConfigContext';
import '../admin/styles/admin-theme.css';
import { notificationApi } from '../shared/services/api/notificationApi';
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Star,
  Stethoscope,
  Sun,
  User,
  Users,
  X,
  CheckCircle,
  Trash2,
  ExternalLink,
  Info,
  ShieldAlert,
  Activity,
  AlertTriangle,
  Settings2,
  Filter,
  Check
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

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

const PROFILE_LINKS = [
  { label: 'My Profile', to: '/admin/dashboard', icon: User },
  { label: 'Platform Settings', to: '/admin/settings', icon: Settings },
  { label: 'Admin Management', to: '/admin/manage-doctors', icon: ShieldCheck },
  { label: 'Audit Logs', to: '/admin/reports-analytics', icon: BarChart3 },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { isDark: darkMode, toggleTheme } = useTheme();
  const { platformName } = useSystemConfig();
  const location = useLocation();
  const overlayRef = useRef(null);
  const navScrollRef = useRef(null);
  const notifOverlayRef = useRef(null);
  const bellButtonRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all'); // all, unread, urgent
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    credentialing: true,
    escalations: true,
    systemHealth: true,
    appointments: true,
  });

  const [canScrollNavLeft, setCanScrollNavLeft] = useState(false);
  const [canScrollNavRight, setCanScrollNavRight] = useState(false);

  const user = getUser();
  const adminName = user?.full_name || 'Admin';

  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check both refs independently
      const clickedProfile = overlayRef.current && overlayRef.current.contains(event.target);
      const clickedNotif = notifOverlayRef.current && notifOverlayRef.current.contains(event.target);
      const clickedBell = bellButtonRef.current && bellButtonRef.current.contains(event.target);
      
      if (!clickedProfile) setProfileOpen(false);
      if (!clickedNotif && !clickedBell) {
        setNotificationsOpen(false);
        setExpandedNotif(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    
    setNotificationsOpen(false);
    setExpandedNotif(null);
    
    const type = (notif.type || '').toLowerCase();
    const category = (notif.metadata?.category || '').toLowerCase();
    const title = (notif.title || '').toLowerCase();

    // Contextual Routing with keyword fallback
    if (type === 'escalation' || category === 'escalation' || title.includes('escalation')) {
      navigate('/admin/review-management');
    } else if (type === 'credentialing' || type === 'doctor_verification' || title.includes('credential')) {
      navigate('/admin/manage-doctors');
    } else if (type === 'appointment_conflict' || type === 'appointment' || title.includes('appointment')) {
      navigate('/admin/appointment-management');
    } else if (type === 'announcement_expiry' || title.includes('announcement')) {
      navigate('/admin/announcements');
    } else {
      // Default to dashboard if intent is unclear
      navigate('/admin/dashboard');
    }
  };

  const [expandedNotif, setExpandedNotif] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [lastActionToast, setLastActionToast] = useState(null);

  const handleMarkAsRead = async (id) => {
    setResolvingId(id);
    try {
      await notificationApi.markAsRead(id);
      
      // Delay state update slightly for animation feel
      setTimeout(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setResolvingId(null);
        setLastActionToast("Case marked as read");
        setTimeout(() => setLastActionToast(null), 2500);
      }, 600);
    } catch (err) {
      console.error('Failed to mark as read:', err);
      setResolvingId(null);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotifIcon = (type, severity) => {
    if (severity === 'critical' || type === 'escalation') return <ShieldAlert size={16} className="text-rose-500" />;
    if (type === 'credentialing') return <ShieldCheck size={16} className="text-blue-500" />;
    if (type === 'system') return <Activity size={16} className="text-amber-500" />;
    if (type === 'appointment_conflict') return <AlertTriangle size={16} className="text-orange-500" />;
    if (type === 'announcement_expiry') return <Clock3 size={16} className="text-slate-500" />;
    return <Info size={16} className="text-blue-400" />;
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getNotificationPreferenceKey = (notif) => {
    if (notif.type === 'credentialing') return 'credentialing';
    if (notif.type === 'escalation' || notif.metadata?.severity === 'critical') return 'escalations';
    if (notif.type === 'system' || notif.type === 'announcement_expiry') return 'systemHealth';
    if (notif.type === 'appointment_conflict' || notif.type === 'appointment') return 'appointments';
    return 'systemHealth';
  };

  const filteredNotifications = useMemo(() => {
    let list = notifications.filter((notif) => notificationPreferences[getNotificationPreferenceKey(notif)]);
    if (notificationFilter === 'unread') list = list.filter(n => !n.is_read);
    if (notificationFilter === 'urgent') list = list.filter(n => (n.metadata?.severity === 'critical' || n.type === 'escalation'));
    return list;
  }, [notifications, notificationFilter, notificationPreferences]);

  const urgentTotal = useMemo(() => notifications.filter(n => (n.metadata?.severity === 'critical' || n.type === 'escalation') && !n.is_read).length, [notifications]);
  
  const notificationPreferenceItems = [
    { key: 'credentialing', label: 'Credentialing' },
    { key: 'escalations', label: 'Escalations' },
    { key: 'systemHealth', label: 'System Health' },
    { key: 'appointments', label: 'Appointments' },
  ];

  useEffect(() => {
    const navElement = navScrollRef.current;
    if (!navElement) return undefined;

    const updateNavScrollState = () => {
      const maxScrollLeft = navElement.scrollWidth - navElement.clientWidth;
      setCanScrollNavLeft(navElement.scrollLeft > 4);
      setCanScrollNavRight(maxScrollLeft - navElement.scrollLeft > 4);
    };

    updateNavScrollState();
    navElement.addEventListener('scroll', updateNavScrollState, { passive: true });
    window.addEventListener('resize', updateNavScrollState);

    return () => {
      navElement.removeEventListener('scroll', updateNavScrollState);
      window.removeEventListener('resize', updateNavScrollState);
    };
  }, [location.pathname]);





  const togglePanel = (panel) => {
    setProfileOpen(panel === 'profile' ? !profileOpen : false);
    setNotificationsOpen(panel === 'notifications' ? !notificationsOpen : false);
  };

  const scrollAdminNav = (direction) => {
    if (!navScrollRef.current) return;
    navScrollRef.current.scrollBy({
      left: direction * 220,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={`admin-theme ${darkMode ? 'admin-theme-dark' : 'admin-theme-light'} min-h-screen flex flex-col overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
    >
      <header
        className={`sticky top-0 z-[20000] border-b transition-all duration-300 ${
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

            <div className="admin-navbar-navshell">
              {canScrollNavLeft ? (
                <button
                  type="button"
                  className="admin-navbar-scrollbtn"
                  aria-label="Scroll navigation left"
                  onClick={() => scrollAdminNav(-1)}
                >
                  <ChevronLeft size={16} />
                </button>
              ) : null}

              <nav ref={navScrollRef} className="admin-navbar-nav" aria-label="Admin Primary Navigation">
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

              {canScrollNavRight ? (
                <button
                  type="button"
                  className="admin-navbar-scrollbtn"
                  aria-label="Scroll navigation right"
                  onClick={() => scrollAdminNav(1)}
                >
                  <ChevronRight size={16} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="admin-navbar-right">


            <div className="admin-navbar-time" aria-label="System time">
              <Clock3 size={16} />
              <div>
                <strong>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                <span>{currentTime.toLocaleDateString([], { month: 'short', day: '2-digit' })}</span>
              </div>
            </div>

            <div className="admin-navbar-bell-container">
              <button
                ref={bellButtonRef}
                type="button"
                className={`admin-navbar-iconbtn ${notificationsOpen ? 'active' : ''}`}
                onClick={() => togglePanel('notifications')}
                aria-label="Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && <span className="admin-navbar-bell-dot" />}
              </button>

              {notificationsOpen && createPortal(
                <div className="admin-navbar-popover admin-navbar-notificationspanel" ref={notifOverlayRef}>
                  <div className="admin-navbar-popoverhead">
                    <div className="flex justify-between items-start w-full mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] fw-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Telemetry Active</span>
                        </div>
                        <h5 className="mb-0 fw-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                          Nexus Intelligence
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full fw-normal">v4.2</span>
                        </h5>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <button 
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-0 bg-transparent p-0 transition-all hover:scale-110"
                          onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                          title="Nexus Routing Preferences"
                        >
                          <Settings2 size={18} />
                        </button>
                        {unreadCount > 0 && (
                          <button 
                            className="text-[10px] text-blue-600 hover:text-blue-700 fw-bold border-0 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg transition-colors"
                            onClick={handleMarkAllAsRead}
                          >
                            Mark All Read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="nexus-telemetry-grid">
                      <div className="telemetry-card">
                        <span className="telemetry-label">Active Surveillance</span>
                        <span className="telemetry-value">
                          <Activity size={12} className="text-blue-500" />
                          {notifications.length} Alerts
                        </span>
                      </div>
                      <div className="telemetry-card">
                        <span className="telemetry-label">Critical Actions</span>
                        <span className="telemetry-value text-rose-600">
                          <ShieldAlert size={12} className={urgentTotal > 0 ? "text-rose-500 animate-pulse" : "text-slate-300"} />
                          {urgentTotal} Required
                        </span>
                      </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="admin-notif-tabs">
                      <button 
                        className={`admin-notif-tab ${notificationFilter === 'all' ? 'active' : ''}`}
                        onClick={() => { setNotificationFilter('all'); setExpandedNotif(null); }}
                      >
                        All History
                      </button>
                      <button 
                        className={`admin-notif-tab ${notificationFilter === 'unread' ? 'active' : ''}`}
                        onClick={() => { setNotificationFilter('unread'); setExpandedNotif(null); }}
                      >
                        Unread {unreadCount > 0 && `(${unreadCount})`}
                      </button>
                      <button 
                        className={`admin-notif-tab ${notificationFilter === 'urgent' ? 'active' : ''}`}
                        onClick={() => { setNotificationFilter('urgent'); setExpandedNotif(null); }}
                      >
                        Urgent {urgentTotal > 0 && `(${urgentTotal})`}
                      </button>
                    </div>
                  </div>
                  
                  {showNotificationSettings ? (
                    <div className="admin-notif-preferences">
                      <div className="flex items-center gap-3 mb-6">
                        <button className="notif-back-btn flex items-center gap-1" onClick={() => setShowNotificationSettings(false)}>
                          <ChevronLeft size={14} />
                          Back
                        </button>
                        <h6 className="mb-0 fw-bold text-slate-800 dark:text-slate-200">Nexus Routing Preferences</h6>
                      </div>
                      
                      <div className="admin-notif-preference-list">
                        {[
                          { key: 'credentialing', label: 'Credentialing', icon: <ShieldCheck size={16} /> },
                          { key: 'escalations', label: 'Escalations', icon: <ShieldAlert size={16} /> },
                          { key: 'systemHealth', label: 'System Health', icon: <Activity size={16} /> },
                          { key: 'appointments', label: 'Appointments', icon: <CalendarDays size={16} /> },
                        ].map(pref => (
                          <div key={pref.key} className="admin-notif-preference-row" onClick={() => {
                            setNotificationPreferences(prev => ({ ...prev, [pref.key]: !prev[pref.key] }));
                          }}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                {pref.icon}
                              </div>
                              <span>{pref.label} Alert Feed</span>
                            </div>
                            <label className="nexus-switch" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={notificationPreferences[pref.key]}
                                onChange={(event) => {
                                  const { checked } = event.target;
                                  setNotificationPreferences((current) => ({ ...current, [pref.key]: checked }));
                                }}
                              />
                              <span className="nexus-slider" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="admin-navbar-notificationlist scroll-smooth">
                      {loadingNotifications && notifications.length === 0 ? (
                        <div className="admin-navbar-empty py-12 text-center">
                          <div className="nexus-loading-spinner mb-4 mx-auto" />
                          <p className="fw-bold text-slate-400">SYNCHRONIZING NEXUS FEED...</p>
                        </div>
                      ) : filteredNotifications.length === 0 ? (
                        <div className="admin-navbar-empty py-16 text-center">
                          <CheckCircle size={40} className="mx-auto mb-4 opacity-10" />
                          <p className="mb-1 fw-bold text-slate-500">System Clear</p>
                          <span className="text-xs text-slate-400">No events detected in {notificationFilter} intelligence pool</span>
                        </div>
                      ) : (
                        filteredNotifications.slice(0, 10).map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`admin-navbar-notification ${notif.is_read ? 'read' : 'unread'} severity-${notif.metadata?.severity || 'info'} ${expandedNotif === notif.id ? 'expanded' : ''} ${resolvingId === notif.id ? 'notif-marking-success' : ''} ${notificationFilter === 'unread' && notif.is_read ? 'notif-exit' : ''}`}
                            onClick={() => {
                              if (expandedNotif !== notif.id) {
                                setExpandedNotif(notif.id);
                              }
                            }}
                          >
                            <div className="flex gap-3">
                              <div 
                                className={`notif-icon-box cursor-pointer hover:scale-110 transition-transform ${notif.metadata?.severity === 'critical' ? 'critical' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedNotif(expandedNotif === notif.id ? null : notif.id);
                                }}
                                title="Click to view details"
                              >
                                {getNotifIcon(notif.type, notif.metadata?.severity)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {notif.metadata?.severity === 'critical' && (
                                      <span className="notif-critical-badge">CRITICAL</span>
                                    )}
                                    <strong className="admin-navbar-notification-title">
                                      {notif.title}
                                    </strong>
                                    {!notif.is_read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />}
                                  </div>
                                  </div>
                                <p className="admin-navbar-notification-message">
                                  {(notif.message || notif.content || "").replace(/Dr\. Dr\./g, 'Dr.')}
                                </p>

                                {notif.metadata?.stats && (
                                  <div className="notif-stats-grid">
                                    <div className="stat-item">
                                      <span className="stat-label">Complaints</span>
                                      <span className="stat-value">{notif.metadata.stats.complaints || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                      <span className="stat-label">Risk Level</span>
                                      <span className="stat-value text-rose-600">{(notif.metadata.risk_level || 'CRITICAL').toUpperCase()}</span>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="admin-navbar-notification-meta">
                                  <div className="flex items-center gap-1.5 w-full justify-between">
                                    <div className="flex items-center gap-1" title={new Date(notif.created_at).toLocaleString()}>
                                      <Clock3 size={10} />
                                      <span>{formatRelativeTime(notif.created_at)}</span>
                                      <span className="opacity-40">•</span>
                                      <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {notif.metadata?.category && (
                                      <span className="admin-notif-tag">{notif.metadata.category}</span>
                                    )}
                                  </div>
                                </div>

                                {expandedNotif === notif.id && (
                                  <div className="notif-expanded-actions mt-3 pt-3 border-top flex items-center gap-2">
                                    <button 
                                      className="notif-quick-btn primary"
                                      onClick={(e) => { e.stopPropagation(); handleNotificationClick(notif); }}
                                    >
                                      Review Case
                                      <ExternalLink size={10} className="ml-1" />
                                    </button>
                                    <button 
                                      className={`notif-quick-btn ${notif.is_read ? 'success' : ''} ${resolvingId === notif.id ? 'opacity-70 cursor-default' : ''}`}
                                      disabled={resolvingId === notif.id || notif.is_read}
                                      onClick={(e) => { 
                                        if (notif.is_read) return;
                                        e.stopPropagation(); 
                                        handleMarkAsRead(notif.id); 
                                      }}
                                    >
                                      {notif.is_read ? (
                                        'Read'
                                      ) : resolvingId === notif.id ? (
                                        <>
                                          <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-1" />
                                          Reading...
                                        </>
                                      ) : (
                                        'Mark as Read'
                                      )}
                                    </button>
                                    {notif.metadata?.severity === 'critical' && (
                                      <button 
                                        className="notif-quick-btn border-rose-200 text-rose-600"
                                        onClick={(e) => { e.stopPropagation(); window.location.href = '/admin/review-management'; }}
                                      >
                                        Escalate
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {lastActionToast && (
                    <div className="admin-notif-toast">
                      <CheckCircle size={14} className="text-green-400" />
                      <span>{lastActionToast}</span>
                    </div>
                  )}
                  
                  {!showNotificationSettings && (
                    <div className="p-3 border-top bg-slate-50/50 flex justify-center">
                      <Link to="/admin/notifications" className="text-[10px] fw-bold text-blue-600 hover:text-blue-700 no-underline uppercase tracking-widest flex items-center gap-1">
                        Open Administrative Nexus Center
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>,
                document.body
              )}
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
              className="admin-navbar-iconbtn admin-navbar-logout"
              onClick={logout}
              aria-label="Logout"
            >
              <LogOut size={19} />
            </button>



            {profileOpen && createPortal(
              <div className="admin-navbar-popover admin-navbar-profilepanel" ref={overlayRef}>
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
              </div>,
              document.body
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

      <main className="admin-main-scroll flex-1 overflow-y-auto scroll-smooth px-4 pb-4 pt-4 sm:px-6 lg:px-6">
        <div className="admin-page-shell">
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
          flex: 1 1 auto;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 0 6px;
        }
        .admin-navbar-navshell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1 1 auto;
        }
        .admin-navbar-scrollbtn {
          width: 34px;
          height: 34px;
          border: 1px solid var(--nn-border);
          border-radius: 999px;
          background: color-mix(in srgb, var(--nn-surface) 92%, transparent);
          color: var(--nn-text-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          transition: all 0.2s ease;
        }
        .admin-navbar-scrollbtn:hover {
          color: var(--nn-text-main);
          border-color: color-mix(in srgb, var(--nn-primary) 35%, var(--nn-border));
          background: color-mix(in srgb, var(--nn-primary) 10%, var(--nn-surface));
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
        .admin-navbar-bell-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .admin-navbar-bell-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #ef4444;
          border: 2px solid var(--nn-surface);
          z-index: 10;
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
          position: fixed;
          top: 72px;
          right: 24px;
          border-radius: 20px;
          border: 1px solid var(--nn-border);
          background: #ffffff;
          box-shadow: 0 24px 50px rgba(2, 6, 23, 0.28);
          overflow: hidden;
          z-index: 999999;
        }
        .admin-theme-dark .admin-navbar-popover {
          background: #0f172a;
          border-color: #1e293b;
        }
        .admin-navbar-searchpanel {
          width: 320px;
        }
        .admin-navbar-notificationspanel,
        .admin-navbar-profilepanel {
          width: 340px;
        }
        .admin-navbar-notificationspanel {
          position: fixed;
          top: 72px;
          right: 24px;
          display: flex;
          flex-direction: column;
          width: min(420px, calc(100vw - 24px));
          max-height: min(620px, calc(100vh - 88px));
          background: #ffffff;
          z-index: 999999;
        }
        .admin-theme-dark .admin-navbar-notificationspanel {
          background: #111827;
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
        .admin-navbar-notificationlist {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
        }
        .admin-navbar-searchitem {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
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
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
        }

        .admin-notif-header {
          padding: 20px 20px 16px;
          background: #0f172a;
          color: white;
        }

        .notif-stat-pill.all {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          font-size: 10px;
          padding: 3px 10px;
          border-radius: 6px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .admin-notif-tabs {
          display: flex;
          gap: 6px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
          margin-top: 12px;
        }

        .admin-notif-tab {
          flex: 1;
          border: 0;
          background: transparent;
          padding: 8px 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .admin-notif-tab.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .admin-navbar-notificationlist {
          max-height: 480px;
          overflow-y: auto;
          padding: 10px;
          background: #f8fafc;
        }

        .admin-navbar-notification {
          background: white;
          padding: 16px;
          border-radius: 14px;
          margin-bottom: 10px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .admin-navbar-notification:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .admin-navbar-notification.unread {
          border-left: 4px solid #2563eb;
          background: #f0f7ff;
        }

        .admin-navbar-notification.severity-critical {
          border-left: 4px solid #ef4444;
          background: #fff5f5;
        }

        .admin-navbar-notification.severity-critical.unread {
          animation: critical-pulse 2s infinite;
        }

        @keyframes critical-pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .notif-critical-badge {
          background: #ef4444;
          color: white;
          font-size: 8px;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          animation: pulse-mini 1s infinite;
        }

        @keyframes pulse-mini {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }

        .notif-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin: 8px 0;
          padding: 8px;
          background: rgba(0,0,0,0.03);
          border-radius: 8px;
          font-size: 10px;
        }

        .admin-theme-dark .notif-stats-grid {
          background: rgba(255,255,255,0.05);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 8px; }
        .stat-value { color: #0f172a; font-weight: 800; }
        .admin-theme-dark .stat-value { color: #f1f5f9; }

        .notif-quick-btn {
          appearance: none !important;
          -webkit-appearance: none !important;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 800;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
          cursor: pointer;
          outline: none;
          line-height: 1;
        }

        .notif-quick-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .notif-quick-btn.primary {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .notif-quick-btn.primary:hover {
          background: #1d4ed8;
          box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
        }

        .notif-quick-btn.success {
          background: #f0fdf4;
          color: #166534;
          border-color: #bbf7d0;
        }

        .admin-theme-dark .notif-quick-btn.success {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          border-color: rgba(34, 197, 94, 0.2);
        }

        /* Success & Feedback Animations */
        .notif-marking-success {
          animation: resolve-glow 1s ease-out forwards;
        }

        @keyframes resolve-glow {
          0% { background: #f0f7ff; border-color: #2563eb; }
          40% { background: #f0fdf4; border-color: #22c55e; box-shadow: 0 0 20px rgba(34, 197, 94, 0.2); }
          100% { background: #ffffff; border-color: #e2e8f0; }
        }

        .notif-exit {
          animation: slide-fade-out 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes slide-fade-out {
          0% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(30px); height: 0; margin: 0; padding: 0; border: 0; }
        }

        .admin-notif-toast {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: white;
          padding: 8px 20px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          z-index: 100;
          animation: toast-in-out 2.5s ease-in-out forwards;
        }

        @keyframes toast-in-out {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          85% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }

        .admin-theme-dark .admin-notif-toast {
          background: #3b82f6;
        }

        .nexus-loading-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: nexus-spin 0.8s linear infinite;
        }
        @keyframes nexus-spin { to { transform: rotate(360deg); } }

        .admin-navbar-notification-title {
          display: block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #1f2937;
          font-size: 13.5px;
          font-weight: 750;
          line-height: 1.2;
        }
        .admin-navbar-notification.unread .admin-navbar-notification-title {
          color: #0f172a;
        }
        .admin-navbar-notification-message {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          overflow-wrap: anywhere;
          color: #64748b;
          font-size: 11.5px;
          line-height: 1.5;
          margin: 4px 0 8px;
        }
        .admin-navbar-notification.expanded .admin-navbar-notification-message {
          -webkit-line-clamp: unset;
        }
        .admin-navbar-notification-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4px;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .admin-notif-tag {
          padding: 2px 6px;
          border-radius: 4px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
        }
        /* Routing Preferences & Toggles */
        .admin-notif-preferences {
          padding: 1.25rem;
          background: #ffffff;
          border-radius: 0 0 24px 24px;
        }
        .admin-theme-dark .admin-notif-preferences {
          background: #0f172a;
        }

        .admin-notif-preference-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 1.5rem;
        }

        .admin-notif-preference-row {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 12px 16px !important;
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          width: 100% !important;
        }

        .admin-notif-preference-row:hover {
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
          transform: translateY(-1px);
        }

        .admin-theme-dark .admin-notif-preference-row {
          background: #1e293b !important;
          border-color: #334155 !important;
        }

        .admin-notif-preference-row span {
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          color: #334155 !important;
        }
        .admin-theme-dark .admin-notif-preference-row span {
          color: #94a3b8 !important;
        }

        /* Custom Switch */
        .nexus-switch {
          position: relative;
          display: inline-block;
          width: 36px;
          height: 20px;
        }

        .nexus-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .nexus-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #cbd5e1;
          transition: .3s;
          border-radius: 20px;
        }

        .nexus-slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        input:checked + .nexus-slider {
          background-color: #10b981;
        }

        input:checked + .nexus-slider:before {
          transform: translateX(16px);
        }

        .notif-back-btn {
          padding: 6px 12px;
          border-radius: 8px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          font-size: 0.7rem;
          font-weight: 800;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .notif-back-btn:hover {
          background: #e2e8f0;
          transform: translateX(-2px);
        }

        .admin-theme-dark .admin-navbar-notificationspanel {
          background: #0f172a;
          border-color: #1e293b;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
        }

        .admin-theme-dark .admin-navbar-notification {
          background: #1e293b;
          border-color: #334155;
        }

        .admin-theme-dark .admin-navbar-notification:hover {
          background: #27374d;
          border-color: #475569;
        }

        .admin-theme-dark .admin-navbar-notification-title {
          color: white;
        }

        .admin-theme-dark .admin-navbar-notification-message {
          color: #94a3b8;
        }

        .admin-theme-dark .admin-navbar-notificationlist {
          background: #0f172a;
        }

        .admin-theme-dark .admin-notif-tabs {
          background: #1e293b;
        }

        .admin-theme-dark .admin-notif-tab.active {
          background: #0f172a;
          color: white;
        }

        .admin-theme-dark .notif-quick-btn {
          background: #1e293b;
          border-color: #334155;
          color: #94a3b8;
        }

        .admin-theme-dark .notif-icon-box {
          background: #334155;
          color: #94a3b8;
        }
        .notif-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #e2e8f0;
          transition: transform 0.2s ease;
        }
        .admin-navbar-notification:hover .notif-icon-box {
          transform: scale(1.05);
        }
        .notif-icon-box.critical {
          background: #fff1f2;
          border-color: #fecdd3;
        }
        .notif-action-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 0;
          background: transparent;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .notif-action-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }
        .severity-critical {
          border-left: 3px solid #f43f5e !important;
        }
        .severity-warning {
          border-left: 3px solid #f59e0b !important;
        }
        .admin-navbar-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          color: #94a3b8;
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
          .admin-navbar-navshell {
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
