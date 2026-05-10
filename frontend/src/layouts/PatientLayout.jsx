import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import DynamicIslandNav from "../shared/components/DynamicIslandNav";
import { logout } from "../shared/utils/auth";
import { useTheme } from "../shared/context/ThemeContext";
import { useSystemConfig } from "../shared/context/SystemConfigContext";
import { Sun, Moon, LogOut, Bell, UserCircle, ChevronDown } from "lucide-react";
import { getAlerts, acknowledgeAlert } from "../shared/services/api/alerts";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "../shared/services/api/profileApi";
import { initSocket } from "../shared/services/socket";
import NotificationPanel from "../shared/components/notifications/NotificationPanel";
import { useNavigate } from "react-router-dom";

const PatientLayout = () => {
    const { isDark: darkMode, toggleTheme } = useTheme();
    const { platformName } = useSystemConfig();
    const location = useLocation();
    const navigate = useNavigate();

    const [alertCount, setAlertCount] = React.useState(0);
    const [alerts, setAlerts] = React.useState([]);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const notificationRef = React.useRef(null);
    const userMenuRef = React.useRef(null);

    const isMessagePath = location.pathname.includes('/messages');
    const READ_ALERTS_KEY = 'neuronest_read_alerts';

    const getReadAlerts = () => {
        try {
            return JSON.parse(localStorage.getItem(READ_ALERTS_KEY) || '[]');
        } catch {
            return [];
        }
    };

    const markAlertAsReadLocally = (id) => {
        const read = getReadAlerts();
        if (!read.includes(id)) {
            localStorage.setItem(READ_ALERTS_KEY, JSON.stringify([...read, id]));
        }
    };
    React.useEffect(() => {
        const fetchCount = async () => {
            try {
                const [alertsData, notificationsData] = await Promise.all([
                    getAlerts(false), // Fetch all for grouping
                    getMyNotifications(false) 
                ]);
                
                const readAlertIds = getReadAlerts();
                
                const merged = [
                    ...(alertsData || []).map(a => ({ 
                      ...a, 
                      type: 'alert',
                      is_read: readAlertIds.includes(a.id),
                      title: `${a.vital_type} Critical Alert`,
                    })),
                    ...(notificationsData || []).map(n => ({ ...n, type: n.type || 'notification' }))
                ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                setAlerts(merged);
                setAlertCount(merged.filter(a => !a.is_read).length);
            } catch {
                // ignore
            }
        };

        fetchCount();

        const socket = initSocket();
        if (!socket) return;

        const onCritical = (alert) => {
            const alertWithType = { ...alert, type: 'alert' };
            setAlerts((prev) => [alertWithType, ...prev]);
            setAlertCount((prev) => prev + 1);
        };
        socket.on("critical_alert", onCritical);

        return () => {
            socket.off("critical_alert", onCritical);
        };
    }, []);

    React.useEffect(() => {
        if (showNotifications && alerts.some(a => !a.is_read)) {
            handleMarkAllRead();
        }
    }, [showNotifications]);

    // Handle click outside to close dropdown
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                if (event.target.closest('.notification-panel-wrapper')) return;
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAcknowledge = async (id) => {
        try {
            const item = alerts.find(a => a.id === id);
            if (!item) return;

            if (item.type === 'alert') {
                markAlertAsReadLocally(item.id);
            } else {
                await markNotificationRead(item.id);
            }
            setAlerts((prev) => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
            setAlertCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to acknowledge notification", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            // Also mark alerts as read locally
            alerts.filter(a => a.type === 'alert').forEach(a => markAlertAsReadLocally(a.id));
            
            setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
            setAlertCount(0);
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            const item = alerts.find(a => a.id === id);
            if (item?.type !== 'alert') {
                await deleteNotification(id);
            }
            setAlerts(prev => prev.filter(a => a.id !== id));
            // Recalculate unread count
            const remaining = alerts.filter(a => a.id !== id && !a.is_read);
            setAlertCount(remaining.length);
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    return (
        <div className="vh-100 d-flex flex-column overflow-hidden patient-layout-root" style={{ transition: 'all 0.3s' }}>
            {/* Navbar */}
            <header className="navbar-premium sticky-top" style={{ zIndex: 1050 }}>
                <div className="container-fluid h-100 d-flex align-items-center justify-content-between px-4">
                    {/* Left: Branding */}
                    <div className="d-flex align-items-center flex-shrink-0">
                        <Link to="/patient/dashboard" className="text-decoration-none d-flex align-items-center">
                            <span className="logo-text">{(platformName || 'NeuroNest').toUpperCase()}</span>
                        </Link>
                    </div>

                    {/* Center: Dynamic Island Navigation */}
                    <div className="nav-island-center d-none d-lg-flex">
                        <DynamicIslandNav role="patient" />
                    </div>

                    {/* Right Actions */}
                    <div className="d-flex align-items-center gap-3 flex-shrink-0">
                        <button 
                            className="premium-action-btn"
                            onClick={toggleTheme}
                            title="Toggle Theme"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="position-relative" ref={notificationRef}>
                            <button 
                                className={`premium-action-btn ${showNotifications ? 'active' : ''}`}
                                onClick={() => setShowNotifications(!showNotifications)}
                                title="Notifications"
                            >
                                <Bell size={20} />
                                {alertCount > 0 && (
                                    <span className="notification-badge">
                                        {alertCount > 99 ? '99+' : alertCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <NotificationPanel 
                                    notifications={alerts}
                                    darkMode={darkMode}
                                    onMarkAllRead={handleMarkAllRead}
                                    onMarkRead={handleAcknowledge}
                                    onDelete={handleDelete}
                                    onClose={() => setShowNotifications(false)}
                                    portal
                                    anchorRef={notificationRef}
                                    onNavigate={(link) => {
                                        setShowNotifications(false);
                                        navigate(link);
                                    }}
                                />
                            )}
                        </div>

                        {/* Dedicated Logout Button */}
                        <button 
                            className="premium-action-btn logout"
                            onClick={logout}
                            title="Logout"
                        >
                            <LogOut size={20} />
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
                    className={`flex-grow-1 d-flex flex-column ${isMessagePath ? 'overflow-hidden' : 'overflow-auto'} position-relative p-0`}
                    style={{ transition: 'all 0.4s' }}
                >
                    <div className={isMessagePath ? 'h-100 p-2 p-md-3 p-lg-4' : 'container-fluid max-w-1600 mx-auto p-2 p-md-3 p-lg-4'}>
                        <div className={`patient-page-shell ${isMessagePath ? 'patient-page-shell-chat h-100' : ''}`}>
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                .navbar-premium {
                    height: 80px;
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }
                .dark .navbar-premium {
                    background: rgba(15, 23, 42, 0.75);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .logo-text {
                    font-size: 1.5rem;
                    font-weight: 950;
                    color: #2563eb;
                    letter-spacing: -0.05em;
                }
                .nav-island-center {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                }
                .premium-action-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    background: rgba(255, 255, 255, 0.8);
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .dark .premium-action-btn {
                    background: rgba(30, 41, 59, 0.8);
                    border-color: rgba(255, 255, 255, 0.05);
                    color: #94a3b8;
                }
                .premium-action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    color: #2563eb;
                    background: #fff;
                    border-color: rgba(37, 99, 235, 0.1);
                }
                .dark .premium-action-btn:hover {
                    background: #1e293b;
                    color: #60a5fa;
                    border-color: rgba(96, 165, 250, 0.1);
                }
                .premium-action-btn.active {
                    background: rgba(37, 99, 235, 0.05);
                    color: #2563eb;
                    border-color: rgba(37, 99, 235, 0.2);
                }
                .premium-action-btn.logout:hover {
                    background: rgba(239, 68, 68, 0.05);
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.1);
                }
                .notification-badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    transform: translate(25%, -25%);
                    background: #ef4444;
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 2px 5px;
                    border-radius: 999px;
                    border: 2px solid #fff;
                    min-width: 18px;
                }
                .dark .notification-badge {
                    border-color: #0f172a;
                }
                .fw-black { font-weight: 950; }
                .max-w-1600 { max-width: 1600px; }
                .patient-layout-root {
                    background: #f4f7fb;
                }
                .dark .patient-layout-root {
                    background:
                        radial-gradient(1200px 420px at 80% -10%, rgba(59, 130, 246, 0.14), transparent 55%),
                        radial-gradient(900px 360px at 10% 0%, rgba(99, 102, 241, 0.12), transparent 58%),
                        var(--nn-bg);
                }
                .patient-page-shell {
                    background: var(--nn-surface);
                    border: 1px solid var(--nn-border);
                    border-radius: 36px;
                    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
                    min-height: calc(100vh - 156px);
                    padding: clamp(16px, 1.8vw, 28px);
                }
                .patient-page-shell-chat {
                    min-height: calc(100vh - 150px);
                    padding: 0;
                    overflow: hidden;
                }
                .dark .patient-page-shell {
                    background:
                        linear-gradient(180deg, rgba(30, 41, 59, 0.94), rgba(15, 23, 42, 0.9));
                    border-color: #334155;
                    box-shadow:
                        0 22px 42px rgba(2, 6, 23, 0.45),
                        inset 0 1px 0 rgba(148, 163, 184, 0.08);
                }
                @media (max-width: 992px) {
                    .patient-page-shell {
                        border-radius: 24px;
                        min-height: calc(100vh - 210px);
                        padding: 14px;
                    }
                    .patient-page-shell-chat {
                        padding: 0;
                        min-height: calc(100vh - 175px);
                    }
                }
                @keyframes fadeInSlide {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PatientLayout;
