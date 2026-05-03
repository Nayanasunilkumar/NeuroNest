import React, { useEffect, useMemo, useState } from "react";
import { Bell, AlertTriangle, CheckCircle2, Clock, Activity } from "lucide-react";
import { getAlerts, acknowledgeAlert } from "../../shared/services/alerts";
import { initSocket, getSocket } from "../../services/socket";
import { getUser } from "../../shared/utils/auth";
import { getLatestVitals } from "../../shared/services/vitals";

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
  const [status, setStatus] = useState(null); // 'ok', 'no_device', etc.
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch = alert.message?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            alert.vital_type?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || alert.vital_type === activeCategory;
      
      // Date filtering
      const alertDate = new Date(alert.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let matchesDate = true;
      if (dateFilter === "Today") {
        matchesDate = alertDate >= today;
      } else if (dateFilter === "Yesterday") {
        matchesDate = alertDate >= yesterday && alertDate < today;
      } else if (dateFilter === "Last 7 Days") {
        matchesDate = alertDate >= sevenDaysAgo;
      } else if (dateFilter === "Custom Range" && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of the day
        matchesDate = alertDate >= start && alertDate <= end;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [alerts, searchQuery, activeCategory, dateFilter, startDate, endDate]);

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

    // Check device status
    const checkStatus = async () => {
      try {
        const vitals = await getLatestVitals();
        setStatus(vitals?.signal || 'na');
      } catch (err) {
        console.error("Failed to check device status", err);
      }
    };
    checkStatus();

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
        
        {status !== "no_device" && (
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
        )}
      </header>

      {status === "no_device" && (
        <div className="alert alert-info rounded-4 border-0 shadow-sm d-flex align-items-center gap-3 p-4 mb-4" style={{ background: "#F1F5F9", color: "#475569" }}>
          <div className="bg-white p-2 rounded-circle shadow-sm">
            <Activity size={24} className="text-secondary opacity-75" />
          </div>
          <div>
            <h3 className="h6 fw-bold mb-1">No Monitoring Device Assigned</h3>
            <p className="small mb-0 opacity-75">Real-time alerts and clinical event monitoring are currently unavailable for this account.</p>
          </div>
        </div>
      )}

      {status === "no_device" ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-light bg-opacity-50">
          <div className="mb-4 d-inline-flex bg-white p-4 rounded-circle shadow-sm">
            <Activity size={48} className="text-secondary opacity-25" />
          </div>
          <h2 className="h4 fw-black mb-2">No Monitoring Device Assigned</h2>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: "500px" }}>
            Real-time vital monitoring and clinical event alerts are currently unavailable for this account. 
            Please contact your health provider to assign a hardware device.
          </p>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-lg-8">
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex gap-2 flex-wrap align-items-center">
                    <span className="text-muted small fw-bold text-uppercase me-2" style={{ width: "80px" }}>Vital:</span>
                    {["All", "Temperature", "Heart Rate", "SPO2"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`btn btn-sm rounded-pill px-3 transition-all ${activeCategory === cat ? 'btn-primary' : 'btn-light border text-secondary'}`}
                        style={{ fontWeight: 600, fontSize: "12px" }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  
                  <div className="d-flex gap-2 flex-wrap align-items-center">
                    <span className="text-muted small fw-bold text-uppercase me-2" style={{ width: "80px" }}>Time:</span>
                    <div className="d-flex gap-2 flex-wrap">
                      {["All Time", "Today", "Yesterday", "Last 7 Days", "Custom Range"].map((date) => (
                        <button
                          key={date}
                          onClick={() => setDateFilter(date)}
                          className={`btn btn-sm rounded-pill px-3 transition-all ${dateFilter === date ? 'btn-dark' : 'btn-light border text-secondary'}`}
                          style={{ fontWeight: 600, fontSize: "12px" }}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>

                  {dateFilter === "Custom Range" && (
                    <div className="d-flex gap-2 align-items-center mt-1 animate-in slide-in-from-top-2" style={{ marginLeft: "92px" }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="d-flex flex-column">
                          <span className="text-muted" style={{ fontSize: '10px' }}>START</span>
                          <input 
                            type="datetime-local" 
                            className="form-control form-control-sm border rounded-3 bg-light" 
                            style={{ width: "200px", fontSize: "12px" }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <span className="text-muted small mt-3">to</span>
                        <div className="d-flex flex-column">
                          <span className="text-muted" style={{ fontSize: '10px' }}>END</span>
                          <input 
                            type="datetime-local" 
                            className="form-control form-control-sm border rounded-3 bg-light" 
                            style={{ width: "200px", fontSize: "12px" }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="col-12 col-lg-4">
                <div className="position-relative">
                  <span className="position-absolute translate-middle-y" style={{ left: "12px", top: "50%", zIndex: 10 }}>
                    <Bell size={16} className="text-muted" />
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-0 bg-light rounded-pill" 
                    placeholder="Search by vital or message..." 
                    style={{ paddingLeft: "38px", fontSize: "14px", height: "42px" }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column">
                <div className="card-body p-4 d-flex flex-column" style={{ minHeight: 0 }}>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
                    <h3 className="h5 fw-bold mb-0">Active Critical Alerts</h3>
                    <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger">{filteredAlerts.filter(a => a.severity.toLowerCase() === 'critical' && !a.is_acknowledged).length} Matches</span>
                  </div>
                  <div className="flex-grow-1 overflow-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 450px)", scrollBehavior: "smooth" }}>
                    {loading ? (
                      <div className="text-center text-secondary py-5">Loading alerts…</div>
                    ) : filteredAlerts.filter((a) => a.severity.toLowerCase() === "critical" && !a.is_acknowledged).length === 0 ? (
                      <div className="text-center text-secondary py-5">
                        <div className="display-6 mb-2 text-success">✔</div>
                        <div className="fw-bold">No Matches Found</div>
                        <div>Try adjusting your filters or search query.</div>
                      </div>
                    ) : (
                      filteredAlerts
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
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
                    <h3 className="h5 fw-bold mb-0">Alert History</h3>
                    <span className="text-muted small">{filteredAlerts.length} Total</span>
                  </div>
                  <div className="flex-grow-1 overflow-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 450px)", scrollBehavior: "smooth" }}>
                    {loading ? (
                      <div className="text-center text-secondary py-5">Loading alerts…</div>
                    ) : filteredAlerts.length === 0 ? (
                      <div className="text-center text-secondary py-5">No historic alerts</div>
                    ) : (
                      <div className="list-group">
                        {filteredAlerts.slice(0, 30).map((alert) => {
                          const style = severityStyles[alert.severity.toLowerCase()] || severityStyles.info;
                          return (
                            <div key={alert.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-bold">{alert.vital_type}</div>
                                <div className="small text-secondary">{formatTime(alert.created_at)}</div>
                                <div className="small mt-1">{alert.message}</div>
                              </div>
                              <span className="badge rounded-pill" style={{ background: alert.is_acknowledged ? "#16A34A" : style.border, color: "white" }}>
                                {alert.is_acknowledged ? "ACKNOWLEDGED" : "CRITICAL"}
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
        </>
      )}

      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
