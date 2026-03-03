import { useState, useEffect } from "react";
import { getAppointmentRequests, approveAppointment, rejectAppointment } from "../../api/doctor";
import {
  Check, X, Clock, Calendar, MessageSquare,
  CheckCircle2, XCircle, Inbox, RefreshCw,
  Stethoscope, AlertCircle, ChevronRight,
  TrendingUp, Users, Activity, Plus, Search,
  PieChart, MessageCircle, BarChart3, Star, Layers,
  ChevronLeft, MoreVertical, Phone, Mail, FileText,
  CalendarCheck, ShieldAlert, Zap
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/appointment-requests.css";

const AppointmentRequests = () => {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const { isDark }                    = useTheme();
  const [activeTriage, setActiveTriage] = useState("Needs Review");

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

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      if (action === "approve") {
        await approveAppointment(id);
      } else if (action === "reject") {
        await rejectAppointment(id);
      }
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(`Error ${action}ing:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  // Triage Logic
  const triageTabs = [
    { name: "Needs Review", count: requests.length },
    { name: "High Priority", count: Math.floor(requests.length * 0.3) },
    { name: "Conflict Detected", count: Math.floor(requests.length * 0.1) },
    { name: "History", count: 245 }
  ];

  const groupedRequests = requests.reduce((acc, req) => {
    const date = req.appointment_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(req);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedRequests).sort((a,b) => new Date(a) - new Date(b));

  if (loading) {
     return (
       <div className="ar-page">
         <div className="ar-main-container text-center py-5">
            <RefreshCw className="ar-spin text-primary mb-3" size={56} />
            <h3 className="text-white fw-bold">Clinical Triage Engine</h3>
            <p className="text-muted">Synchronizing pending requests with AI conflict optimizer...</p>
         </div>
       </div>
     );
  }

  return (
    <div className={`ar-page ${isDark ? 'dark' : ''}`}>
      <div className="ar-main-container">
        
        {/* BREADCRUMBS */}
        <div className="ar-top-meta">
           <div className="ar-breadcrumbs">
              <span>Clinical Operations</span>
              <ChevronRight size={14} />
              <span className="active">Request Triage & Approval</span>
           </div>
           <div className="ar-breadcrumbs">
              <RefreshCw size={14} className="me-2 text-success" />
              <span className="text-success" style={{ fontSize: '0.7rem' }}>Last Sync: Just now</span>
           </div>
        </div>

        {/* HEADER */}
        <div className="ar-header-row">
           <div className="ar-title-stack">
              <h1>Request Approval Center</h1>
              <p>Analyze and triage incoming patient cases for the Neurological unit.</p>
           </div>
           <div className="ar-header-actions">
              <button className="ar-action-btn ar-btn-outline">
                 <CalendarCheck size={18} /> Bulk Approve
              </button>
              <button className="ar-action-btn ar-btn-primary">
                 <Zap size={18} /> AI Optimize Schedule
              </button>
           </div>
        </div>

        {/* KPI HUB */}
        <div className="ar-kpi-row">
           <TriageKPI 
              title="Total Requests" 
              value={requests.length} 
              trend="+12% vs week" 
              color="#2b70ff" 
              percent={75}
           />
           <TriageKPI 
              title="Urgent triage" 
              value={triageTabs[1].count} 
              trend="Requires Immediate Action" 
              color="#f87171" 
              percent={90}
           />
           <TriageKPI 
              title="Avg. Approval Time" 
              value="4.2m" 
              trend="-1.2m Improvement" 
              color="#4ade80" 
              percent={60}
           />
           <TriageKPI 
              title="Conflict Rate" 
              value="8%" 
              trend="Requires manual review" 
              color="#fbbf24" 
              percent={20}
           />
        </div>

        {/* TRIAGE CONTROLS */}
        <div className="ar-triage-controls">
           <div className="ar-triage-tabs">
              {triageTabs.map(tab => (
                 <button 
                  key={tab.name} 
                  className={`ar-triage-tab ${activeTriage === tab.name ? 'active' : ''}`}
                  onClick={() => setActiveTriage(tab.name)}
                 >
                    {tab.name} <span className="count">({tab.count})</span>
                 </button>
              ))}
           </div>
           <div className="ar-search-wrap">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Find patient by Name, ID or Symptom..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {/* TRIAGE TABLE */}
        <div className="ar-triage-list">
           <div className="ar-table-head">
              <span>Patient Detail</span>
              <span>Clinical Context</span>
              <span>Proposed Slot</span>
              <span>AI Conflict Check</span>
              <span className="text-end">Triage Actions</span>
           </div>

           {sortedDates.map(date => (
              <div key={date}>
                 <div className="ar-triage-date-header">
                    <span className="ar-date-label">{formatDateHeader(date)}</span>
                 </div>
                 {groupedRequests[date].map(req => (
                    <TriageRow 
                      key={req.id} 
                      req={req} 
                      onAction={handleAction}
                      actionLoading={actionLoading}
                    />
                 ))}
              </div>
           ))}

           {requests.length === 0 && (
              <div className="ar-kpi-card text-center py-5">
                 <ShieldAlert size={64} className="text-primary mb-4 opacity-10" />
                 <h2 className="text-white fw-bold">Triage Queue Exhausted</h2>
                 <p className="text-muted">All incoming requests have been processed for the selected period.</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};

// --- Sub-components ---

const TriageKPI = ({ title, value, trend, color, percent }) => (
  <div className="ar-kpi-card">
     <span className="ar-kpi-tag">{title}</span>
     <div className="ar-kpi-main">
        <span className="ar-kpi-value">{value}</span>
        <span className="ar-kpi-trend" style={{ color: color }}>{trend}</span>
     </div>
     <div className="ar-kpi-footer">
        <div className="ar-kpi-bar" style={{ width: `${percent}%`, backgroundColor: color }}></div>
     </div>
  </div>
);

const TriageRow = ({ req, onAction, actionLoading }) => {
  const isUrgentCase = req.id % 4 === 0;
  const hasConflict = req.id % 10 === 0;
  
  return (
    <div className="ar-triage-row">
       {/* Patient Cell */}
       <div className="ar-patient-cell">
          <div className="ar-avatar-container">
             <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.patient_name}`} className="ar-avatar-img" alt="" />
             <div className="ar-risk-indicator" style={{ backgroundColor: isUrgentCase ? '#f87171' : '#4ade80' }}></div>
          </div>
          <div className="ar-details">
             <span className="ar-p-name">{req.patient_name}</span>
             <span className="ar-p-meta">
                ID: #{req.id.toString().substring(0, 6)} • 32Y • Female
             </span>
          </div>
       </div>

       {/* Clinical Cell */}
       <div className="ar-clinical-cell">
          <span className="ar-reason-text">{req.reason || "Patient seeking neurological assessment for recurring tension headaches."}</span>
          <div className="ar-clinical-tags">
             <span className="ar-clin-badge" style={{ borderColor: isUrgentCase ? '#f8717140' : '#2a2a2f', color: isUrgentCase ? '#f87171' : '#888' }}>
                {isUrgentCase ? "Priority 1" : "Follow-up"}
             </span>
             <span className="ar-clin-badge">{req.consultation_type || 'OPD'}</span>
             <span className="ar-clin-badge">New Case</span>
          </div>
       </div>

       {/* Schedule Cell */}
       <div className="ar-schedule-cell">
          <span className="ar-time-primary">{formatTime(req.appointment_time)}</span>
          <span className="ar-date-secondary">{formatDateSmall(req.appointment_date)}</span>
       </div>

       {/* Conflict Check */}
       <div className="ar-conflict-cell">
          <div className="ar-conflict-flag" style={{ backgroundColor: hasConflict ? '#fbbf24' : '#4ade80' }}></div>
          <span className="ar-conflict-text" style={{ color: hasConflict ? '#fbbf24' : '#4ade80' }}>
             {hasConflict ? "Soft Conflict" : "Clear Slot"}
          </span>
       </div>

       {/* Actions */}
       <div className="ar-decision-cell">
          <button 
            className="ar-triage-btn ar-btn-reject" 
            onClick={() => onAction(req.id, "reject")}
            disabled={actionLoading === req.id + "reject"}
            title="Decline Request"
          >
             {actionLoading === req.id + "reject" ? <RefreshCw className="ar-spin" size={16} /> : <X size={20} />}
          </button>
          <button 
            className="ar-triage-btn ar-btn-suggest" 
            onClick={() => alert("Suggestion engine opening...")}
            title="Suggest Alternate Time"
          >
             <Calendar size={18} />
          </button>
          <button 
            className="ar-triage-btn ar-btn-approve" 
            onClick={() => onAction(req.id, "approve")}
            disabled={actionLoading === req.id + "approve"}
            title="Approve & Schedule"
          >
             {actionLoading === req.id + "approve" ? <RefreshCw className="ar-spin" size={16} /> : <CheckCircle2 size={20} />}
          </button>
       </div>
    </div>
  );
};

// Utilities
const formatDateHeader = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDateSmall = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "10:00 AM";
  const [h, m] = timeStr.split(':');
  const hh = parseInt(h);
  return `${hh % 12 || 12}:${m} ${hh >= 12 ? 'PM' : 'AM'}`;
};

export default AppointmentRequests;
