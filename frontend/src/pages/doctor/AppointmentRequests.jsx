import { useState, useEffect } from "react";
import { getAppointmentRequests, approveAppointment, rejectAppointment } from "../../api/doctor";
import {
  Check, X, Clock, Calendar, MessageSquare,
  CheckCircle2, XCircle, Inbox, RefreshCw,
  Stethoscope, AlertCircle, ChevronRight,
  TrendingUp, Users, Activity
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/appointment-requests.css";

const AppointmentRequests = () => {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [approved, setApproved]       = useState([]);
  const [rejected, setRejected]       = useState([]);
  const [refreshing, setRefreshing]   = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterMode, setFilterMode]   = useState("All"); // All, Urgent, Recent
  const { isDark }                    = useTheme();

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
      <div className={`ar-page container-fluid py-4 min-vh-100 ${isDark ? 'dark' : ''}`}>
        <div className="ar-topbar mb-4">
          <div className="ar-skeleton-header w-50"></div>
          <div className="ar-skeleton-header w-25"></div>
        </div>
        <div className="ar-stats-strip mb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="ar-stat-item ar-skeleton-row" style={{height: 60}}></div>
          ))}
        </div>
        <div className="ar-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="ar-skeleton-card">
              <div className="d-flex gap-3 mb-3">
                <div className="ar-skeleton-row ar-sk-avatar"></div>
                <div className="flex-grow-1 d-flex flex-column gap-2">
                  <div className="ar-skeleton-row ar-sk-line"></div>
                  <div className="ar-skeleton-row ar-sk-line-sm"></div>
                </div>
              </div>
              <div className="ar-skeleton-row ar-sk-bar" style={{height: 100}}></div>
              <div className="ar-skeleton-row ar-sk-bar"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────
  if (requests.length === 0) {
    return (
      <div className={`ar-page container-fluid py-4 min-vh-100 ${isDark ? 'dark' : ''}`}>
        <div className="ar-topbar mb-5">
          <div>
            <h1 className="ar-title">Appointment Requests</h1>
            <p className="ar-subtitle">Manage your patient consultation queue</p>
          </div>
          <button className="ar-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "ar-spin" : ""} />
            Refresh Queue
          </button>
        </div>

        <div className="ar-empty-state">
          <div className="ar-empty-icon-ring">
            <Inbox size={40} strokeWidth={1.5} />
          </div>
          <h3>Dashboard Synced</h3>
          <p>No new appointment requests at the moment. We'll alert you when a patient initiates a booking.</p>
          <button className="ar-btn-approve shadow-none mt-3" style={{ maxWidth: '200px' }} onClick={handleRefresh}>
            <RefreshCw size={16} /> Check for Updates
          </button>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (req.reason && req.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterMode === "Urgent") return matchesSearch && isUrgent(req.appointment_date);
    return matchesSearch;
  });

  return (
    <div className={`ar-page container-fluid py-0 min-vh-100 ${isDark ? 'dark' : ''}`} style={{ backgroundColor: '#fdfdfe' }}>

      {/* ── Header Section ── */}
      <div className="ar-header-section px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="ar-title mb-0" style={{ color: '#1e293b' }}>Appointment Requests</h1>
          <div className="d-flex gap-2">
            <button className="dark-btn-primary px-4 py-2 rounded-pill" style={{ height: '44px', fontSize: '0.9rem' }} onClick={handleRefresh}>
               <RefreshCw size={16} className={refreshing ? "ar-spin" : ""} /> {refreshing ? "Syncing..." : "Sync Engine"}
            </button>
            <div className="ar-view-toggle">
              <button className="ar-toggle-btn active">Card view</button>
              <button className="ar-toggle-btn">List view</button>
            </div>
          </div>
        </div>

        <div className="ar-search-filters">
           <div className="ar-search-input-wrap">
              <Activity className="ar-search-icon" size={18} />
              <input 
                type="text" 
                className="ar-search-input" 
                placeholder="Search patient, complaint, ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="ar-filter-pill">
              <Calendar size={16} />
              <span><span className="ar-filter-label">Date range:</span> All Time</span>
           </div>

           <div className="ar-filter-pill" onClick={() => setFilterMode(filterMode === "Urgent" ? "All" : "Urgent")}>
              <AlertCircle size={16} color={filterMode === "Urgent" ? "#ef4444" : "currentColor"} />
              <span>
                <span className="ar-filter-label">Urgency:</span> {filterMode === "Urgent" ? "Critical" : "All (10)"}
              </span>
           </div>

           <div className="ar-filter-pill">
              <Activity size={16} />
              <span><span className="ar-filter-label">Status:</span> All (10)</span>
           </div>
        </div>
      </div>

      <div className="px-4 pb-5">
        {/* ── Stats Strip ── */}
        <div className="ar-stats-strip mb-5">
          <div className="ar-stat-item">
            <div className="ar-stat-icon ar-stat-icon-amber">
              <Clock size={22} />
            </div>
            <div>
              <div className="ar-stat-num">{requests.length}</div>
              <div className="ar-stat-label text-uppercase">Waitlist</div>
            </div>
          </div>
          
          <div className="ar-stat-divider d-none d-md-block"></div>

          <div className="ar-stat-item">
            <div className="ar-stat-icon ar-stat-icon-red">
              <Activity size={22} />
            </div>
            <div>
              <div className="ar-stat-num">
                {requests.filter(r => isUrgent(r.appointment_date)).length}
              </div>
              <div className="ar-stat-label text-uppercase">Critical</div>
            </div>
          </div>
          
          <div className="ar-stat-divider d-none d-md-block"></div>

          <div className="ar-stat-item">
            <div className="ar-stat-icon ar-stat-icon-blue">
              <Users size={22} />
            </div>
            <div>
              <div className="ar-stat-num">
                {new Set(requests.map(r => r.patient_name)).size}
              </div>
              <div className="ar-stat-label text-uppercase">Patients</div>
            </div>
          </div>
        </div>

        {/* ── Cards Grid ── */}
        <div className="ar-grid">
          {filteredRequests.map((req) => {
            const [bg, fg] = getAvatarColor(req.patient_name);
            const urgent = isUrgent(req.appointment_date);
            const isApproved = approved.includes(req.id);
            const isRejected = rejected.includes(req.id);
            
            let cardClass = "ar-card";
            if (urgent) cardClass += " ar-card-urgent";
            else cardClass += " ar-card-active";
            
            if (isApproved) cardClass += " ar-card-approved";
            if (isRejected) cardClass += " ar-card-rejected";

            return (
              <div key={req.id} className={cardClass}>
                  
                  <div className="ar-card-header">
                    <span className="ar-request-id">#{req.id.toString().substring(0, 3)}</span>
                    <div className={`ar-status-badge ${urgent ? 'ar-status-badge-urgent' : 'ar-status-badge-active'}`}>
                       {urgent ? <AlertCircle size={14}/> : <Activity size={14}/>}
                       {urgent ? "Over Time" : "Active"}
                    </div>
                  </div>

                  <h3 className="ar-reason-title">
                    {req.reason || "General Consultation"}
                  </h3>

                  <div className="ar-timeline-wrap">
                    <div className="ar-timeline-times">
                       <span>{new Date(req.appointment_date).toLocaleDateString("en-US", { day: 'numeric', month: 'short' })}, {formatTime(req.appointment_time)}</span>
                       <span>Queue End</span>
                    </div>
                    <div className="ar-timeline-bar">
                        <div className="ar-timeline-progress" style={{ width: urgent ? '100%' : '50%' }}></div>
                        <div className="ar-timeline-dot start" style={{ left: '0' }}></div>
                        <div className="ar-timeline-dot end" style={{ left: '100%' }}></div>
                    </div>
                  </div>

                  <div className="ar-card-footer">
                    <div className="ar-patient-brief">
                        <div className="ar-patient-avatar-sm" style={{ background: bg, color: fg }}>
                            {getInitials(req.patient_name)}
                        </div>
                        <div className="ar-patient-meta">
                            <h4 className="ar-patient-name-btn">{req.patient_name}</h4>
                            <span className="ar-patient-source">Via Patient Portal</span>
                        </div>
                    </div>
                    
                    <button 
                      className="ar-action-arrow" 
                      onClick={() => handleAction(req.id, "approve")}
                      disabled={!!actionLoading}
                    >
                      {actionLoading ? <RefreshCw size={18} className="ar-spin" /> : <ChevronRight size={20} />}
                    </button>
                  </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppointmentRequests;
