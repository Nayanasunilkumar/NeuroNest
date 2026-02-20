import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, Shield, ShieldAlert, User, MessageSquare, 
  Trash2, Flag, CheckCircle, ExternalLink, AlertOctagon 
} from 'lucide-react';

const ReviewDetailModal = ({ review, onClose, onModerate }) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!review) return null;

  const handleAction = async (action) => {
    setIsSubmitting(true);
    const success = await onModerate(review.id, {
      action,
      note,
      admin_id: 1, // Mock admin ID
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return ReactDOM.createPortal(
    <div className="appt-modal-portal">
      <div className="appt-modal-overlay" onClick={onClose} />
      <div className="appt-modal-container">
        <div className="appt-modal-nexus enterprise-theme">
          <div className="modal-header-nexus">
            <div className="header-left-nexus">
              <div className="institutional-tag">
                <Shield size={10} /> Institutional Quality Audit
              </div>
              <h1>Review Oversight: #{review.id.toString().padStart(4, '0')}</h1>
            </div>
            <button className="sidebar-close-btn" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="modal-body-scroll">
            {/* Identity Grid */}
            <div className="identity-matrix">
              <div className="identity-card">
                <div className="card-header"><User size={12} /> Patient Identity</div>
                <div className="card-content">
                  <h3 className="identity-title">{review.patient_name}</h3>
                  <div className="identity-sub">Verified Service Recipient</div>
                  <div className="meta-tag">ID: P-{review.patient_id}</div>
                </div>
              </div>

              <div className="identity-card">
                <div className="card-header"><Shield size={12} /> Medical Provider</div>
                <div className="card-content">
                  <h3 className="identity-title">{review.doctor_name}</h3>
                  <div className="identity-sub">Attending Clinician</div>
                  <div className="meta-tag">License: Verified</div>
                </div>
              </div>
            </div>

            {/* Quality Logic */}
            <div className="operational-matrix">
              <div className="block-group">
                <span className="block-header">Clinical Feedback Narrative</span>
                <div className="clinical-narrative" style={{ minHeight: '120px' }}>
                  {review.review_text || "No descriptive narrative provided for this quality event."}
                </div>
              </div>

              <div className="block-group" style={{ marginTop: '1.5rem' }}>
                <span className="block-header">Sentiment & Metric Matrix</span>
                <div className="schedule-nexus" style={{ justifyContent: 'space-around' }}>
                  <div className="sched-item">
                    <StarCluster rating={review.rating} />
                  </div>
                  <div className="sched-divider"></div>
                  <div className="sched-item">
                    <SentimentBadge sentiment={review.sentiment} />
                  </div>
                </div>
              </div>
            </div>

            {/* Governance Portal */}
            <div className="governance-portal-section" style={{ marginTop: '2.5rem' }}>
              <span className="block-header">Executive Justification / Administrative Note</span>
              <div className="justification-portal">
                <textarea 
                  className="audit-textarea"
                  placeholder="Record institutional moderation rationale here..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="governance-footer">
            <div className="override-label-nexus">
              <div className="label-prime">
                <AlertOctagon size={14} /> Governance Controls
              </div>
              {isSubmitting && <div className="audit-badge verified">Processing Audit...</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              <button 
                className="btn-governance approve" 
                onClick={() => handleAction('approve')}
                disabled={isSubmitting}
              >
                <CheckCircle size={14} /> Clear Review
              </button>
              <button 
                className="btn-governance flag" 
                onClick={() => handleAction('flag')}
                disabled={isSubmitting}
              >
                <Flag size={14} /> Flag Event
              </button>
              <button 
                className="btn-governance hide" 
                onClick={() => handleAction('hide')}
                disabled={isSubmitting}
              >
                <Trash2 size={14} /> Shadow Hide
              </button>
              <button 
                className="btn-governance escalate" 
                onClick={() => handleAction('escalate')}
                disabled={isSubmitting}
              >
                <ShieldAlert size={14} /> Escalate
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .btn-governance {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.85rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid var(--admin-border);
          cursor: pointer;
          transition: all 0.2s;
          background: var(--admin-panel-bg);
          color: var(--admin-text-main);
        }
        .btn-governance:hover { transform: translateY(-2px); }
        .btn-governance:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .btn-governance.approve:hover { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: #10b981; }
        .btn-governance.flag:hover { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-color: #f59e0b; }
        .btn-governance.hide:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }
        .btn-governance.escalate { background: var(--admin-accent); color: white; border: none; }
        .btn-governance.escalate:hover { box-shadow: 0 5px 15px var(--admin-accent-soft); }
      `}</style>
    </div>,
    document.body
  );
};

const StarCluster = ({ rating }) => {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[...Array(5)].map((_, i) => (
        <Shield 
          key={i} 
          size={16} 
          fill={i < rating ? '#f59e0b' : 'transparent'} 
          color={i < rating ? '#f59e0b' : 'var(--admin-border-strong)'} 
        />
      ))}
    </div>
  );
};

const SentimentBadge = ({ sentiment }) => {
  const label = sentiment?.toUpperCase() || 'UNKNOWN';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--admin-accent)', marginBottom: '0.25rem' }}>SENTIMENT AXIS</span>
      <span style={{ fontWeight: 900, color: 'var(--admin-text-main)' }}>{label}</span>
    </div>
  );
};

export default ReviewDetailModal;
