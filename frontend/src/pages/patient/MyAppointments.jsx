import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RescheduleModal from "../../components/appointments/RescheduleModal";
import StatusBadge from "../../components/appointments/StatusBadge";
import {
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
  confirmReschedule,
  getAppointmentCallState,
  joinAppointmentCall,
} from "../../api/appointments";
import "../../styles/appointments.css"; 
import { CheckCircle, X, Calendar, Clock, RefreshCw, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

// --- Clinical Utilities ---
function isCloseDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  const diff = (d - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 2;
}

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsAppointment, setSelectedDetailsAppointment] = useState(null);
  const [callStateById, setCallStateById] = useState({});

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.response?.data?.error || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const refreshCallStates = async (sourceAppointments = appointments) => {
    const eligible = (sourceAppointments || []).filter((appt) => {
      const status = String(appt.status || "").toLowerCase();
      return (appt.consultation_type || "in_person") === "online" && ["pending", "approved", "rescheduled"].includes(status);
    });
    if (!eligible.length) {
      setCallStateById({});
      return;
    }

    const results = await Promise.allSettled(
      eligible.map((appt) => getAppointmentCallState(appt.id))
    );

    const nextMap = {};
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        nextMap[eligible[index].id] = result.value;
      }
    });
    setCallStateById(nextMap);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    refreshCallStates();
    const timer = window.setInterval(() => refreshCallStates(), 30000);
    return () => window.clearInterval(timer);
  }, [appointments]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setActionLoading(id + "cancel");
    try {
      await cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "Cancelled" } : app
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel appointment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReschedule = async (id) => {
    setActionLoading(id + "confirm");
    try {
      await confirmReschedule(id);
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "Approved" } : app
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to confirm reschedule");
    } finally {
      setActionLoading(null);
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleReschedule = async (id, newDate, newTime, slotId) => {
    try {
      await rescheduleAppointment(id, newDate, newTime, slotId);
      fetchAppointments();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reschedule");
    }
  };

  const openDetailsModal = (appointment) => {
    setSelectedDetailsAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const filteredAppointments = appointments.filter((appt) => {
    const name = (appt.doctor_name || "").toLowerCase();
    const reason = (appt.reason || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = name.includes(search) || reason.includes(search);
    const matchesDate = filterDate ? appt.appointment_date === filterDate : true;
    const matchesStatus =
      filterStatus === "All" || String(appt.status).toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesDate && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate, filterStatus]);

  const upcomingCount  = appointments.filter(a => ['pending', 'approved', 'rescheduled'].includes(String(a.status).toLowerCase())).length;
  const completedCount = appointments.filter(a => String(a.status).toLowerCase() === 'completed').length;
  const cancelledCount = appointments.filter(a => String(a.status).toLowerCase() === 'cancelled' || String(a.status).toLowerCase() === 'cancelled_by_patient').length;
  const pendingFeedback = appointments.filter(a => String(a.status).toLowerCase() === 'completed' && !a.feedback_given).length;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    return timeStr ? timeStr.substring(0, 5) : "N/A";
  };

  const formatCallTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const getCallStatusText = (appt, callState) => {
    if (!callState) return null;
    const state = callState.call_state || {};

    if (state.missed) return "Appointment marked as missed";
    if (state.both_joined || callState.call_status === "ongoing") return "Video call started";
    if (!state.patient_can_join_now) return `Join available at ${formatCallTime(callState.join_enabled_patient_time)}`;
    if (state.patient_joined && !state.doctor_joined) return "You joined. Waiting for doctor";
    if (!state.patient_joined && state.doctor_joined) return "Doctor is waiting. Join now";
    if (state.patient_can_join_now && !state.doctor_joined) return "Waiting for doctor to join";
    return null;
  };

  const handleJoinOnlineCall = async (appointmentId) => {
    setActionLoading(`${appointmentId}join`);
    try {
      const payload = await joinAppointmentCall(appointmentId);
      setCallStateById((prev) => ({ ...prev, [appointmentId]: payload }));
      navigate(`/consultation/${payload.room_id || `appointment-${appointmentId}`}`);
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || "Unable to join call right now");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="my-appointments-page">
      <div className="page-header-flex">
        <div className="header-text">
          <h2>My Appointments</h2>
          <p>Manage and track your scheduled consultations</p>
        </div>
        <button
          className="primary-btn-premium"
          onClick={() => navigate("/patient/book")}
        >
          + Book Appointment
        </button>
      </div>

      <div className="stats-row">
        <div className="mini-stat-card">
            <span className="stat-label">Upcoming</span>
            <span className="stat-value text-blue">{upcomingCount}</span>
        </div>
        <div className="mini-stat-card">
            <span className="stat-label">Completed</span>
            <span className="stat-value text-green">{completedCount}</span>
        </div>
        <div className="mini-stat-card">
            <span className="stat-label">Cancelled</span>
            <span className="stat-value text-red">{cancelledCount}</span>
        </div>
        {pendingFeedback > 0 && (
          <div className="mini-stat-card" style={{ borderTop: '3px solid #f59e0b', cursor: 'pointer' }} onClick={() => navigate('/patient/feedback-reviews')}>
            <span className="stat-label">⭐ Awaiting Review</span>
            <span className="stat-value" style={{ color: '#f59e0b' }}>{pendingFeedback}</span>
          </div>
        )}
      </div>

      <div className="appointments-content-wrapper">
        <div className="filter-bar-premium">
          <div className="search-wrapper">
             <span className="search-icon">🔍</span>
             <input
                type="text"
                placeholder="Search by doctor or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          
          <div className="filter-group">
            <input
                type="date"
                className="premium-filter-input"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
            />
            <select
                className="premium-filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rescheduled">Action Required</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
            {(searchTerm || filterDate || filterStatus !== 'All') && (
                <button 
                    className="reset-filters-btn"
                    onClick={() => {
                        setSearchTerm("");
                        setFilterDate("");
                        setFilterStatus("All");
                    }}
                >
                    Reset
                </button>
            )}
          </div>
        </div>

        <div className="table-card-premium">
          {loading ? (
            <div className="loading-state text-center py-5">
                <RefreshCw className="spinner mb-3" />
                <p>Loading appointments...</p>
            </div>
          ) : error ? (
            <div className="error-state text-center py-5">
                <p className="text-danger">{error}</p>
                <button onClick={fetchAppointments} className="retry-btn">Retry</button>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <>
            <div className="table-responsive">
                <table className="premium-table">
                <thead>
                    <tr>
                    <th style={{ width: '15%' }}>Status</th>
                    <th style={{ width: '20%' }}>Doctor</th>
                    <th style={{ width: '15%' }}>Date</th>
                    <th style={{ width: '10%' }}>Time</th>
                    <th style={{ width: '25%' }}>Reason</th>
                    <th style={{ width: '15%' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentAppointments.map((appt) => {
                      const status = String(appt.status).toLowerCase();
                      const isUpcoming = ['pending', 'approved', 'rescheduled'].includes(status);
                      const isRescheduled = status === 'rescheduled';
                      const isOnline = (appt.consultation_type || "in_person") === "online";
                      const callData = callStateById[appt.id];
                      const callState = callData?.call_state || {};
                      const joinDisabled = !callState.patient_can_join_now || callState.missed;
                      const callStatusText = getCallStatusText(appt, callData);
                      
                      return (
                        <tr key={appt.id}>
                            <td>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <StatusBadge status={appt.status} />
                                    {isUpcoming && ((appt.reason || "").toLowerCase().includes("urgent") || (appt.reason || "").toLowerCase().includes("emergency") || (appt.reason || "").toLowerCase().includes("severe") || isCloseDate(appt.appointment_date)) && (
                                       <span className="priority-tag-mini">
                                          <AlertCircle size={10} /> Priority
                                       </span>
                                    )}
                                 </div>
                            </td>
                            <td>
                                <div className="doctor-info">
                                    <span className="doctor-name">{appt.doctor_name}</span>
                                    {appt.doctor_id && (
                                      <button
                                        type="button"
                                        className="btn btn-link p-0 ms-2"
                                        style={{ fontSize: "12px", textDecoration: "none", fontWeight: 700 }}
                                        onClick={() => navigate(`/patient/doctor/${appt.doctor_id}`)}
                                      >
                                        View Profile
                                      </button>
                                    )}
                                </div>
                            </td>
                            <td className="text-muted font-medium">{formatDate(appt.appointment_date)}</td>
                            <td className="text-muted">{formatTime(appt.appointment_time)}</td>
                            <td>
                                 <div className="reason-text" title={appt.reason}>
                                    {appt.reason}
                                 </div>
                                 {isOnline && callData && (
                                   <div style={{ marginTop: 8, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                                     Doctor status: {callState.doctor_joined ? "Joined" : "Not joined yet"}
                                   </div>
                                 )}
                                 {isOnline && callStatusText && (
                                   <div style={{ marginTop: 4, fontSize: 12, color: "#475569" }}>
                                     {callStatusText}
                                   </div>
                                 )}
                            </td>
                            <td>
                                 <div className="action-row">
                                    {isRescheduled && (
                                      <button 
                                          className="icon-action-btn approve-btn"
                                          onClick={() => handleConfirmReschedule(appt.id)}
                                          title="Accept New Time"
                                          disabled={actionLoading === appt.id + "confirm"}
                                          style={{ color: '#10b981', borderColor: '#10b98120' }}
                                      >
                                          {actionLoading === appt.id + "confirm" ? <RefreshCw size={14} className="spinner" /> : <CheckCircle size={18} />}
                                      </button>
                                    )}

                                    {isUpcoming && (
                                        <>
                                            {isOnline && (
                                              <button
                                                className="icon-action-btn"
                                                onClick={() => handleJoinOnlineCall(appt.id)}
                                                title={joinDisabled ? "Join not available yet" : "Join video call"}
                                                disabled={joinDisabled || actionLoading === `${appt.id}join`}
                                                style={{
                                                  borderColor: joinDisabled ? "#cbd5e1" : "#0ea5e9",
                                                  color: joinDisabled ? "#94a3b8" : "#0284c7",
                                                }}
                                              >
                                                {actionLoading === `${appt.id}join` ? <RefreshCw size={14} className="spinner" /> : "Join"}
                                              </button>
                                            )}
                                            <button 
                                                className="icon-action-btn reschedule-btn"
                                                onClick={() => openRescheduleModal(appt)}
                                                title="Reschedule Appointment"
                                            >
                                                <Calendar size={18} />
                                            </button>
                                            <button 
                                                className="icon-action-btn cancel-btn"
                                                onClick={() => handleCancel(appt.id)}
                                                title="Cancel Appointment"
                                                disabled={actionLoading === appt.id + "cancel"}
                                            >
                                                {actionLoading === appt.id + "cancel" ? <RefreshCw size={14} className="spinner" /> : <X size={18} />}
                                            </button>
                                        </>
                                    )}
                                    {status === 'completed' && (
                                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                         <button
                                            className="icon-action-btn view-btn"
                                            title="View Details"
                                            onClick={() => openDetailsModal(appt)}
                                         >
                                            <Clock size={18} />
                                         </button>
                                         {!appt.feedback_given && (
                                           <button
                                             title="Leave Feedback"
                                             onClick={() => navigate(`/patient/feedback-reviews?appointmentId=${appt.id}`)}
                                             className="feedback-pill-btn"
                                           >
                                             ⭐ Review
                                           </button>
                                         )}
                                      </div>
                                    )}
                                 </div>
                            </td>
                        </tr>
                      );
                    })}
                </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="pagination-bar-premium">
                    <div className="pagination-info">
                        Showing <span>{indexOfFirstItem + 1}</span> to <span>{Math.min(indexOfLastItem, filteredAppointments.length)}</span> of <span>{filteredAppointments.length}</span> appointments
                    </div>
                    <div className="pagination-controls">
                        <button 
                            className="p-btn" 
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        {[...Array(totalPages)].map((_, idx) => (
                            <button 
                                key={idx + 1}
                                className={`p-number ${currentPage === idx + 1 ? 'active' : ''}`}
                                onClick={() => handlePageChange(idx + 1)}
                            >
                                {idx + 1}
                            </button>
                        ))}

                        <button 
                            className="p-btn" 
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
            </>
          ) : (
            <div className="empty-state-premium">
              <div className="empty-icon-ring">
                 <Calendar size={32} className="text-muted" />
              </div>
              <h3>No appointments found</h3>
              <p>You haven't booked any appointments yet, or no appointments match your filters.</p>
              <button
                className="secondary-btn-premium"
                onClick={() => navigate("/patient/book")}
              >
                Book Your First Appointment
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedAppointment && (
        <RescheduleModal
          isOpen={isModalOpen}
          currentAppointment={selectedAppointment}
          onClose={() => setIsModalOpen(false)}
          onSave={handleReschedule}
        />
      )}

      {isDetailsModalOpen && selectedDetailsAppointment && (
        <div className="modal-overlay-backdrop" onClick={() => setIsDetailsModalOpen(false)}>
          <div
            className="premium-modal-card appointment-details-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 560, width: "92%", padding: "28px" }}
          >
            <div className="pm-header">
              <div className="pm-title-stack">
                <h3>Appointment Details</h3>
                <span className="pm-subtitle">Completed consultation summary</span>
              </div>
              <button className="pm-close-btn" onClick={() => setIsDetailsModalOpen(false)}>×</button>
            </div>
            <div className="pm-divider"></div>
            <div className="appointment-details-grid">
              <div className="appointment-details-row">
                <span className="label">Doctor</span>
                <span className="value">{selectedDetailsAppointment.doctor_name}</span>
              </div>
              <div className="appointment-details-row">
                <span className="label">Date</span>
                <span className="value">{formatDate(selectedDetailsAppointment.appointment_date)}</span>
              </div>
              <div className="appointment-details-row">
                <span className="label">Time</span>
                <span className="value">{formatTime(selectedDetailsAppointment.appointment_time)}</span>
              </div>
              <div className="appointment-details-row">
                <span className="label">Status</span>
                <span className="value">
                  <StatusBadge status={selectedDetailsAppointment.status} />
                </span>
              </div>
              <div className="appointment-details-row">
                <span className="label">Reason</span>
                <span className="value">{selectedDetailsAppointment.reason || "Not provided"}</span>
              </div>
              <div className="appointment-details-row">
                <span className="label">Notes</span>
                <span className="value">{selectedDetailsAppointment.notes || "No notes added"}</span>
              </div>
            </div>
            <div className="pm-actions mt-4 text-end">
              <button className="btn btn-secondary rounded-pill px-4" onClick={() => setIsDetailsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


export default MyAppointments;
