import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  open:         { icon: <LoaderCircle size={16} />,  label: 'Under Review',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  investigating:{ icon: <AlertTriangle size={16} />, label: 'Investigating',  color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  resolved:     { icon: <CheckCircle2 size={16} />,  label: 'Resolved',       color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  closed:       { icon: <XCircle size={16} />,       label: 'Closed',         color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

const ComplaintStatusCard = ({ complaints }) => {
  if (!complaints || complaints.length === 0) return null;

  return (
    <div className="csc-section">
      <div className="csc-header">
        <AlertTriangle size={16} color="#ef4444" />
        <span>Complaint Tracking</span>
      </div>

      <div className="csc-list">
        {complaints.map((c) => {
          const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
          return (
            <div key={c.complaint_id} className="csc-card" style={{ borderLeftColor: cfg.color }}>
              <div className="csc-card-top">
                <div>
                  <div className="csc-complaint-id">Complaint #{c.complaint_id}</div>
                  <div className="csc-doctor">Dr. {c.doctor_name}</div>
                </div>
                <div className="csc-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon} {cfg.label}
                </div>
              </div>

              <div className="csc-details">
                <div className="csc-detail-row">
                  <Clock size={11} />
                  <span>Filed on {c.created_at}</span>
                </div>
                {c.appointment_id && (
                  <div className="csc-detail-row">
                    <span>Appointment #{c.appointment_id}</span>
                  </div>
                )}
                {c.reason && (
                  <div className="csc-reason">"{c.reason}"</div>
                )}
              </div>

              {/* Status timeline */}
              <div className="csc-timeline">
                {['open', 'investigating', 'resolved'].map((step, i) => {
                  const reached = ['open', 'investigating', 'resolved', 'closed'].indexOf(c.status) >= i;
                  return (
                    <div key={step} className="csc-step">
                      <div className="csc-step-dot" style={{
                        background: reached ? cfg.color : 'rgba(0,0,0,0.1)',
                        boxShadow: reached ? `0 0 6px ${cfg.color}66` : 'none',
                      }} />
                      <span className="csc-step-label" style={{ color: reached ? cfg.color : '#94a3b8' }}>
                        {STATUS_CONFIG[step]?.label || step}
                      </span>
                      {i < 2 && <div className="csc-step-line" style={{ background: reached && ['open','investigating','resolved','closed'].indexOf(c.status) > i ? cfg.color : 'rgba(0,0,0,0.08)' }} />}
                    </div>
                  );
                })}
              </div>

              <div className="csc-note">
                <AlertTriangle size={11} />
                Your complaint is being reviewed by our clinical governance team. You will be notified of the resolution.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComplaintStatusCard;
