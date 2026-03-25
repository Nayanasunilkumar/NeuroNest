import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, Shield, ShieldAlert, User, MessageSquare, 
  Trash2, Flag, CheckCircle, ExternalLink, AlertOctagon 
} from 'lucide-react';

const ReviewDetailModal = ({ review, onClose, onModerate }) => {
  const [note, setNote] = useState('');
  const [severity, setSeverity] = useState('Standard');
  const [category, setCategory] = useState('Quality of Care');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null);

  if (!review) return null;

  const handleAction = async (action) => {
    // Require note for negative actions
    if ((action === 'flag' || action === 'escalate' || action === 'hide') && !note.trim()) {
        alert("Institutional Quality Audit: A descriptive rationale is mandatory for this governance action.");
        return;
    }

    setIsSubmitting(true);
    try {
        const result = await onModerate(review.id, {
            action,
            note,
            severity: action === 'escalate' ? severity : 'Standard',
            category: action === 'escalate' ? category : 'Quality of Care'
        });

        setIsSubmitting(false);
        if (result.success) {
            setConfirmAction({ type: 'success', message: `Audit Finalized: Review status updated to ${action.toUpperCase()}.` });
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

                {/* Governance Triage Config */}
                <div className="governance-portal-section triage-matrix">
                  <div className="triage-group">
                    <span className="block-header">Escalation Severity</span>
                    <select 
                      className="audit-select"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                    >
                      <option value="Standard">Standard Board Review</option>
                      <option value="Urgent">Urgent Intervention</option>
                      <option value="Emergency">Emergency Safety Stop</option>
                    </select>
                  </div>
                  <div className="triage-group">
                    <span className="block-header">Audit Category</span>
                    <select 
                      className="audit-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Quality of Care">Clinical Quality of Care</option>
                      <option value="Professionalism">Professional Ethics</option>
                      <option value="Administrative">Administrative Inefficiency</option>
                      <option value="Misconduct">Alleged Misconduct</option>
                    </select>
                  </div>
                </div>

                {/* Governance Portal */}
                <div className="governance-portal-section">
                  <span className="block-header">Executive Justification / Administrative Note</span>
                  <div className="justification-portal">
                    <textarea 
                      className="audit-textarea"
                      placeholder="Record institutional moderation rationale here (Mandatory for Flag/Escalate)..."
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
                    className="btn-governance escalate" 
                    onClick={() => handleAction('escalate')}
                    disabled={isSubmitting}
                  >
                    <ShieldAlert size={14} /> <span>Escalate Case</span>
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

        .audit-success-nexus h2 { color: white; margin: 0; font-weight: 800; }
        .audit-success-nexus p { color: rgba(255, 255, 255, 0.5); margin: 0; }

        .triage-matrix {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 2rem;
        }

        .audit-select {
          width: 100%;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #f8fafc;
          padding: 0.75rem;
          border-radius: 8px;
          margin-top: 0.5rem;
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
        }

        .audit-select:focus {
          border-color: var(--admin-accent);
          background: rgba(15, 23, 42, 0.6);
        }

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
          background: rgba(15, 23, 42, 0.85);
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
           background: #1e293b;
           border: 1px solid rgba(255, 255, 255, 0.1);
           border-radius: 28px;
           overflow: hidden;
           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
           display: flex;
           flex-direction: column;
           max-height: 90vh;
        }

        .modal-header-nexus {
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .institutional-tag {
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 0.5rem;
        }

        .oversight-title {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: white;
          margin: 0;
        }

        .sidebar-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sidebar-close-btn:hover { background: #ef4444; }

        .modal-body-scroll {
          padding: 2rem;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
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
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .card-header {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .identity-title { font-size: 1.1rem; font-weight: 800; margin: 0; color: white; }
        .identity-sub { font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); margin: 0.25rem 0 0.75rem; }
        .meta-tag { font-size: 0.65rem; font-weight: 900; background: rgba(255, 255, 255, 0.05); padding: 2px 8px; border-radius: 4px; width: fit-content; }

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
           background: rgba(0, 0, 0, 0.2);
           border-radius: 16px;
           padding: 1.25rem;
           font-size: 0.95rem;
           line-height: 1.6;
           color: rgba(255, 255, 255, 0.8);
           margin-bottom: 2rem;
           border-left: 4px solid #6366f1;
        }

        .score-sentiment-nexus {
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 3rem;
           background: rgba(255, 255, 255, 0.02);
           padding: 1.5rem;
           border-radius: 16px;
           margin-bottom: 2.5rem;
        }

        .metric-box { text-align: center; }
        .metric-label { display: block; font-size: 0.6rem; font-weight: 900; opacity: 0.4; margin-bottom: 0.75rem; text-transform: uppercase; }
        .metric-divider { height: 40px; width: 1px; background: rgba(255, 255, 255, 0.1); }

        .justification-portal textarea {
          width: 100%;
          min-height: 100px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1rem;
          color: white;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.3s;
        }

        .justification-portal textarea:focus { border-color: #6366f1; background: rgba(0, 0, 0, 0.4); }

        .governance-footer {
          padding: 1.5rem 2rem 2rem;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
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
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-governance span { font-size: 0.65rem; font-weight: 800; }
        .btn-governance:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.08); }
        .btn-governance:disabled { opacity: 0.3; cursor: not-allowed; }

        .btn-governance.approve:hover { color: #10b981; border-color: #10b981; }
        .btn-governance.flag:hover { color: #f59e0b; border-color: #f59e0b; }
        .btn-governance.hide:hover { color: #ef4444; border-color: #ef4444; }
        .btn-governance.escalate { background: #6366f1; border-color: #6366f1; }
        .btn-governance.escalate:hover { background: #4f46e5; box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }

        .audit-pulse { font-size: 0.7rem; color: #10b981; margin-left: auto; font-weight: 700; animation: auditPulse 2s infinite; }
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
