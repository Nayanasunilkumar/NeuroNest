import { useState, useEffect } from "react";
import { getAvailableSlots } from "../../api/appointments";
import "../../styles/appointments.css";

const RescheduleModal = ({ isOpen, onClose, onSave, currentAppointment }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // For validation messages

  // Update local state when appointment changes
  useEffect(() => {
    if (currentAppointment) {
      setDate(currentAppointment.appointment_date);
      setTime("");
      setSelectedSlotId("");
      setAvailableSlots([]);
    }
  }, [currentAppointment]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!isOpen || !currentAppointment?.doctor_id || !date) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const response = await getAvailableSlots(currentAppointment.doctor_id, date);
        const slots = Array.isArray(response?.slots) ? response.slots : [];
        const filtered = slots.filter(
          (slot) => String(slot.id) !== String(currentAppointment.slot_id),
        );
        setAvailableSlots(filtered);
        if (filtered.length === 0) {
          setSelectedSlotId("");
          setTime("");
          setError("No available slots for selected date.");
        } else {
          setError("");
        }
      } catch (e) {
        setAvailableSlots([]);
        setSelectedSlotId("");
        setTime("");
        setError("Unable to load available slots for this date.");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [currentAppointment, date, isOpen]);

  if (!isOpen || !currentAppointment) return null;

  const normalizeTime = (value = "") => String(value).slice(0, 5);
  const currentTime = normalizeTime(currentAppointment.appointment_time);

  const handleSave = async () => {
    // Validation
    setError("");
    if (!date || !selectedSlotId || !time) {
        setError("Please select an available slot.");
        return;
    }
    
    // Check if slot is same as current (optional but good UX)
    if (date === currentAppointment.appointment_date && time === currentTime) {
        setError("Please select a different slot.");
        return;
    }

    setLoading(true);
    try {
        await onSave(currentAppointment.id, date, time, selectedSlotId);
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
                    <span className="pm-time">{currentTime}</span>
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
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedSlotId("");
                setTime("");
                setError("");
              }}
              className={ !date ? "input-empty" : ""}
            />
          </div>

          <div className="pm-form-group">
            <label>New Time</label>
            <select
                value={selectedSlotId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedSlotId(nextId);
                  const selectedSlot = availableSlots.find((slot) => String(slot.id) === String(nextId));
                  if (!selectedSlot) {
                    setTime("");
                    return;
                  }
                  const localTime = new Date(selectedSlot.slot_start_utc).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Asia/Kolkata",
                  });
                  setTime(localTime);
                }}
                className="pm-time-select"
                disabled={loadingSlots}
            >
                <option value="">
                  {loadingSlots ? "Loading slots..." : "Select Time"}
                </option>
                {availableSlots.map((slot) => {
                  const label = new Date(slot.slot_start_utc).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  });
                  return (
                    <option key={slot.id} value={slot.id}>
                      {label}
                    </option>
                  );
                })}
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
            disabled={loading || !date || !selectedSlotId || !time}
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
