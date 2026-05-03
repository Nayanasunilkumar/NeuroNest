import StatusBadge from "./StatusBadge";
import "../../styles/appointments.css";

const AppointmentCard = ({ appointment, onCancel, onReschedule }) => {
  const {
    id,
    doctor_name,
    appointment_date,
    appointment_time,
    reason,
    status
  } = appointment;

  const isCancellable = status === "Pending" || status === "Approved";

  const handleCancelClick = () => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      onCancel(id);
    }
  };

  const dayName = new Date(appointment_date).toLocaleDateString("en-US", { weekday: "short" });
  const formattedDate = new Date(appointment_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  
  // Basic time formatting assuming HH:MM:SS or HH:MM
  const timeString = appointment_time.substring(0, 5); // Simple slice for now

  return (
    <div className="appointment-card">
      <div className="card-header">
        <div className="doctor-info">
          <h4>{doctor_name}</h4>
          <span className="specialty">Specialist</span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="icon">📅</span>
          <span>{dayName}, {formattedDate}</span>
        </div>
        <div className="info-row">
          <span className="icon">⏰</span>
          <span>{timeString}</span>
        </div>
        <div className="info-row">
          <span className="icon">📝</span>
          <span>{reason}</span>
        </div>
      </div>

      {isCancellable && (
        <div className="card-actions">
          <button
            className="btn-outline"
            onClick={() => onReschedule(appointment)}
          >
            Reschedule
          </button>
          <button
            className="btn-outline btn-danger"
            onClick={handleCancelClick}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
