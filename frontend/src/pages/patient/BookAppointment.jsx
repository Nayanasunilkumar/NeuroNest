import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentForm from "../../components/appointments/AppointmentForm";
import { bookAppointment, bookAppointmentBySlot } from "../../api/appointments";
import "../../styles/appointments.css";
import "../../styles/profile.css";

const BookAppointment = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBooking = async (formData) => {
    setError("");
    setLoading(true);
    try {
      if (formData.slot_id) {
        await bookAppointmentBySlot({
          doctor_id: formData.doctor_id,
          slot_id: formData.slot_id,
          reason: formData.reason,
          notes: formData.notes,
          priority_level: formData.priority_level,
          consultation_type: formData.consultation_type,
        });
      } else {
        await bookAppointment({
          ...formData,
          priority_level: formData.priority_level,
        });
      }
      alert("Appointment booked successfully!");
      navigate("/patient/appointments");
    } catch (err) {
      console.error(err);
      const rawError = err.response?.data?.error || err.response?.data?.message || "";
      const safeMessage =
        typeof rawError === "string" && /name\s+'.+'\s+is not defined/i.test(rawError)
          ? "Booking failed due to a server issue. Please try again in a moment."
          : (rawError || "Failed to book appointment.");
      setError(safeMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-appointment-page">
      {/* Main Content Area - no extra padding wrapper */}
      <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
         {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
         <AppointmentForm onSubmit={handleBooking} loading={loading} />
      </div>
    </div>
  );
};

export default BookAppointment;
