import React from "react";

const IncomingCallCard = ({ call, timeLeft = 30, onAccept, onDecline, onDismiss }) => {
  if (!call) return null;

  const callerName = call.caller_name || "Unknown caller";
  const initial = callerName.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      className="position-fixed shadow-lg rounded-4 border bg-white p-3"
      style={{
        right: "1rem",
        bottom: "1rem",
        width: "min(360px, calc(100vw - 2rem))",
        zIndex: 1080,
        animation: "incoming-call-slide-in 220ms ease-out",
      }}
    >
      <div className="d-flex align-items-start gap-3">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
          style={{ width: 44, height: 44, background: "#dbeafe", color: "#1e40af", flexShrink: 0 }}
        >
          {initial}
        </div>
        <div className="flex-grow-1">
          <div className="fw-bold text-dark">{callerName}</div>
          <div className="small text-muted">Incoming video call</div>
          <div className="small text-secondary mt-1">Auto-dismiss in {timeLeft}s</div>
        </div>
        <button type="button" className="btn btn-sm btn-light border-0" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      </div>

      <div className="d-flex gap-2 mt-3">
        <button type="button" className="btn btn-success flex-fill fw-semibold" onClick={onAccept}>
          Accept
        </button>
        <button type="button" className="btn btn-danger flex-fill fw-semibold" onClick={onDecline}>
          Decline
        </button>
      </div>

      <style>{`
        @keyframes incoming-call-slide-in {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default IncomingCallCard;

