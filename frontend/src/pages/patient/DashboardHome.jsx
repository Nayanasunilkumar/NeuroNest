import React, { useEffect, useState } from "react";
import {
  Activity,
  Calendar,
  Heart,
  TrendingUp,
  ShieldCheck,
  Clock,
  Bell,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMyNotifications, markNotificationRead } from "../../api/profileApi";
import { useLiveVitals } from "../../hooks/useLiveVitals";
import { getUser } from "../../utils/auth";
import LiveVitalsPanel from "../../components/LiveVitalsPanel";

const DashboardHome = () => {
  const [notifications, setNotifications] = useState([]);
  const currentUser = getUser();
  const { latest, history, loading, error } = useLiveVitals();

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
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const stats = [
    { label: "Health Score", value: "94/100", icon: <Heart size={20} />, color: "danger", trend: "+2%" },
    { label: "Active Plans", value: "3", icon: <Activity size={20} />, color: "primary", trend: "On track" },
    { label: "Next Checkup", value: "In 4 Days", icon: <Calendar size={20} />, color: "success", trend: "Scheduled" },
  ];

  const firstName = currentUser?.full_name?.split(" ")?.[0] || "there";

  return (
    <div className="py-2">
      <div
        className="card border-0 rounded-4 overflow-hidden mb-5 shadow-sm"
        style={{ background: "linear-gradient(135deg, #0d6efd, #6610f2)" }}
      >
        <div className="card-body p-3 p-md-4 text-white position-relative">
          <div className="position-relative z-1">
            <h1 className="display-6 fw-black mb-2" style={{ letterSpacing: "-1px" }}>
              Welcome back, {firstName}
            </h1>
            <p className="lead opacity-75 mb-3 fw-medium">
              Your health journey is progressing beautifully. Here&apos;s your realtime overview for today.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <button className="btn btn-white rounded-pill px-4 fw-bold shadow-sm border-0">
                View Health Report
              </button>
              <button className="btn btn-outline-light rounded-pill px-4 fw-bold">
                Emergency SOS
              </button>
            </div>
          </div>
          <div className="position-absolute top-0 end-0 opacity-10 p-5 d-none d-lg-block">
            <Activity size={200} strokeWidth={1} />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <LiveVitalsPanel
          title="Live Vitals Monitor"
          subtitle="Streaming securely from your paired NeuroNest device"
          latest={latest}
          history={history}
          loading={loading}
          error={error}
        />
      </div>

      <div className="row g-4 mb-5">
        {stats.map((stat) => (
          <div key={stat.label} className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 hover-translate-y">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className={`bg-${stat.color} bg-opacity-10 text-${stat.color} p-3 rounded-4`}>
                    {stat.icon}
                  </div>
                  <span className="badge rounded-pill bg-light text-secondary small fw-bold px-2 py-1">
                    {stat.trend}
                  </span>
                </div>
                <div
                  className="small fw-bold text-uppercase text-secondary mb-1"
                  style={{ fontSize: "0.7rem", letterSpacing: "1px" }}
                >
                  {stat.label}
                </div>
                <div className="h3 fw-black text-dark mb-0">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h5 fw-black text-dark mb-0">Health Summary</h2>
                <button className="btn btn-link text-primary text-decoration-none fw-bold p-0">
                  Detailed Analysis
                </button>
              </div>
              <div className="p-5 text-center bg-light rounded-4 border border-dashed text-secondary">
                <TrendingUp size={48} className="mb-3 opacity-25" />
                <h3 className="h6 fw-bold mb-1">Realtime monitoring enabled</h3>
                <p className="small mb-0">
                  Your latest device reading is now available securely across your NeuroNest dashboards.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-black text-dark mb-4">Reminders & Alerts</h2>
              <div className="d-flex flex-column gap-3">
                {notifications.length > 0 ? (
                  notifications.map((notification) => {
                    const message = notification.message || "";
                    const isUrgent =
                      message.toLowerCase().includes("urgent") ||
                      message.toLowerCase().includes("priority");
                    const isActionRequired = notification.type === "appointment_rescheduled";

                    return (
                      <div
                        key={notification.id}
                        className={`d-flex gap-3 align-items-start p-3 rounded-4 border-start border-4 ${
                          isUrgent
                            ? "bg-danger bg-opacity-10 border-danger"
                            : isActionRequired
                              ? "bg-warning bg-opacity-10 border-warning"
                              : "bg-primary bg-opacity-10 border-primary"
                        }`}
                      >
                        {isUrgent ? (
                          <ShieldCheck size={20} className="text-danger mt-1" />
                        ) : isActionRequired ? (
                          <Clock size={20} className="text-warning mt-1" />
                        ) : (
                          <Bell size={20} className="text-primary mt-1" />
                        )}
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <div className="fw-bold small text-dark d-flex align-items-center gap-2">
                              {notification.title}
                              {isUrgent && (
                                <span className="badge bg-danger rounded-pill" style={{ fontSize: "0.6rem" }}>
                                  PRIORITY
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleMarkRead(notification.id)}
                              className="btn btn-link p-0 text-muted"
                              title="Dismiss"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="small text-secondary mb-2 lh-sm">{notification.message}</p>
                          {isActionRequired && (
                            <Link
                              to="/patient/appointments"
                              className="btn btn-warning btn-sm py-0 px-2 rounded-pill fw-bold"
                              style={{ fontSize: "0.7rem" }}
                            >
                              Review New Time
                            </Link>
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
                        <div className="fw-bold small text-dark">Live monitoring active</div>
                        <p className="small text-secondary mb-0">
                          Your paired device will automatically stream vitals to your care team.
                        </p>
                      </div>
                    </div>
                    <div className="d-flex gap-3 align-items-start p-3 rounded-4 bg-light">
                      <Calendar size={20} className="text-secondary mt-1" />
                      <div>
                        <div className="fw-bold small text-dark text-muted">No recent alerts</div>
                        <p className="small text-secondary mb-0 opacity-50">
                          You&apos;re all caught up with your notifications.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .btn-white { background: white; color: #0d6efd; }
        .btn-white:hover { background: #f8f9fa; transform: scale(1.05); }
        .fw-black { font-weight: 950; }
        .hover-translate-y { transition: transform 0.2s; }
        .hover-translate-y:hover { transform: translateY(-4px); }
        .border-dashed { border-style: dashed !important; }
      `}</style>
    </div>
  );
};

export default DashboardHome;
