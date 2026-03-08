import React, { useState, useEffect } from "react";
import { Activity, Calendar, Bell, Heart, TrendingUp, ShieldCheck, Clock, X } from "lucide-react";
import { getMyNotifications, markNotificationRead } from "../../api/profileApi";
import { Link } from "react-router-dom";

const DashboardHome = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getMyNotifications(true);
                setNotifications(data || []);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };
        fetchNotifications();
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const stats = [
        { label: "Health Score", value: "94/100", icon: <Heart size={20} />, color: "danger", trend: "+2%" },
        { label: "Active Plans", value: "3", icon: <Activity size={20} />, color: "primary", trend: "On track" },
        { label: "Next Checkup", value: "In 4 Days", icon: <Calendar size={20} />, color: "success", trend: "Scheduled" },
    ];

    return (
        <div className="py-2">
            {/* Welcome Section */}
            <div className="nn-card nn-gradient-bg mb-6 position-relative border-0">
                <div className="p-6 position-relative z-1">
                    <h1 className="text-page-title text-white mb-2">Welcome back, Jane 👋</h1>
                    <p className="text-body text-white opacity-75 mb-6">Your health journey is progressing beautifully. Here's your overview for today.</p>
                    <div className="d-flex flex-wrap gap-4">
                        <button className="nn-btn" style={{ background: 'white', color: 'var(--nn-primary)' }}>View Health Report</button>
                        <button className="nn-btn nn-btn-secondary" style={{ background: 'transparent', color: 'white', borderColor: 'white' }}>Emergency SOS</button>
                    </div>
                </div>
                <div className="position-absolute top-0 end-0 opacity-10 p-5 d-none d-lg-block">
                    <Activity size={200} strokeWidth={1} />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="row g-4 mb-6">
                {stats.map((stat, i) => (
                    <div key={i} className="col-12 col-md-4">
                        <div className="nn-metric-card d-flex flex-column h-100 justify-content-between">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className={`text-${stat.color}`}>
                                    {stat.icon}
                                </div>
                                <span className={`nn-badge ${stat.color === 'danger' ? 'nn-badge-danger' : stat.color === 'success' ? 'nn-badge-success' : 'nn-badge-info'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div>
                                <div className="text-small text-uppercase fw-bold mb-1">{stat.label}</div>
                                <div className="text-section-title">{stat.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Sections Grid */}
            <div className="row g-4">
                {/* Health Summary */}
                <div className="col-12 col-lg-8">
                    <div className="nn-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="text-card-title m-0">Health Summary</h2>
                            <button className="nn-btn text-primary p-0 bg-transparent border-0">Detailed Analysis</button>
                        </div>
                        
                        <div className="p-8 text-center bg-light rounded-4 border border-dashed text-secondary">
                            <TrendingUp size={48} className="mb-4 opacity-25" />
                            <h3 className="text-card-title mb-2">Vitality Metrics Loading...</h3>
                            <p className="text-body mb-0">We're synchronizing your latest clinic results from the South Sector lab.</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity / Alerts */}
                <div className="col-12 col-lg-4">
                    <div className="nn-card h-100">
                        <h2 className="text-card-title mb-4 m-0">Reminders & Alerts</h2>
                        <div className="d-flex flex-column gap-3">
                            {notifications.length > 0 ? (
                                notifications.map(n => {
                                    const isUrgent = n.message.toLowerCase().includes("urgent") || n.message.toLowerCase().includes("priority");
                                    const isActionRequired = n.type === 'appointment_rescheduled';
                                    
                                    return (
                                        <div key={n.id} className={`d-flex gap-3 align-items-start p-3 rounded-3 border-start border-4 ${isUrgent ? 'bg-danger bg-opacity-10 border-danger' : isActionRequired ? 'bg-warning bg-opacity-10 border-warning' : 'bg-primary bg-opacity-10 border-primary'}`}>
                                            {isUrgent ? <ShieldCheck size={20} className="text-danger mt-1" /> : isActionRequired ? <Clock size={20} className="text-warning mt-1" /> : <Bell size={20} className="text-primary mt-1" />}
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <div className="text-small fw-bold d-flex align-items-center gap-2">
                                                        {n.title}
                                                        {isUrgent && <span className="nn-badge nn-badge-danger">PRIORITY</span>}
                                                    </div>
                                                    <button onClick={() => handleMarkRead(n.id)} className="btn btn-link p-0 text-muted" title="Dismiss"><X size={14}/></button>
                                                </div>
                                                <p className="text-small text-secondary mb-2 lh-sm">{n.message}</p>
                                                {isActionRequired && (
                                                    <Link to="/patient/appointments" className="nn-badge nn-badge-warning text-decoration-none">Review New Time</Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <>
                                    <div className="d-flex gap-3 align-items-start p-3 rounded-4 bg-primary bg-opacity-10 border-start border-4 border-primary">
                                        <ShieldCheck size={20} className="text-primary mt-1" />
                                        <div>
                                            <div className="text-small fw-bold">Insurance Verified</div>
                                            <p className="text-small text-secondary mb-0">Your medical coverage has been updated for the 2026 term.</p>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-3 align-items-start p-3 rounded-4 bg-light">
                                        <Calendar size={20} className="text-secondary mt-1" />
                                        <div>
                                            <div className="text-small fw-bold text-muted">No recent alerts</div>
                                            <p className="text-small text-secondary mb-0 opacity-50">You're all caught up with your notifications.</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .btn-white { background: white; color: #0d6efd; }
                .btn-white:hover { background: #f8f9fa; transform: scale(1.05); }
                .fw-black { font-weight: 950; }
                .hover-translate-y:hover { transform: translateY(-5px); }
                .border-dashed { border-style: dashed !important; }
            `}</style>
        </div>
    );
};

export default DashboardHome;
