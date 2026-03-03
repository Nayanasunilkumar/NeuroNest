import { useState, useEffect } from "react";
import { getAppointmentRequests, approveAppointment, rejectAppointment } from "../../api/doctor";
import {
  Check, X, Clock, Calendar, MessageSquare,
  CheckCircle2, XCircle, Inbox, RefreshCw,
  Stethoscope, AlertCircle, ChevronRight,
  TrendingUp, Users, Activity, Plus, Search,
  PieChart, MessageCircle, BarChart3, Star, Layers
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
         <div className="ar-main-content">
            <div className="ar-skeleton-header mb-4" style={{ height: '200px' }}></div>
            <div className="row g-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="col-4">
                  <div className="ar-skeleton-row mb-3" style={{ height: '30px', width: '40%' }}></div>
                  <div className="ar-skeleton-card mb-3" style={{ height: '150px' }}></div>
                  <div className="ar-skeleton-card" style={{ height: '150px' }}></div>
                </div>
              ))}
            </div>
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

  const queue = filteredRequests.filter(r => !isUrgent(r.appointment_date));
  const prioritized = filteredRequests.filter(r => isUrgent(r.appointment_date));

  return (
    <div className={`ar-page ${isDark ? 'dark' : ''}`}>
      
      {/* ── Main Content Area ── */}
      <div className="ar-main-content">
        
        {/* ── Dashboard Banner ── */}
        <div className="ar-banner">
          <div className="ar-banner-shape"></div>
          <div className="ar-banner-content">
             <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h1 className="ar-banner-title">Patient Intake Dashboard</h1>
                  <p className="ar-subtitle mb-0">Reviewing clinical loads and authorization queues for today.</p>
                </div>
                <button className="ar-refresh-btn" onClick={handleRefresh} style={{ border: 'none', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', padding: '10px 16px', fontWeight: '700' }}>
                   <RefreshCw size={14} className={refreshing ? "ar-spin" : ""} /> Sync Engine
                </button>
             </div>

             <div className="ar-banner-stats">
                <div className="ar-banner-stat">
                   <span className="ar-banner-stat-label">Active Queue</span>
                   <span className="ar-banner-stat-val">{requests.length} Requests</span>
                </div>
                <div className="ar-banner-stat">
                   <span className="ar-banner-stat-label">Critical Wait</span>
                   <span className="ar-banner-stat-val text-danger">{prioritized.length} Urgent</span>
                </div>
                <div className="ar-banner-stat">
                   <span className="ar-banner-stat-label">Efficiency</span>
                   <span className="ar-banner-stat-val text-success">98% Autoprocess</span>
                </div>
             </div>
          </div>
        </div>

        {/* ── Kanban Board ── */}
        <div className="ar-kanban-board">
          
          {/* Column 1: Intake Queue */}
          <div className="ar-kanban-col">
            <div className="ar-kanban-header">
               <div className="ar-kanban-title">
                  <Layers size={18} className="text-primary" />
                  Intake Queue
               </div>
               <span className="ar-kanban-count">{queue.length}</span>
            </div>
            
            {queue.map(req => (
              <RequestCard key={req.id} req={req} onApprove={handleAction} actionLoading={actionLoading} />
            ))}
            
            {queue.length === 0 && (
               <div className="ar-empty-state py-4 p-2" style={{ borderStyle: 'dotted' }}>
                  <p className="small">No pending steady-state requests.</p>
               </div>
            )}
          </div>

          {/* Column 2: Prioritized */}
          <div className="ar-kanban-col">
            <div className="ar-kanban-header">
               <div className="ar-kanban-title">
                  <TrendingUp size={18} className="text-danger" />
                  Prioritized
               </div>
               <span className="ar-kanban-count">{prioritized.length}</span>
            </div>

            {prioritized.map(req => (
              <RequestCard key={req.id} req={req} onApprove={handleAction} actionLoading={actionLoading} />
            ))}

            {prioritized.length === 0 && (
               <div className="ar-empty-state py-4 p-2" style={{ borderStyle: 'dotted' }}>
                  <p className="small">All critical requests cleared.</p>
               </div>
            )}
          </div>

          {/* Column 3: Follow-ups / Discussion */}
          <div className="ar-kanban-col">
            <div className="ar-kanban-header">
               <div className="ar-kanban-title">
                  <MessageCircle size={18} className="text-purple-600" />
                  Follow-ups
               </div>
               <span className="ar-kanban-count">0</span>
            </div>
            <div className="ar-empty-state py-5" style={{ background: 'transparent', border: '1.5px dashed #e2e8f0' }}>
               <span className="text-muted small">Clinical discussions empty.</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="ar-right-panel d-none d-xl-flex">
         
         <section>
            <h3 className="ar-panel-section-title">Clinical Load Insight</h3>
            <div className="ar-project-card mb-3">
               <div className="ar-project-info">
                  <div className="ar-project-icon"><Activity size={16} /></div>
                  <span className="fw-bold small">Current Capacity</span>
                  <span className="ar-progress-ring">71%</span>
               </div>
            </div>
            <div className="ar-chart-placeholder">
               <div className="ar-chart-line"></div>
               <div className="p-3">
                  <BarChart3 size={20} className="text-primary mb-2" />
                  <div className="fw-bold small">Peak Hours (Est)</div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>2:00 PM - 5:00 PM</div>
               </div>
            </div>
         </section>

         <section>
            <h3 className="ar-panel-section-title">Peer Discussion</h3>
            <div className="ar-chat-msg">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Doc1" alt="Avatar" className="ar-chat-avatar" />
               <div className="ar-chat-bubble">
                  Can you check the labs for patient #392? They requested an urgent slot.
               </div>
            </div>
            <div className="ar-chat-msg">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Doc2" alt="Avatar" className="ar-chat-avatar" />
               <div className="ar-chat-bubble">
                  Scheduled them for 4 PM. Capacity is at 71%.
               </div>
            </div>
         </section>

         <section className="mt-auto">
            <div className="ar-project-card" style={{ background: '#eff6ff' }}>
               <div className="d-flex align-items-center gap-2 mb-2">
                  <Star size={16} className="text-primary" />
                  <span className="fw-bold small">Pro Support</span>
               </div>
               <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Need assistance with complex scheduling? Contact the admin team.</p>
            </div>
         </section>
      </div>

    </div>
  );
};

// ── Sub-component for Kanban Card ──
const RequestCard = ({ req, onApprove, actionLoading }) => {
  const [bg, fg] = getAvatarColor(req.patient_name);
  const urgent = isUrgent(req.appointment_date);
  
  return (
    <div className={`ar-card ${urgent ? 'ar-card-urgent' : 'ar-card-active'}`} style={{ minHeight: 'auto', gap: '16px', padding: '18px' }}>
      <div className="ar-card-header mb-0">
        <span className="ar-request-id">#{req.id.toString().substring(0, 3)}</span>
        <button className="border-0 bg-transparent text-muted"><Search size={14}/></button>
      </div>

      <h3 className="ar-reason-title mb-2" style={{ fontSize: '0.95rem' }}>
        {req.reason || "General Consultation"}
      </h3>
      
      <p className="text-muted small mb-3" style={{ fontSize: '0.8rem' }}>
         Duration: 30 minutes • Initial Consult
      </p>

      <div className="ar-card-footer">
        <div className="ar-patient-brief">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.patient_name}`} alt="Avatar" className="ar-patient-avatar-sm" />
            <div className="ar-patient-meta">
                <h4 className="ar-patient-name-btn" style={{ fontSize: '0.85rem' }}>{req.patient_name}</h4>
            </div>
        </div>
        
        <button 
          className="ar-action-arrow" 
          style={{ width: '32px', height: '32px' }}
          onClick={() => onApprove(req.id, "approve")}
          disabled={!!actionLoading}
        >
          {actionLoading ? <RefreshCw size={14} className="ar-spin" /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
};

// ── Utilites ───────────────────────────────────────────────
const getAvatarColor = (name) => {
  const colors = [
    ["#e0f2fe", "#0369a1"], ["#fef2f2", "#b91c1c"],
    ["#f0fdf4", "#15803d"], ["#fdf2f8", "#be185d"],
    ["#fff7ed", "#c2410c"], ["#f5f3ff", "#6d28d9"]
  ];
  const idx = (name || "").charCodeAt(0) % colors.length;
  return colors[idx];
};

const getInitials = (name) => {
  return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "P";
};

const isUrgent = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const diffDays = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  return diffDays <= 2;
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (time) => {
    if (!time) return "N/A";
    const [h, m] = time.split(":");
    const hh = parseInt(h);
    const suffix = hh >= 12 ? "PM" : "AM";
    return `${((hh + 11) % 12 + 1)}:${m} ${suffix}`;
};

export default AppointmentRequests;
