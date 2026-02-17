import { useState, useEffect } from "react";
import "../../styles/appointments.css";

const RescheduleModal = ({ isOpen, onClose, onSave, currentAppointment }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // For validation messages

  // Update local state when appointment changes
  useEffect(() => {
    if (currentAppointment) {
      setDate(currentAppointment.appointment_date);
      setTime(currentAppointment.appointment_time);
    }
  }, [currentAppointment]);

  if (!isOpen || !currentAppointment) return null;

  const handleSave = async () => {
    // Validation
    setError("");
    if (!date || !time) {
        setError("Please select both a new date and time.");
        return;
    }
    
    // Check if slot is same as current (optional but good UX)
    if (date === currentAppointment.appointment_date && time === currentAppointment.appointment_time) {
        setError("Please select a different slot.");
        return;
    }

    setLoading(true);
    try {
        await onSave(currentAppointment.id, date, time);
        // Modal will be closed by parent on success, or we can close here.
        // Parent implementation closes it, so we don't need to do anything else.
        // But if we want to show loading, we should wait.
    } catch {
        setError("Failed to reschedule. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay-backdrop">
      <div className="premium-modal-card">
        {/* Header */}
        <div className="pm-header">
          <div className="pm-title-stack">
            <h3>Reschedule Appointment</h3>
            <span className="pm-subtitle">Update your consultation slot</span>
          </div>
          <button onClick={onClose} className="pm-close-btn" aria-label="Close">
            &times;
          </button>
        </div>
        
        {/* Divider */}
        <div className="pm-divider"></div>

        {/* Doctor Info Card */}
        <div className="pm-doctor-card">
            <div className="pm-doctor-avatar">
                {currentAppointment.doctor_name.charAt(0)}
            </div>
            <div className="pm-doctor-info">
                <span className="pm-doctor-name">{currentAppointment.doctor_name}</span>
                <span className="pm-doctor-spec">Specialist</span>
            </div>
        </div>

        {/* Slot Comparison */}
        <div className="pm-slot-comparison">
            <div className="pm-slot-box current">
                <span className="pm-slot-label">Current Slot</span>
                <div className="pm-slot-details">
                    <span className="pm-date">{new Date(currentAppointment.appointment_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="pm-time">{currentAppointment.appointment_time.substring(0, 5)}</span>
                </div>
            </div>
            
            <div className="pm-slot-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>

            <div className="pm-slot-box new">
                <span className="pm-slot-label">New Slot</span>
                <div className="pm-slot-details">
                     {date ? (
                         <>
                            <span className="pm-date">{new Date(date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="pm-time">{time || "--:--"}</span>
                         </>
                     ) : (
                         <span className="pm-placeholder">Select below</span>
                     )}
                </div>
            </div>
        </div>

        {/* Inputs */}
        <div className="pm-form-grid">
          <div className="pm-form-group">
            <label>New Date</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={ !date ? "input-empty" : ""}
            />
          </div>

          <div className="pm-form-group">
            <label>New Time</label>
            <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pm-time-select"
            >
                <option value="">Select Time</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">01:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM</option>
            </select>
          </div>
        </div>

        {/* Validation Error */}
        {error && <div className="pm-error-msg">{error}</div>}

        {/* Actions */}
        <div className="pm-actions">
          <button onClick={onClose} className="pm-btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="pm-btn-primary"
            disabled={loading || !date || !time}
          >
            {loading ? (
                <span className="spinner-loader"></span>
            ) : "Confirm Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
