import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, Shield, ShieldAlert, User, MessageSquare, 
  Trash2, Flag, CheckCircle, ExternalLink, AlertOctagon 
} from 'lucide-react';

const ReviewDetailModal = ({ review, onClose, onModerate }) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  if (!review) return null;

  const handleAction = async (action) => {
    // Require note for negative actions
    if ((action === 'flag' || action === 'suspend' || action === 'hide') && !note.trim()) {
        alert("Institutional Quality Audit: A descriptive rationale is mandatory for this governance action.");
        return;
    }

    setIsSubmitting(true);
    try {
        const result = await onModerate(review.id, {
            action,
            note,
        });

        setIsSubmitting(false);
        if (result.success || result.data?.ok) {
            const baseMessage = `Audit Finalized: Review status updated to ${action.toUpperCase()}.`;
            setConfirmAction({ type: 'success', message: baseMessage });
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            handleError(result.error);
        }
    } catch (err) {
        setIsSubmitting(false);
        handleError(err.message);
    }
  };

  const handleError = (error) => {
    if (error.includes('401')) {
        alert("Session Expired: Your institutional access token has invalidated. Please logout and login again to proceed.");
    } else if (error.includes('403')) {
        alert("Access Denied: You do not have the required Executive clearance for this governance action.");
    } else {
        alert("Governance System Error: " + error);
    }
  };

  return ReactDOM.createPortal(
    <div className="appt-modal-portal">
      <div className="appt-modal-overlay" onClick={onClose} />
      <div className="appt-modal-container">
        <div className="appt-modal-nexus oversight-card">
          {confirmAction ? (
             <div className="audit-success-nexus">
                <CheckCircle size={48} color="#10b981" />
                <h2>{confirmAction.message}</h2>
                <p>Oversight logs have been updated successfully.</p>
             </div>
          ) : (
            <>
              <div className="modal-header-nexus">
                <div className="header-left-nexus">
                  <div className="institutional-tag">
                    <Shield size={10} /> Institutional Quality Audit
                  </div>
                  <h1 className="oversight-title">Review Oversight: #{review.id.toString().padStart(4, '0')}</h1>
                </div>
                <button className="sidebar-close-btn" onClick={onClose} aria-label="Close Audit">
                    <X size={18} />
                </button>
              </div>

              <div className="modal-body-scroll">
                {/* Identity Grid */}
                <div className="identity-matrix">
                  <div className="identity-card patient-focus">
                    <div className="card-header"><User size={12} /> Patient Identity</div>
                    <div className="card-content">
                      <h3 className="identity-title">{review.patient_name}</h3>
                      <div className="identity-sub">Verified Service Recipient</div>
                      <div className="meta-tag">ID: P-{review.patient_id}</div>
                    </div>
                  </div>

                  <div className="identity-card provider-focus">
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
                    <div className="clinical-narrative-box">
                      {review.review_text || "No descriptive narrative provided for this quality event."}
                    </div>
                  </div>

                  <div className="score-sentiment-nexus">
                      <div className="metric-box">
                        <span className="metric-label">Rating Metric</span>
                        <StarCluster rating={review.rating} />
                      </div>
                      <div className="metric-divider"></div>
                      <div className="metric-box">
                        <span className="metric-label">Sentiment Axis</span>
                        <SentimentBadge sentiment={review.sentiment} />
                      </div>
                  </div>
                </div>

                {/* Governance Portal */}
                <div className="governance-portal-section">
                  <span className="block-header">Executive Justification / Administrative Note</span>
                  <div className="justification-portal">
                    <textarea 
                      className="audit-textarea"
                      placeholder="Record institutional moderation rationale here (Mandatory for Flag/Hide/Suspend)..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="governance-footer">
                <div className="override-header">
                    <AlertOctagon size={14} /> <span>Governance Control Panel</span>
                    {isSubmitting && <div className="audit-pulse">Processing Audit...</div>}
                </div>

                <div className="governance-action-grid">
                  <button 
                    className="btn-governance approve" 
                    onClick={() => handleAction('approve')}
                    disabled={isSubmitting}
                  >
                    <CheckCircle size={14} /> <span>Clear Review</span>
                  </button>
                  <button 
                    className="btn-governance flag" 
                    onClick={() => handleAction('flag')}
                    disabled={isSubmitting}
                  >
                    <Flag size={14} /> <span>Flag Event</span>
                  </button>
                  <button 
                    className="btn-governance hide" 
                    onClick={() => handleAction('hide')}
                    disabled={isSubmitting}
                  >
                    <Trash2 size={14} /> <span>Shadow Hide</span>
                  </button>
                  <button 
                    className="btn-governance suspend" 
                    onClick={() => handleAction('suspend')}
                    disabled={isSubmitting}
                  >
                    <ShieldAlert size={14} /> <span>Suspend Doctor</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .audit-success-nexus {
            padding: 4rem 2rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            animation: successEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes successEntrance {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .audit-success-nexus h2 { color: #0f172a; margin: 0; font-weight: 800; }
        .audit-success-nexus p { color: #64748b; margin: 0; }

        .appt-modal-portal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .appt-modal-overlay {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          cursor: pointer;
        }

        .appt-modal-container {
          position: relative;
          z-index: 10000;
          width: 90%;
          max-width: 650px;
          animation: modalEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalEntrance {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .oversight-card {
           background: #ffffff;
           border: 1px solid #e2e8f0;
           border-radius: 28px;
           overflow: hidden;
           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
           display: flex;
           flex-direction: column;
           max-height: 90vh;
        }

        .modal-header-nexus {
          padding: 1.5rem 2rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .institutional-tag {
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #059669;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 0.5rem;
        }

        .oversight-title {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #0f172a;
          margin: 0;
        }

        .sidebar-close-btn {
          background: #f1f5f9;
          border: none;
          color: #64748b;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sidebar-close-btn:hover { background: #fee2e2; color: #ef4444; }

        .modal-body-scroll {
          padding: 2rem;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }

        .identity-matrix {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .identity-card {
          padding: 1rem;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .card-header {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .identity-title { font-size: 1.1rem; font-weight: 800; margin: 0; color: #0f172a; }
        .identity-sub { font-size: 0.75rem; color: #64748b; margin: 0.25rem 0 0.75rem; }
        .meta-tag { font-size: 0.65rem; font-weight: 900; background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 4px; width: fit-content; }

        .block-header {
           display: block;
           font-size: 0.7rem;
           font-weight: 950;
           color: #6366f1;
           text-transform: uppercase;
           letter-spacing: 0.1em;
           margin-bottom: 1rem;
        }

        .clinical-narrative-box {
           background: #f8fafc;
           border-radius: 16px;
           padding: 1.25rem;
           font-size: 0.95rem;
           line-height: 1.6;
           color: #334155;
           margin-bottom: 2rem;
           border-left: 4px solid #6366f1;
           border-top: 1px solid #e2e8f0;
           border-right: 1px solid #e2e8f0;
           border-bottom: 1px solid #e2e8f0;
        }

        .score-sentiment-nexus {
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 3rem;
           background: #f8fafc;
           padding: 1.5rem;
           border-radius: 16px;
           margin-bottom: 2.5rem;
           border: 1px solid #e2e8f0;
        }

        .metric-box { text-align: center; }
        .metric-label { display: block; font-size: 0.6rem; font-weight: 900; color: #94a3b8; margin-bottom: 0.75rem; text-transform: uppercase; }
        .metric-divider { height: 40px; width: 1px; background: #e2e8f0; }

        .justification-portal textarea {
          width: 100%;
          min-height: 100px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          padding: 1rem;
          color: #0f172a;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.3s;
        }

        .justification-portal textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

        .governance-footer {
          padding: 1.5rem 2rem 2rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .override-header {
           display: flex;
           align-items: center;
           gap: 0.5rem;
           font-size: 0.75rem;
           font-weight: 800;
           color: #ef4444;
           margin-bottom: 1.25rem;
        }

        .governance-action-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }

        .btn-governance {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 0.5rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-governance span { font-size: 0.65rem; font-weight: 800; }
        .btn-governance:hover { transform: translateY(-2px); border-color: #cbd5e1; background: #f8fafc; }
        .btn-governance:disabled { opacity: 0.3; cursor: not-allowed; }

        .btn-governance.approve:hover { color: #10b981; border-color: #10b981; background: #f0fdf4; }
        .btn-governance.flag:hover { color: #f59e0b; border-color: #f59e0b; background: #fffbeb; }
        .btn-governance.hide:hover { color: #ef4444; border-color: #ef4444; background: #fef2f2; }
        .btn-governance.suspend { background: #ef4444; border-color: #ef4444; color: white; }
        .btn-governance.suspend span { color: white; }
        .btn-governance.suspend:hover { background: #dc2626; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }

        .audit-pulse { font-size: 0.7rem; color: #059669; margin-left: auto; font-weight: 700; animation: auditPulse 2s infinite; }
        @keyframes auditPulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
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
