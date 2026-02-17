import { useState, useEffect } from "react";
import { getDoctors } from "../../api/appointments";
import "../../styles/appointments.css";

const AppointmentForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    doctor_id: "",
    doctor_name: "", // To show name in summary
    date: "",
    time: "",
    reason: "",
    notes: "",
  });

  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors();
        setDoctorsList(data);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "doctor_id") {
      const selectedDoc = doctorsList.find(d => d.id === parseInt(value));
      setFormData({ 
        ...formData, 
        doctor_id: value, 
        doctor_name: selectedDoc ? selectedDoc.full_name : "" 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    console.log("Manual Submit Triggered test", formData); // Debug
    // Manual validation
    if (!formData.doctor_id || !formData.date || !formData.time || !formData.reason) {
        alert("Please fill in all required fields.");
        return;
    }
    setShowConfirm(true);
  };

  const handleFinalSubmit = () => {
    onSubmit(formData);
    setShowConfirm(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="booking-wrapper-card">
        {/* INTERNAL HEADER */}
        <div className="booking-header-internal">
            <h2>Book Appointment</h2>
            <p>Schedule your consultation with our specialists</p>
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="book-appointment-layout">
          {/* Left Side: Booking Form */}
          <div className="booking-form-section">
            <div className="book-appointment-card compact-card">
              
                
                <span className="form-section-title">Appointment Details</span>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Select Doctor</label>
                    <select
                      name="doctor_id"
                      value={formData.doctor_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        {loadingDoctors ? "Loading specialists..." : "Choose a specialist..."}
                      </option>
                      {doctorsList.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.full_name} - {doc.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      min={today}
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <span className="form-section-title" style={{ marginTop: '20px' }}>Consultation Details</span>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Reason</label>
                    <input
                      type="text"
                      name="reason"
                      placeholder="e.g., Follow-up..."
                      value={formData.reason}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      placeholder="Any symptoms?"
                      value={formData.notes}
                      onChange={handleChange}
                      className="compact-textarea"
                    />
                  </div>
                </div>

                {/* Mobile Only Submit Button */}
                <div className="mobile-submit-btn">
                  <button type="submit" className="submit-btn" disabled={loading}>
                    Review & Confirm
                  </button>
                </div>
              
            </div>
          </div>

          {/* Right Side: Sticky Summary */}
          <div className="booking-summary-section">
            <div className="summary-card">
              <h3>Booking Summary</h3>
              <div className="summary-details">
                <div className="summary-row">
                  <span className="label">Doctor</span>
                  <span className="value">{formData.doctor_name || "—"}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Date</span>
                  <span className="value">{formData.date ? new Date(formData.date).toLocaleDateString() : "—"}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Time</span>
                  <span className="value">{formData.time || "—"}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Reason</span>
                  <span className="value">{formData.reason || "—"}</span>
                </div>
              </div>

              <button 
                type="button"
                className="submit-btn" 
                onClick={handleInitialSubmit}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Appointment"}
              </button>
              <p className="terms-text">By booking, you agree to our policies.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay-backdrop" style={{ zIndex: 9999 }}>
          <div className="premium-modal-card">
            <div className="pm-header">
              <div className="pm-title-stack">
                <h3>Confirm Booking</h3>
                <span className="pm-subtitle">Please review your appointment details</span>
              </div>
              <button onClick={() => setShowConfirm(false)} className="pm-close-btn">&times;</button>
            </div>

            <div className="pm-divider"></div>
            
            <div className="confirm-summary">
              
              <div className="pm-doctor-card">
                 <div className="pm-doctor-avatar">
                    {formData.doctor_name ? formData.doctor_name.charAt(0) : "D"}
                 </div>
                 <div className="pm-doctor-info">
                    <span className="pm-doctor-name">{formData.doctor_name}</span>
                    <span className="pm-doctor-spec">Specialist</span>
                 </div>
              </div>

              <div className="pm-slot-comparison" style={{ justifyContent: 'center', gap: '40px' }}>
                 <div className="pm-slot-box" style={{ alignItems: 'center', textAlign: 'center' }}>
                    <span className="pm-slot-label">Date</span>
                    <span className="pm-date">{formData.date ? new Date(formData.date).toLocaleDateString() : "--"}</span>
                 </div>
                 <div className="pm-slot-box" style={{ alignItems: 'center', textAlign: 'center' }}>
                    <span className="pm-slot-label">Time</span>
                    <span className="pm-date">{formData.time || "--"}</span>
                 </div>
              </div>

              <div className="reason-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                 <span className="pm-slot-label" style={{ display: 'block', marginBottom: '6px' }}>Reason for Visit</span>
                 <p style={{ color: '#334155', fontSize: '14px', margin: 0 }}>{formData.reason}</p>
              </div>

            </div>

            <div className="pm-actions">
              <button onClick={() => setShowConfirm(false)} className="pm-btn-secondary">Edit Details</button>
              <button onClick={handleFinalSubmit} className="pm-btn-primary">
                {loading ? <span className="spinner-loader"></span> : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentForm;
