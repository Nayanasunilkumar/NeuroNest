import { useState, useEffect } from "react";
import { getAppointmentRequests, approveAppointment, rejectAppointment } from "../../api/doctor";
import {
  Check, X, Clock, Calendar, MessageSquare,
  CheckCircle2, XCircle, Inbox, RefreshCw,
  Stethoscope, AlertCircle, ChevronRight,
  TrendingUp, Users, Activity, Plus, Search,
  PieChart, MessageCircle, BarChart3, Star, Layers,
  ChevronLeft, MoreVertical, Phone, Mail
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/appointment-requests.css";

const AppointmentRequests = () => {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const { isDark }                    = useTheme();
  const [activeTab, setActiveTab ]    = useState("In Queue");

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

  // Group requests by date
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
            <RefreshCw className="ar-spin text-primary mb-3" size={48} />
            <h3 className="text-white">Synchronizing Patient Queue...</h3>
         </div>
       </div>
     );
  }

  return (
    <div className={`ar-page ${isDark ? 'dark' : ''}`}>
      <div className="ar-main-container">
        
        {/* BREADCRUMBS */}
        <div className="ar-breadcrumbs">
           <span>Patient Queue</span>
           <ChevronRight size={14} />
           <span className="active">Approval New Patient</span>
        </div>

        {/* TOP HEADER */}
        <div className="ar-top-header">
           <h1 className="ar-page-title">Approval New Patient</h1>
           <div className="ar-header-right">
              <div className="ar-date-display">
                 <ChevronLeft size={16} className="cursor-pointer" />
                 <span>December 2024</span>
                 <ChevronRight size={16} className="cursor-pointer" />
              </div>
              <button className="ar-primary-btn">
                 <Plus size={18} /> Add New Appointment
              </button>
           </div>
        </div>

        {/* STAT GRID */}
        <div className="ar-stat-grid">
           <StatBox title="All Apply Queue" value="1,431" trend="+4 In This Month" color="#2b70ff" />
           <StatBox title="New Patient Regular" value="432" trend="+16 In This Month" color="#4ade80" />
           <StatBox title="New Patient Member" value="500" trend="+2 In This Month" color="#fbbf24" />
           <StatBox title="New Patient Member" value="500" trend="+2 In This Month" color="#a78bfa" />
        </div>

        {/* TABS & ACTIONS */}
        <div className="ar-row-actions">
           <div className="ar-tabs">
              {["Accepted", "In Queue", "Urgent", "Archive"].map(tab => (
                 <button 
                  key={tab} 
                  className={`ar-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                 >
                    {tab}
                 </button>
              ))}
           </div>
           <div className="d-flex align-items-center gap-3">
              <div style={{ position: 'relative' }}>
                 <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                 <input 
                  type="text" 
                  placeholder="Search patient..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: '#1a1a1f', border: '1px solid #2a2a2f', borderRadius: 10, padding: '8px 12px 8px 36px', color: 'white', fontSize: '0.85rem' }}
                 />
              </div>
           </div>
        </div>

        {/* PATIENT LIST BY DATE */}
        <div className="ar-list-section">
           <div className="ar-table-header">
              <span>Patient Name</span>
              <span>Patient Contact</span>
              <span>Doctor Name</span>
              <span>Estimation Schedule</span>
              <span>Status</span>
              <span>Actions</span>
           </div>

           {sortedDates.map(date => (
              <div key={date} className="ar-date-group">
                 <div className="ar-date-header">
                    <span className="ar-date-text">{formatDateHeader(date)}</span>
                 </div>
                 {groupedRequests[date].map(req => (
                    <AppointmentRow 
                      key={req.id} 
                      req={req} 
                      onAction={handleAction}
                      actionLoading={actionLoading}
                    />
                 ))}
              </div>
           ))}

           {requests.length === 0 && (
              <div className="ar-stat-box text-center py-5">
                 <Inbox size={48} className="text-muted mb-3 opacity-20" />
                 <h3 className="text-white">Queue is clear</h3>
                 <p className="text-muted">No patient requests awaiting approval.</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};

// Sub-components
const StatBox = ({ title, value, trend, color }) => (
  <div className="ar-stat-box">
    <div className="ar-stat-header">
       <div className="ar-stat-indicator" style={{ backgroundColor: color }}></div>
       <span className="ar-stat-title">{title}</span>
    </div>
    <div className="ar-stat-value">{value}</div>
    <div className="ar-stat-trend" style={{ color: color }}>
       <TrendingUp size={14} /> {trend}
    </div>
  </div>
);

const AppointmentRow = ({ req, onAction, actionLoading }) => {
  const initials = req.patient_name.split(' ').map(n=>n[0]).join('');
  const isUrgent = req.id % 3 === 0; // Mock urgent logic for visual variety

  return (
    <div className="ar-row">
       <div className="ar-col-patient">
          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.patient_name}`} className="ar-avatar" alt="" />
          <div className="ar-name-box">
             <span className="ar-p-name">{req.patient_name}</span>
             <span className="ar-p-id">ID: #{req.id.toString().substring(0, 6)}</span>
          </div>
       </div>

       <div className="ar-col-contact ar-col-subinfo">
          <span className="ar-info-title">+1 234 567 890</span>
          <span className="ar-info-sub">{req.patient_name.toLowerCase().replace(' ', '.')}@mail.com</span>
       </div>

       <div className="ar-col-doctor ar-col-subinfo">
          <span className="ar-info-title">Dr. Amanda Clara</span>
          <span className="ar-info-sub">Neurologist</span>
       </div>

       <div className="ar-col-schedule ar-col-subinfo">
          <span className="ar-info-title">{formatDateSmall(req.appointment_date)}</span>
          <span className="ar-info-sub">{formatTime(req.appointment_time)} - 01:00 PM</span>
       </div>

       <div className="ar-col-status">
          <span className={`ar-badge-status ${isUrgent ? 'ar-badge-urgent' : 'ar-badge-regular'}`}>
             {isUrgent ? 'Urgent' : 'Regular'}
          </span>
       </div>

       <div className="ar-row-buttons">
          <button 
            className="ar-icon-btn ar-btn-close" 
            onClick={() => onAction(req.id, "reject")}
            disabled={actionLoading === req.id + "reject"}
          >
             {actionLoading === req.id + "reject" ? <RefreshCw className="ar-spin" size={16} /> : <X size={18} />}
          </button>
          <button 
            className="ar-icon-btn ar-btn-check" 
            onClick={() => onAction(req.id, "approve")}
            disabled={actionLoading === req.id + "approve"}
          >
             {actionLoading === req.id + "approve" ? <RefreshCw className="ar-spin" size={16} /> : <Check size={18} />}
          </button>
       </div>
    </div>
  );
};

// Utilities
const formatDateHeader = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateSmall = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "10:00 AM";
  const [h, m] = timeStr.split(':');
  const hh = parseInt(h);
  return `${hh % 12 || 12}:${m} ${hh >= 12 ? 'PM' : 'AM'}`;
};

export default AppointmentRequests;
