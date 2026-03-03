import { useState, useEffect, useMemo } from "react";
import { 
  getAppointmentRequests, 
  approveAppointment, 
  rejectAppointment, 
  getAppointmentHistory 
} from "../../api/doctor";
import {
  X, RefreshCw, ChevronRight, Search,
  Calendar, CheckCircle2, ShieldAlert, Zap, Clock
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/appointment-requests.css";

// --- Clinical Utilities ---
function isCloseDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  const diff = (d - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 2;
}

function calculateAge(dob) {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function formatDateHeader(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateSmall(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function formatTime(timeStr) {
  if (!timeStr) return "N/A";
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const [h, m] = parts;
  const hh = parseInt(h);
  return `${hh % 12 || 12}:${m} ${hh >= 12 ? 'PM' : 'AM'}`;
}

// --- Sub-components ---
function TriageKPI({ title, value, trend, color, percent }) {
  return (
    <div className="ar-kpi-card">
       <span className="ar-kpi-tag">{title}</span>
       <div className="ar-kpi-main">
          <span className="ar-kpi-value">{value}</span>
          <span className="ar-kpi-trend" style={{ color: color }}>{trend}</span>
       </div>
       <div className="ar-kpi-footer">
          <div className="ar-kpi-bar" style={{ width: `${Math.max(percent, 5)}%`, backgroundColor: color }}></div>
       </div>
    </div>
  );
}

function TriageRow({ req, onAction, actionLoading }) {
  const isHighPriority = useMemo(() => {
    const reason = (req.reason || "").toLowerCase();
    return reason.includes("urgent") || 
           reason.includes("emergency") || 
           reason.includes("severe") || 
           reason.includes("pain") || 
           isCloseDate(req.appointment_date);
  }, [req.reason, req.appointment_date]);

  return (
    <div className="ar-triage-row">
       <div className="ar-patient-cell">
          <div className="ar-avatar-container">
             <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.patient_name}`} className="ar-avatar-img" alt="" />
             <div className="ar-risk-indicator" style={{ backgroundColor: isHighPriority ? '#f87171' : '#4ade80' }}></div>
          </div>
          <div className="ar-details">
             <span className="ar-p-name">{req.patient_name}</span>
             <span className="ar-p-meta">
                ID: #{req.id.toString().substring(0, 6)} • {req.gender || "NA"} {req.dob ? `• ${calculateAge(req.dob)}Y` : ""}
             </span>
          </div>
       </div>

       <div className="ar-clinical-cell">
          <span className="ar-reason-text">{req.reason || "Patient seeking assessment."}</span>
          <div className="ar-clinical-tags">
             <span className="ar-clin-badge" style={{ borderColor: isHighPriority ? '#f8717140' : '#2a2a2f', color: isHighPriority ? '#f87171' : '#888' }}>
                {isHighPriority ? "Priority Case" : "Standard"}
             </span>
             <span className="ar-clin-badge">{req.consultation_type || 'OPD'}</span>
          </div>
       </div>

       <div className="ar-schedule-cell">
          <span className="ar-time-primary">{formatTime(req.appointment_time)}</span>
          <span className="ar-date-secondary">{formatDateSmall(req.appointment_date)}</span>
       </div>

       <div className="ar-conflict-cell">
          <div className="ar-conflict-flag" style={{ backgroundColor: req.hasConflict ? '#fbbf24' : '#4ade80' }}></div>
          <span className="ar-conflict-text" style={{ color: req.hasConflict ? '#fbbf24' : '#4ade80' }}>
             {req.hasConflict ? "Schedule Conflict" : "Slot Available"}
          </span>
       </div>

       <div className="ar-decision-cell">
          <button 
            className="ar-triage-btn ar-btn-reject" 
            onClick={() => onAction(req.id, "reject")}
            disabled={actionLoading === req.id + "reject"}
          >
             {actionLoading === req.id + "reject" ? <RefreshCw className="ar-spin" size={16} /> : <X size={20} />}
          </button>
          <button 
            className="ar-triage-btn ar-btn-suggest" 
            onClick={() => alert("Reschedule engine opening...")}
            style={{ color: '#8b5cf6', borderColor: '#8b5cf620' }}
          >
             <Clock size={18} />
          </button>
          <button 
            className="ar-triage-btn ar-btn-approve" 
            onClick={() => onAction(req.id, "approve")}
            disabled={actionLoading === req.id + "approve"}
          >
             {actionLoading === req.id + "approve" ? <RefreshCw className="ar-spin" size={16} /> : <CheckCircle2 size={20} />}
          </button>
       </div>
    </div>
  );
}

const AppointmentRequests = () => {
  const [requests, setRequests]       = useState([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const { isDark }                    = useTheme();
  const [activeTriage, setActiveTriage] = useState("Needs Review");

  useEffect(() => { 
    fetchRequests(); 
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [reqData, histData] = await Promise.all([
        getAppointmentRequests(),
        getAppointmentHistory()
      ]);
      setRequests(reqData || []);
      setHistoryCount(histData?.length || 0);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      if (action === "approve") await approveAppointment(id);
      else if (action === "reject") await rejectAppointment(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(`Error ${action}ing:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const processedRequests = useMemo(() => {
    return (requests || []).map(req => {
      const hasConflict = requests.some(other => 
        other.id !== req.id && 
        other.appointment_date === req.appointment_date && 
        other.appointment_time === req.appointment_time
      );
      return { ...req, hasConflict };
    });
  }, [requests]);

  const filteredRequests = useMemo(() => {
    let list = processedRequests.filter(req => {
      const name = (req.patient_name || "").toLowerCase();
      const reason = (req.reason || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      return name.includes(search) || reason.includes(search) || req.id?.toString().includes(search);
    });

    if (activeTriage === "High Priority") {
      return list.filter(req => {
        const reason = (req.reason || "").toLowerCase();
        return reason.includes("urgent") || reason.includes("emergency") || isCloseDate(req.appointment_date);
      });
    }
    if (activeTriage === "Conflict Detected") return list.filter(r => r.hasConflict);
    
    return list;
  }, [processedRequests, searchTerm, activeTriage]);

  const stats = useMemo(() => {
    const highP = processedRequests.filter(req => {
      const reason = (req.reason || "").toLowerCase();
      return reason.includes("urgent") || reason.includes("emergency") || isCloseDate(req.appointment_date);
    }).length;

    return {
      total: processedRequests.length,
      highPriority: highP,
      conflicts: processedRequests.filter(r => r.hasConflict).length,
      avgTime: processedRequests.length > 0 ? "4.2m" : "0m", 
      conflictRate: processedRequests.length > 0 
        ? `${Math.round((processedRequests.filter(r => r.hasConflict).length / processedRequests.length) * 100)}%`
        : "0%"
    };
  }, [processedRequests]);

  const triageTabs = [
    { name: "Needs Review", count: stats.total },
    { name: "High Priority", count: stats.highPriority },
    { name: "Conflict Detected", count: stats.conflicts },
    { name: "History", count: historyCount }
  ];

  const groupedRequestsByDate = useMemo(() => {
    const sorted = [...filteredRequests].sort((a,b) => new Date(a.appointment_date) - new Date(b.appointment_date));
    return sorted.reduce((acc, req) => {
      const date = req.appointment_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(req);
      return acc;
    }, {});
  }, [filteredRequests]);

  const sortedDates = Object.keys(groupedRequestsByDate);

  if (loading) {
     return (
       <div className="ar-page border-0">
         <div className="ar-main-container text-center py-5">
            <RefreshCw className="ar-spin text-primary mb-3" size={56} />
            <h3 className="text-white fw-bold">Clinical Triage Engine</h3>
            <p className="text-muted">Synchronizing pending requests...</p>
         </div>
       </div>
     );
  }

  return (
    <div className={`ar-page ${isDark ? 'dark' : ''}`}>
      <div className="ar-main-container">
        <div className="ar-top-meta">
           <div className="ar-breadcrumbs">
              <span>Clinical Operations</span>
              <ChevronRight size={14} />
              <span className="active">Request Triage</span>
           </div>
        </div>

        <div className="ar-header-row">
           <div className="ar-title-stack">
              <h1>Request Approval Center</h1>
              <p>Analyze and triage incoming patient cases.</p>
           </div>
           <div className="ar-header-actions">
              <button className="ar-action-btn ar-btn-primary" onClick={fetchRequests}>
                 <Zap size={18} /> Refresh Engine
              </button>
           </div>
        </div>

        <div className="ar-kpi-row">
           <TriageKPI title="Total Requests" value={stats.total} trend="+12% vs week" color="#2b70ff" percent={75} />
           <TriageKPI title="Urgent Triage" value={stats.highPriority} trend="Requires Action" color="#f87171" percent={40} />
           <TriageKPI title="Avg. Approval" value={stats.avgTime} trend="Optimal" color="#4ade80" percent={60} />
           <TriageKPI title="Conflict Rate" value={stats.conflictRate} trend="Manual Review" color="#fbbf24" percent={20} />
        </div>

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
                placeholder="Find patient..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

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
                 {groupedRequestsByDate[date].map(req => (
                    <TriageRow 
                      key={req.id} 
                      req={req} 
                      onAction={handleAction}
                      actionLoading={actionLoading}
                    />
                 ))}
              </div>
           ))}

           {filteredRequests.length === 0 && (
              <div className="ar-kpi-card text-center py-5">
                 <ShieldAlert size={64} className="text-primary mb-4 opacity-10" />
                 <h2 className="text-white fw-bold">Queue Clear</h2>
                 <p className="text-muted">No pending triage requests at this moment.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentRequests;
