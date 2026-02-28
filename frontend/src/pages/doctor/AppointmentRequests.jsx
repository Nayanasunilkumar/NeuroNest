import { useState, useEffect } from "react";
import { getAppointmentRequests, approveAppointment, rejectAppointment } from "../../api/doctor";
import {
  Check, X, Clock, Calendar, MessageSquare,
  User, CheckCircle2, XCircle, Inbox, RefreshCw,
  Stethoscope, AlertCircle, ChevronRight
} from "lucide-react";
import "../../styles/doctor.css";
import "../../styles/appointment-requests.css";

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
      <div className="ar-page fade-in">
        <div className="ar-skeleton-header" />
        <div className="ar-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="ar-skeleton-card">
              <div className="ar-skeleton-row ar-sk-avatar" />
              <div className="ar-skeleton-row ar-sk-line" />
              <div className="ar-skeleton-row ar-sk-line-sm" />
              <div className="ar-skeleton-row ar-sk-bar" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────
  if (requests.length === 0) {
    return (
      <div className="ar-page fade-in">
        <div className="ar-topbar">
          <div>
            <h1 className="ar-title">Appointment Requests</h1>
            <p className="ar-subtitle">Review and manage incoming patient booking requests</p>
          </div>
          <button className="ar-refresh-btn" onClick={handleRefresh}>
            <RefreshCw size={16} className={refreshing ? "ar-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="ar-empty-state">
          <div className="ar-empty-icon-ring">
            <Inbox size={38} strokeWidth={1.5} />
          </div>
          <h3>All clear for now</h3>
          <p>When patients submit booking requests, they'll appear here for your review.</p>
          <button className="ar-refresh-btn" onClick={handleRefresh} style={{ marginTop: '8px' }}>
            <RefreshCw size={16} />
            Check again
          </button>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────
  return (
    <div className="ar-page fade-in">

      {/* ── Top Bar ── */}
      <div className="ar-topbar">
        <div>
          <h1 className="ar-title">Appointment Requests</h1>
          <p className="ar-subtitle">
            Review and manage incoming patient booking requests
          </p>
        </div>
        <div className="ar-topbar-right">
          <div className="ar-count-pill">
            <span className="ar-count-dot" />
            {requests.length} pending
          </div>
          <button className="ar-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? "ar-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="ar-stats-strip">
        <div className="ar-stat-item">
          <div className="ar-stat-icon ar-stat-icon-amber">
            <Clock size={18} />
          </div>
          <div>
            <div className="ar-stat-num">{requests.length}</div>
            <div className="ar-stat-label">Pending</div>
          </div>
        </div>
        <div className="ar-stat-divider" />
        <div className="ar-stat-item">
          <div className="ar-stat-icon ar-stat-icon-red">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="ar-stat-num">
              {requests.filter(r => isUrgent(r.appointment_date)).length}
            </div>
            <div className="ar-stat-label">Urgent (≤ 2 days)</div>
          </div>
        </div>
        <div className="ar-stat-divider" />
        <div className="ar-stat-item">
          <div className="ar-stat-icon ar-stat-icon-blue">
            <Stethoscope size={18} />
          </div>
          <div>
            <div className="ar-stat-num">
              {new Set(requests.map(r => r.patient_name)).size}
            </div>
            <div className="ar-stat-label">Unique Patients</div>
          </div>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="ar-grid">
        {requests.map((req) => {
          const [bg, fg] = getAvatarColor(req.patient_name);
          const urgent = isUrgent(req.appointment_date);
          const isApproved = approved.includes(req.id);
          const isRejected = rejected.includes(req.id);

          return (
            <div
              key={req.id}
              className={`ar-card ${urgent ? "ar-card-urgent" : ""} ${isApproved ? "ar-card-approved" : ""} ${isRejected ? "ar-card-rejected" : ""}`}
            >
              {/* Urgent ribbon */}
              {urgent && (
                <div className="ar-urgent-ribbon">
                  <AlertCircle size={12} />
                  Urgent
                </div>
              )}

              {/* ── Header ── */}
              <div className="ar-card-header">
                <div className="ar-patient-row">
                  <div className="ar-avatar" style={{ background: bg, color: fg }}>
                    {getInitials(req.patient_name)}
                  </div>
                  <div className="ar-patient-info">
                    <h3 className="ar-patient-name">{req.patient_name}</h3>
                    <span className="ar-requested-on">
                      Requested {new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
                <span className="ar-badge-pending">
                  <span className="ar-badge-dot" />
                  Pending
                </span>
              </div>

              {/* ── Details ── */}
              <div className="ar-details">
                <div className="ar-detail-row">
                  <div className="ar-detail-icon">
                    <Calendar size={14} />
                  </div>
                  <span>{formatDate(req.appointment_date)}</span>
                </div>
                <div className="ar-detail-row">
                  <div className="ar-detail-icon">
                    <Clock size={14} />
                  </div>
                  <span>{formatTime(req.appointment_time)}</span>
                </div>
                {req.reason && (
                  <div className="ar-reason-box">
                    <div className="ar-reason-label">
                      <MessageSquare size={12} />
                      Chief Complaint
                    </div>
                    <p className="ar-reason-text">{req.reason}</p>
                  </div>
                )}
                {req.notes && (
                  <div className="ar-notes-text">
                    <ChevronRight size={12} />
                    {req.notes}
                  </div>
                )}
              </div>

              {/* ── Actions ── */}
              <div className="ar-actions">
                <button
                  className="ar-btn-approve"
                  onClick={() => handleAction(req.id, "approve")}
                  disabled={!!actionLoading}
                >
                  {actionLoading === req.id + "approve" || isApproved ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                  {isApproved ? "Approved!" : "Approve"}
                </button>
                <button
                  className="ar-btn-reject"
                  onClick={() => handleAction(req.id, "reject")}
                  disabled={!!actionLoading}
                  title="Decline request"
                >
                  {isRejected ? <XCircle size={16} /> : <X size={16} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentRequests;
