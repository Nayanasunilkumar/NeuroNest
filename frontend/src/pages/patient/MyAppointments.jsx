import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RescheduleModal from "../../components/appointments/RescheduleModal";
import StatusBadge from "../../components/appointments/StatusBadge";
import {
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
} from "../../api/appointments";
import "../../styles/appointments.css"; // Ensure this imports the updated CSS

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsAppointment, setSelectedDetailsAppointment] = useState(null);

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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await cancelAppointment(id);
      // Optimistic update
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "Cancelled" } : app
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel appointment");
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

  // Filter Logic
  const filteredAppointments = appointments.filter((appt) => {
    const matchesSearch = appt.doctor_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? appt.appointment_date === filterDate : true;
    const matchesStatus =
      filterStatus === "All" || String(appt.status).toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Calculate quick stats — use case-insensitive match since backend returns lowercase enums
  const upcomingCount  = appointments.filter(a => ['pending', 'approved'].includes(String(a.status).toLowerCase())).length;
  const completedCount = appointments.filter(a => String(a.status).toLowerCase() === 'completed').length;
  const cancelledCount = appointments.filter(a => String(a.status).toLowerCase() === 'cancelled').length;
  const pendingFeedback = appointments.filter(a => String(a.status).toLowerCase() === 'completed' && !a.feedback_given).length;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    // Assuming HH:MM:SS format
    return timeStr.substring(0, 5);
  };

  return (
    <div className="my-appointments-page">
      {/* Header Section */}
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

      {/* Statistics Cards (Optional enhancement) */}
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
        {/* Filter Bar */}
        <div className="filter-bar-premium">
          <div className="search-wrapper">
             <span className="search-icon">🔍</span>
             <input
                type="text"
                placeholder="Search by doctor..."
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

        {/* Premium Table Card */}
        <div className="table-card-premium">
          {loading ? (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading appointments...</p>
            </div>
          ) : error ? (
            <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchAppointments} className="retry-btn">Retry</button>
            </div>
          ) : filteredAppointments.length > 0 ? (
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
                    {filteredAppointments.map((appt) => (
                    <tr key={appt.id}>
                        <td>
                             <StatusBadge status={appt.status} />
                        </td>
                        <td>
                            <div className="doctor-info">
                                <span className="doctor-name">{appt.doctor_name}</span>
                                {/* <span className="doctor-sub">Specialist</span> */}
                            </div>
                        </td>
                        <td className="text-muted font-medium">{formatDate(appt.appointment_date)}</td>
                        <td className="text-muted">{formatTime(appt.appointment_time)}</td>
                        <td>
                             <div className="reason-text" title={appt.reason}>
                                {appt.reason}
                             </div>
                        </td>
                        <td>
                             <div className="action-row">
                                {(appt.status === 'Pending' || appt.status === 'Approved' ||
                                  String(appt.status).toLowerCase() === 'pending' ||
                                  String(appt.status).toLowerCase() === 'approved') && (
                                    <>
                                        <button 
                                            className="icon-action-btn reschedule-btn"
                                            onClick={() => openRescheduleModal(appt)}
                                            title="Reschedule Appointment"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        </button>
                                        <button 
                                            className="icon-action-btn cancel-btn"
                                            onClick={() => handleCancel(appt.id)}
                                            title="Cancel Appointment"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </>
                                )}
                                {(appt.status === 'Completed' || String(appt.status).toLowerCase() === 'completed') && (
                                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                     <button
                                        className="icon-action-btn view-btn"
                                        title="View Details"
                                        onClick={() => openDetailsModal(appt)}
                                     >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                     </button>
                                     {!appt.feedback_given && (
                                       <button
                                         title="Leave Feedback"
                                         onClick={() => navigate('/patient/feedback-reviews')}
                                         style={{
                                           display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                           padding: '0.35rem 0.7rem', borderRadius: '8px', border: 'none',
                                           background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                           color: 'white', fontSize: '0.72rem', fontWeight: 800,
                                           cursor: 'pointer', whiteSpace: 'nowrap',
                                           boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                                           transition: 'transform 0.15s, box-shadow 0.15s',
                                         }}
                                         onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(245,158,11,0.4)'; }}
                                         onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(245,158,11,0.3)'; }}
                                       >
                                         ⭐ Review
                                       </button>
                                     )}
                                     {appt.feedback_given && (
                                       <span style={{
                                         padding: '0.3rem 0.55rem', borderRadius: '6px',
                                         background: 'rgba(16,185,129,0.1)', color: '#10b981',
                                         fontSize: '0.65rem', fontWeight: 800,
                                       }}>✓ Reviewed</span>
                                     )}
                                  </div>
                                )}
                             </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          ) : (
            <div className="empty-state-premium">
              <div className="empty-icon-ring">
                 <span style={{ fontSize: '32px' }}>📅</span>
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
              <button className="pm-close-btn" onClick={() => setIsDetailsModalOpen(false)} aria-label="Close">
                ×
              </button>
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

            <div className="pm-actions appointment-details-actions">
              <button className="pm-btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
