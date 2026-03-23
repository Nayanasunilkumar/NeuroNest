import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import DynamicIslandNav from "../components/DynamicIslandNav";
import { logout } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, LogOut, Bell } from "lucide-react";
import { getAlerts, acknowledgeAlert } from "../api/alerts";
import { getMyNotifications, markNotificationRead } from "../api/profileApi";
import { initSocket } from "../services/socket";

const PatientLayout = () => {
    const { isDark: darkMode, toggleTheme } = useTheme();
    const location = useLocation();

    const [alertCount, setAlertCount] = React.useState(0);
    const [alerts, setAlerts] = React.useState([]);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const notificationRef = React.useRef(null);

    const isMessagePath = location.pathname.includes('/messages');
    const isSettingsPath = location.pathname.includes('/settings');
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
                    getAlerts(true),
                    getMyNotifications(true)
                ]);
                
                const readAlertIds = getReadAlerts();
                const filteredAlertsData = (alertsData || []).filter(a => !readAlertIds.includes(a.id));
                
                const merged = [
                    ...filteredAlertsData.map(a => ({ ...a, type: 'alert' })),
                    ...(notificationsData || []).map(n => ({ ...n, type: 'notification' }))
                ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                setAlerts(merged);
                setAlertCount(merged.length);
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

    // Handle click outside to close dropdown
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAcknowledge = async (item) => {
        try {
            if (item.type === 'alert') {
                // For patients, we only "mark as read" locally to hide from bell,
                // but we DON'T acknowledge in the backend (doctors must do that).
                markAlertAsReadLocally(item.id);
            } else {
                await markNotificationRead(item.id);
            }
            setAlerts((prev) => prev.filter((a) => a.id !== item.id));
            setAlertCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to acknowledge notification", err);
        }
    };

    return (
        <div className="vh-100 d-flex flex-column overflow-hidden" style={{ transition: 'all 0.3s' }}>
            {/* Navbar */}
            <header className="navbar navbar-expand-lg sticky-top border-bottom shadow-sm px-3" style={{ height: '80px', zIndex: 1050, background: 'var(--nn-nav-bg)', backdropFilter: 'blur(10px)', borderColor: 'var(--nn-border)' }}>
                <div className="container-fluid align-items-center flex-nowrap">
                    {/* Left: Branding */}
                    <div className="d-flex align-items-center flex-shrink-0 me-3 me-xl-5">
                        <span className="h4 fw-black mb-0 text-primary" style={{ letterSpacing: '-0.05em' }}>NEURONEST</span>
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

                        <div className="position-relative" ref={notificationRef}>
                            <button 
                                className={`btn p-2 rounded-circle border-0 d-none d-sm-flex align-items-center justify-content-center position-relative transition-all ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary opacity-75'} ${showNotifications ? 'bg-primary bg-opacity-10' : ''}`} 
                                style={{ width: '40px', height: '40px' }}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} />
                                {alertCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-2 border-white" style={{ fontSize: '0.62rem', padding: '0.25em 0.5em', minWidth: '1.6em' }}>
                                        {alertCount > 99 ? '99+' : alertCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="position-absolute top-100 end-0 mt-2 shadow-lg rounded-4 overflow-hidden border-0" 
                                    style={{ 
                                        width: '320px', 
                                        zIndex: 1100, 
                                        background: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(16px)',
                                        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                                        animation: 'fadeInSlide 0.2s ease-out'
                                    }}>
                                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                        <h6 className="mb-0 fw-black text-uppercase small tracking-wider" style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>Notifications</h6>
                                        <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary small fw-bold" style={{ fontSize: '0.65rem' }}>{alertCount} New</span>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '400px' }}>
                                        {alerts.length > 0 ? (
                                            alerts.map((item) => (
                                                <div key={item.id} className="p-3 border-bottom hover-bg transition-all" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', background: item.severity === 'CRITICAL' ? (darkMode ? 'rgba(220,53,69,0.05)' : 'rgba(220,53,69,0.02)') : 'transparent' }}>
                                                    <div className="d-flex justify-content-between gap-2 mb-1">
                                                        <span className={`fw-bold small ${item.severity === 'CRITICAL' ? 'text-danger' : 'text-primary'}`}>
                                                            {item.type === 'alert' ? `${item.vital_type} Critical` : (item.title || 'Notification')}
                                                        </span>
                                                        <span className="text-secondary" style={{ fontSize: '0.65rem' }}>
                                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="small text-secondary mb-2 lh-sm" style={{ fontSize: '0.75rem' }}>{item.message}</p>
                                                    <button 
                                                        onClick={() => handleAcknowledge(item)}
                                                        className="btn btn-sm p-0 text-primary fw-bold text-decoration-none" 
                                                        style={{ fontSize: '0.7rem' }}
                                                    >
                                                        Mark as read
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-5 text-center text-secondary opacity-50">
                                                <Bell size={24} className="mb-2" />
                                                <p className="small mb-0">No new notifications</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 text-center bg-light bg-opacity-5 border-top" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                        <Link 
                                            to="/patient/alerts" 
                                            onClick={() => setShowNotifications(false)}
                                            className="btn btn-link btn-sm text-secondary text-decoration-none fw-bold w-100" 
                                            style={{ fontSize: '0.7rem' }}
                                        >
                                            View all activity
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            className="btn btn-danger-soft rounded-circle p-2 border-0 shadow-sm transition-all d-flex align-items-center justify-content-center"
                            onClick={logout}
                            title="Logout"
                            style={{ width: '40px', height: '40px' }}
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
                    className={`flex-grow-1 d-flex flex-column ${isMessagePath ? 'overflow-hidden' : 'overflow-auto'} position-relative ${isMessagePath ? 'p-0' : (isSettingsPath ? 'p-0' : 'p-3 p-md-4 p-lg-5')}`}
                    style={{ transition: 'all 0.4s' }}
                >
                    <div className={isMessagePath ? 'h-100' : 'container-fluid max-w-1600 mx-auto pb-5 pb-lg-0'}>
                        <Outlet />
                    </div>
                </main>
            </div>

            <style>{`
                .fw-black { font-weight: 950; }
                .shadow-xs { box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
                .max-w-400 { max-width: 400px; }
                .max-w-1600 { max-width: 1600px; }
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
                .hover-bg:hover {
                    background: ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} !important;
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