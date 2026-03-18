import React from "react";

const toneStyles = {
  info: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  success: { bg: "#ecfdf5", border: "#a7f3d0", text: "#047857" },
  warning: { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
  danger: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
};

const VideoCallCard = ({ visible, tone = "info", title, message, onClose }) => {
  if (!visible) return null;
  const toneStyle = toneStyles[tone] || toneStyles.info;

  return (
    <div
      className="position-fixed rounded-4 shadow border p-3"
      style={{
        right: "1rem",
        bottom: "6.5rem",
        width: "min(360px, calc(100vw - 2rem))",
        zIndex: 1075,
        background: toneStyle.bg,
        borderColor: toneStyle.border,
      }}
    >
      <div className="d-flex justify-content-between gap-3">
        <div>
          <div className="fw-bold" style={{ color: toneStyle.text }}>
            {title}
          </div>
          <div className="small text-secondary">{message}</div>
        </div>
        {onClose ? (
          <button type="button" className="btn btn-sm btn-light border-0" onClick={onClose} aria-label="Close">
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default VideoCallCard;

