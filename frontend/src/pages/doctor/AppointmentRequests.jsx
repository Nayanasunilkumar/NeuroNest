import { useState, useEffect } from "react";
import { getAppointmentRequests, approveAppointment, rejectAppointment } from "../../api/doctor";
import {
  Check, X, Clock, Calendar, MessageSquare,
  User, CheckCircle2, XCircle, Inbox, RefreshCw,
  Stethoscope, AlertCircle, ChevronRight
} from "lucide-react";

const AppointmentRequests = () => {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [approved, setApproved]       = useState([]);
  const [rejected, setRejected]       = useState([]);
  const [refreshing, setRefreshing]   = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getAppointmentRequests();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      if (action === "approve") {
        await approveAppointment(id);
        setApproved(prev => [...prev, id]);
      } else {
        await rejectAppointment(id);
        setRejected(prev => [...prev, id]);
      }
      setTimeout(() => {
        setRequests(prev => prev.filter(r => r.id !== id));
        setApproved(prev => prev.filter(a => a !== id));
        setRejected(prev => prev.filter(r => r !== id));
      }, 700);
    } catch (err) {
      console.error(`Error ${action}ing:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hn = Number(h);
    if (isNaN(hn)) return t.substring(0, 5);
    return `${hn % 12 || 12}:${m} ${hn >= 12 ? "PM" : "AM"}`;
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric"
    });

  const getInitials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  const avatarColors = [
    ["#dbeafe", "#1d4ed8"], ["#fce7f3", "#be185d"], ["#dcfce7", "#15803d"],
    ["#fef3c7", "#b45309"], ["#ede9fe", "#7c3aed"], ["#ffedd5", "#c2410c"],
  ];

  const getAvatarColor = (name = "") => {
    const idx = (name.charCodeAt(0) || 0) % avatarColors.length;
    return avatarColors[idx];
  };

  const isUrgent = (dateStr) => {
    const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 2;
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container-fluid py-4 min-vh-100 placeholder-glow">
        <div className="mb-4">
          <span className="placeholder col-4 col-sm-2 fs-2 rounded-3"></span>
          <br/>
          <span className="placeholder col-6 col-sm-3 rounded-2"></span>
        </div>
        <div className="row g-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
                    <div className="d-flex gap-3 mb-3">
                        <div className="placeholder rounded-3" style={{width: 42, height: 42}}></div>
                        <div className="flex-grow-1">
                            <span className="placeholder col-8 rounded-2 mb-1"></span>
                            <span className="placeholder col-5 rounded-2 placeholder-sm"></span>
                        </div>
                    </div>
                    <span className="placeholder col-10 rounded-2 mb-2"></span>
                    <span className="placeholder col-7 rounded-2 mb-4"></span>
                    <span className="placeholder col-12 rounded-3" style={{height: 42}}></span>
                </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────
  if (requests.length === 0) {
    return (
      <div className="container-fluid py-4 min-vh-100 d-flex flex-column">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
          <div>
            <h1 className="fw-bolder text-dark mb-1" style={{ fontSize: '1.85rem', letterSpacing: '-0.03em' }}>Appointment Requests</h1>
            <p className="text-secondary mb-0">Review and manage incoming patient booking requests</p>
          </div>
          <button className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-3 py-2 fw-medium shadow-sm transition-all bg-white" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "spinner-border spinner-border-sm" : ""} style={{ borderWidth: refreshing ? '2px': undefined }} />
            Refresh
          </button>
        </div>

        <div className="card border-0 shadow-sm rounded-4 flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center p-5 bg-white bg-opacity-75 border border-dashed border-2 border-secondary border-opacity-25">
          <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary mb-4" style={{ width: 80, height: 80 }}>
            <Inbox size={38} strokeWidth={1.5} />
          </div>
          <h3 className="fw-bolder text-dark mb-2">All clear for now</h3>
          <p className="text-muted mb-4 max-w-sm">When patients submit booking requests, they'll appear here for your review.</p>
          <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Check again
          </button>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────
  return (
    <div className="container-fluid py-4 min-vh-100">

      {/* ── Top Bar ── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="fw-bolder text-dark mb-1" style={{ fontSize: 'clamp(1.5rem, 2vw, 1.85rem)', letterSpacing: '-0.03em' }}>Appointment Requests</h1>
          <p className="text-secondary mb-0">
            Review and manage incoming patient booking requests
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="badge bg-warning bg-opacity-25 text-dark fw-bold px-3 py-2 rounded-pill d-flex align-items-center gap-2 border border-warning border-opacity-50">
            <span className="spinner-grow bg-warning" style={{ width: 8, height: 8 }} />
            {requests.length} pending
          </div>
          <button className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-3 py-2 fw-medium shadow-sm bg-white" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? "spinner-border spinner-border-sm" : ""} style={{ borderWidth: refreshing ? '2px': undefined }} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="row g-0">
          <div className="col-12 col-md-4 p-3 d-flex align-items-center gap-3 border-end-md">
            <div className="rounded-3 d-flex align-items-center justify-content-center bg-warning bg-opacity-25 text-warning" style={{ width: 48, height: 48 }}>
              <Clock size={22} />
            </div>
            <div>
              <div className="fw-bolder fs-4 lh-1 text-dark mb-1">{requests.length}</div>
              <div className="text-muted small fw-medium text-uppercase tracking-wider">Pending</div>
            </div>
          </div>
          
          <div className="col-12 col-md-4 p-3 d-flex align-items-center gap-3 border-end-md border-top border-top-md-0">
            <div className="rounded-3 d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger" style={{ width: 48, height: 48 }}>
              <AlertCircle size={22} />
            </div>
            <div>
              <div className="fw-bolder fs-4 lh-1 text-dark mb-1">
                {requests.filter(r => isUrgent(r.appointment_date)).length}
              </div>
              <div className="text-muted small fw-medium text-uppercase tracking-wider">Urgent (≤ 2 days)</div>
            </div>
          </div>
          
          <div className="col-12 col-md-4 p-3 d-flex align-items-center gap-3 border-top border-top-md-0">
            <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: 48, height: 48 }}>
              <Stethoscope size={22} />
            </div>
            <div>
              <div className="fw-bolder fs-4 lh-1 text-dark mb-1">
                {new Set(requests.map(r => r.patient_name)).size}
              </div>
              <div className="text-muted small fw-medium text-uppercase tracking-wider">Unique Patients</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="row g-4">
        {requests.map((req) => {
          const [bg, fg] = getAvatarColor(req.patient_name);
          const urgent = isUrgent(req.appointment_date);
          const isApproved = approved.includes(req.id);
          const isRejected = rejected.includes(req.id);
          
          let cardStyleClass = "bg-white border-0 shadow-sm";
          let borderOverlay = null;

          if (urgent) cardStyleClass = "bg-white shadow border border-danger border-opacity-50";
          if (isApproved) cardStyleClass = "bg-success bg-opacity-10 shadow-none border border-success border-opacity-25 opacity-75";
          if (isRejected) cardStyleClass = "bg-danger bg-opacity-10 shadow-none border border-danger border-opacity-25 opacity-75 grayscale-50";

          return (
            <div key={req.id} className="col-12 col-lg-6 col-xl-4">
                <div className={`card h-100 rounded-4 transition-all ${cardStyleClass} position-relative overflow-hidden hover-shadow-lg`} style={{ transition: 'all 0.3s ease' }}>
                    
                  {/* Urgent ribbon */}
                  {urgent && !isApproved && !isRejected && (
                    <div className="position-absolute top-0 end-0 bg-danger text-white px-3 py-1 fw-bold small rounded-bottom-start d-flex align-items-center gap-1 shadow-sm">
                      <AlertCircle size={12} /> Urgent
                    </div>
                  )}

                  <div className="card-body p-4 d-flex flex-column">
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3 w-100" style={{ minWidth: 0 }}>
                            <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 fw-bold fs-5 shadow-sm" style={{ width: 48, height: 48, background: bg, color: fg }}>
                                {getInitials(req.patient_name)}
                            </div>
                            <div className="text-truncate flex-grow-1">
                                <h3 className="h6 fw-bold text-dark mb-0 text-truncate">{req.patient_name}</h3>
                                <div className="text-muted small fw-medium text-truncate mt-1">
                                    Requested {new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </div>
                            </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="d-flex flex-column gap-2 mb-4 bg-light p-3 rounded-4 border">
                        <div className="d-flex align-items-center gap-2 text-dark small fw-medium">
                            <Calendar size={14} className="text-secondary flex-shrink-0" />
                            <span>{formatDate(req.appointment_date)}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-dark small fw-medium">
                            <Clock size={14} className="text-secondary flex-shrink-0" />
                            <span>{formatTime(req.appointment_time)}</span>
                        </div>
                        {req.reason && (
                            <div className="mt-2 text-dark small">
                                <span className="d-flex align-items-center gap-1 text-secondary fw-bold mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                                    <MessageSquare size={10} /> Chief Complaint
                                </span>
                                <p className="mb-0 fw-medium p-2 bg-white rounded border border-light text-wrap text-break">{req.reason}</p>
                            </div>
                        )}
                        {req.notes && (
                            <div className="d-flex align-items-start gap-1 text-muted small fst-italic mt-2">
                                <ChevronRight size={14} className="flex-shrink-0 mt-1" />
                                <span className="text-wrap text-break fw-medium">{req.notes}</span>
                            </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-auto d-flex align-items-center gap-2">
                          <button
                            className={`btn flex-grow-1 d-flex justify-content-center align-items-center gap-2 fw-bold rounded-3 ${isApproved ? 'btn-success' : 'btn-primary shadow-sm'}`}
                            onClick={() => handleAction(req.id, "approve")}
                            disabled={!!actionLoading}
                            style={!isApproved ? { background: 'linear-gradient(135deg, #0d6efd, #6610f2)', border: 'none' } : {}}
                          >
                            {actionLoading === req.id + "approve" || isApproved ? (
                                <CheckCircle2 size={18} />
                            ) : (
                                <Check size={18} />
                            )}
                            {isApproved ? "Approved!" : "Approve"}
                          </button>
                          
                          <button
                            className={`btn d-flex align-items-center justify-content-center rounded-3 ${isRejected ? 'btn-danger' : 'btn-light border text-danger hover-bg-danger hover-text-white'}`}
                            style={{ width: 44, height: 44, transition: 'all 0.2s' }}
                            onClick={() => handleAction(req.id, "reject")}
                            disabled={!!actionLoading}
                            title="Decline request"
                          >
                            {isRejected ? <XCircle size={18} /> : <X size={18} className={isRejected ? '' : 'text-danger'} />}
                          </button>
                      </div>
                  </div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentRequests;
