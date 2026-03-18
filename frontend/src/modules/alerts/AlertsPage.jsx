import React, { useEffect, useMemo, useState } from "react";
import { Bell, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { getAlerts, acknowledgeAlert } from "../../api/alerts";
import { initSocket, getSocket } from "../../services/socket";
import { getUser } from "../../utils/auth";

const severityStyles = {
  critical: { bg: "#FEE2E2", border: "#DC2626", label: "Critical", icon: <AlertTriangle size={18} className="me-2" /> },
  warning: { bg: "#FFFBEB", border: "#F59E0B", label: "Warning", icon: <Clock size={18} className="me-2" /> },
  info: { bg: "#E0F2FE", border: "#0EA5E9", label: "Info", icon: <Bell size={18} className="me-2" /> },
};

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return "—";
  }
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = getUser();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleAck = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, is_acknowledged: true } : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const counts = useMemo(() => {
    const summary = { critical: 0, warning: 0, info: 0, acknowledged: 0 };
    alerts.forEach((a) => {
      const key = a.severity.toLowerCase();
      if (summary[key] != null) summary[key] += 1;
      if (a.is_acknowledged) summary.acknowledged += 1;
    });
    return summary;
  }, [alerts]);

  useEffect(() => {
    fetchAlerts();

    const socket = initSocket();
    if (!socket) return;

    const onCritical = (payload) => {
      setAlerts((prev) => [payload, ...prev]);
    };

    socket.on("critical_alert", onCritical);

    return () => {
      socket.off("critical_alert", onCritical);
    };
  }, []);

  return (
    <div className="py-3">
      <header className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h2 fw-black">Clinical Alerts Dashboard</h1>
          <p className="text-secondary mb-0">Real-time patient monitoring and critical events.</p>
        </div>
        <div className="d-flex gap-2">
          <div className="card border-0 shadow-sm rounded-4 p-3" style={{ minWidth: 160, background: "#FEE2E2" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="text-uppercase fw-bold small">Active Critical</div>
              <div className="rounded-circle bg-white p-2" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <AlertTriangle size={18} className="text-danger" />
              </div>
            </div>
            <div className="fs-2 fw-bold text-danger">{counts.critical}</div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-3" style={{ minWidth: 160, background: "#FFFBEB" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="text-uppercase fw-bold small">Warning</div>
              <div className="rounded-circle bg-white p-2" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <Clock size={18} className="text-warning" />
              </div>
            </div>
            <div className="fs-2 fw-bold text-warning">{counts.warning}</div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-3" style={{ minWidth: 160, background: "#E0F2FE" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="text-uppercase fw-bold small">Total Acknowledged</div>
              <div className="rounded-circle bg-white p-2" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <CheckCircle2 size={18} className="text-info" />
              </div>
            </div>
            <div className="fs-2 fw-bold text-info">{counts.acknowledged}</div>
          </div>
        </div>
      </header>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column">
            <div className="card-body p-4 d-flex flex-column" style={{ minHeight: 0 }}>
              <h3 className="h5 fw-bold mb-3 flex-shrink-0">Active Critical Alerts</h3>
              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: "calc(100vh - 450px)", scrollBehavior: "smooth" }}>
                {loading ? (
                  <div className="text-center text-secondary py-5">Loading alerts…</div>
                ) : alerts.filter((a) => a.severity.toLowerCase() === "critical" && !a.is_acknowledged).length === 0 ? (
                  <div className="text-center text-secondary py-5">
                    <div className="display-6 mb-2 text-success">✔</div>
                    <div className="fw-bold">Monitoring Stable</div>
                    <div>No critical alerts requiring immediate attention.</div>
                  </div>
                ) : (
                  alerts
                    .filter((a) => a.severity.toLowerCase() === "critical" && !a.is_acknowledged)
                    .map((alert) => {
                      const style = severityStyles[alert.severity.toLowerCase()] || severityStyles.info;
                      return (
                        <div key={alert.id} className="d-flex align-items-start gap-3 mb-3 p-3 rounded-4" style={{ background: style.bg, borderLeft: `6px solid ${style.border}` }}>
                          <div className="mt-1">{style.icon}</div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-bold">{alert.vital_type} Critical</div>
                                <div className="text-secondary small">{formatTime(alert.created_at)}</div>
                              </div>
                                {user?.role !== "patient" && (
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleAck(alert.id)}
                                  >
                                    Acknowledge
                                  </button>
                                )}
                            </div>
                            <div className="text-secondary mt-2">{alert.message}</div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column">
            <div className="card-body p-4 d-flex flex-column" style={{ minHeight: 0 }}>
              <h3 className="h5 fw-bold mb-3 flex-shrink-0">Alert History</h3>
              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: "calc(100vh - 450px)", scrollBehavior: "smooth" }}>
                {loading ? (
                  <div className="text-center text-secondary py-5">Loading alerts…</div>
                ) : alerts.length === 0 ? (
                  <div className="text-center text-secondary py-5">No historic alerts</div>
                ) : (
                  <div className="list-group">
                    {alerts.slice(0, 20).map((alert) => {
                      const style = severityStyles[alert.severity.toLowerCase()] || severityStyles.info;
                      return (
                        <div key={alert.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-bold">{alert.vital_type}</div>
                            <div className="small text-secondary">{formatTime(alert.created_at)}</div>
                            <div className="small mt-1">{alert.message}</div>
                          </div>
                          <span className="badge rounded-pill" style={{ background: style.border, color: "white" }}>
                            {alert.is_acknowledged ? "ACK" : style.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
