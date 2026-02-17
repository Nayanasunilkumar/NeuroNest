import "../../styles/appointments.css"; // Ensure styles are linked

const StatusBadge = ({ status }) => {
  const normalizedStatus = String(status || "").toLowerCase().trim();

  const getStatusClass = (value) => {
    switch (value) {
      case "pending":
        return "status-badge status-pending";
      case "confirmed":
      case "approved":
        return "status-badge status-approved";
      case "cancelled":
        return "status-badge status-cancelled";
      case "rejected":
        return "status-badge status-rejected";
      case "completed":
        return "status-badge status-completed";
      case "no-show":
      case "noshow":
        return "status-badge status-no-show";
      default:
        return "status-badge";
    }
  };

  const getStatusIcon = (value) => {
    switch (value) {
      case "approved":
      case "confirmed":
        return "✓";
      case "rejected":
      case "cancelled":
        return "✕";
      case "completed":
        return "•";
      case "pending":
        return "…";
      case "no-show":
      case "noshow":
        return "!";
      default:
        return "•";
    }
  };

  const label = status || "Unknown";

  return (
    <span className={getStatusClass(normalizedStatus)} aria-label={`Status ${label}`}>
      <span className="status-badge-icon">{getStatusIcon(normalizedStatus)}</span>
      <span className="status-badge-text">{label}</span>
    </span>
  );
};

export default StatusBadge;
