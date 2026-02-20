import React from 'react';
import { ClipboardList, RefreshCcw, AlertTriangle } from 'lucide-react';
import { usePatientFeedback } from '../../hooks/usePatientFeedback';
import FeedbackForm from './components/FeedbackForm';
import ReviewHistoryList from './components/ReviewHistoryList';
import ComplaintStatusCard from './components/ComplaintStatusCard';

const PatientFeedbackPage = () => {
  const {
    appointments, reviews, complaints,
    loading, error,
    submitReview, editReview, refresh,
  } = usePatientFeedback();

  return (
    <div className="pfp-page">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="pfp-header">
        <div>
          <h1 className="pfp-heading">Feedback & Reviews</h1>
          <p className="pfp-sub">Your voice shapes the quality of care — all feedback is confidential</p>
        </div>
        <button className="pfp-refresh-btn" onClick={refresh} disabled={loading} title="Refresh">
          <RefreshCcw size={16} className={loading ? 'pfp-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="pfp-error-banner">
          <AlertTriangle size={16} /> Unable to load data: {error}
        </div>
      )}

      {/* ── Leave Feedback ─────────────────────────────── */}
      <FeedbackForm appointments={appointments} onSubmit={submitReview} />

      {/* ── Complaint Tracking ─────────────────────────── */}
      <ComplaintStatusCard complaints={complaints} />

      {/* ── Review History ─────────────────────────────── */}
      <div className="pfp-section">
        <div className="pfp-section-header">
          <ClipboardList size={18} />
          <h2 className="pfp-section-title">My Submitted Reviews</h2>
          <span className="pfp-section-count">{reviews.length}</span>
        </div>
        <ReviewHistoryList reviews={reviews} onEdit={editReview} />
      </div>

      <style>{`
        /* ── Page Layout ──────────────────────────────────── */
        .pfp-page {
          padding: 2rem 2.5rem;
          min-height: calc(100vh - 70px);
          background: #f8faff;
          font-family: 'Inter', system-ui, sans-serif;
          color: #1e293b;
          animation: pfpIn 0.4s ease-out;
        }
        body.dark .pfp-page { background: #0b0e14; color: #f1f5f9; }
        @keyframes pfpIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

        .pfp-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.75rem; }
        .pfp-heading {
          font-size: 1.85rem; font-weight: 900; margin: 0; letter-spacing: -0.025em;
          background: linear-gradient(135deg, #1e293b 0%, #6366f1 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        body.dark .pfp-heading { background: linear-gradient(135deg, #f1f5f9 0%, #818cf8 100%); -webkit-background-clip: text; background-clip: text; }
        .pfp-sub { margin: 0.3rem 0 0; font-size: 0.82rem; color: #64748b; }
        .pfp-refresh-btn {
          background: white; border: 1.5px solid #e2e8f0; color: #64748b;
          width: 38px; height: 38px; border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        body.dark .pfp-refresh-btn { background: #11141d; border-color: rgba(255,255,255,0.08); }
        .pfp-refresh-btn:hover { border-color: #6366f1; color: #6366f1; }
        .pfp-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pfp-error-banner { display:flex; gap:0.75rem; align-items:center; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:12px; padding:0.85rem 1.2rem; color:#ef4444; font-size:0.85rem; font-weight:700; margin-bottom:1.5rem; }

        /* ── Feedback Form Card ────────────────────────────── */
        .ff-card {
          background: white; border: 1.5px solid #e8eaf6;
          border-radius: 20px; padding: 1.75rem; margin-bottom: 1.5rem;
          box-shadow: 0 4px 24px rgba(99,102,241,0.06);
        }
        body.dark .ff-card { background: #11141d; border-color: rgba(255,255,255,0.07); box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
        .ff-card-header { display:flex; gap:1rem; align-items:flex-start; margin-bottom:1.5rem; }
        .ff-card-icon { font-size:2rem; line-height:1; }
        .ff-card-title { font-size:1.2rem; font-weight:900; color:#1e293b; margin:0; }
        body.dark .ff-card-title { color:#f1f5f9; }
        .ff-card-sub { font-size:0.78rem; color:#94a3b8; margin:0.2rem 0 0; }

        .ff-success { display:flex; gap:0.85rem; align-items:flex-start; background:rgba(16,185,129,0.08); border:1.5px solid rgba(16,185,129,0.25); border-radius:14px; padding:1rem 1.2rem; color:#064e3b; margin-bottom:1.25rem; font-size:0.9rem; }
        body.dark .ff-success { color:#6ee7b7; }

        /* How-to guide (when no eligible appointments) */
        .ff-how-to { padding: 0.5rem 0; }
        .ff-how-title { font-size: 0.82rem; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.25rem; }
        body.dark .ff-how-title { color: #94a3b8; }
        .ff-how-steps { display: flex; flex-direction: column; gap: 0; margin-bottom: 1.25rem; }
        .ff-step { display: flex; align-items: flex-start; gap: 1rem; padding: 0.85rem 1rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
        body.dark .ff-step { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.06); }
        .ff-step-num { width: 26px; height: 26px; background: linear-gradient(135deg, #6366f1, #7c3aed); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; flex-shrink: 0; }
        .ff-step-label { font-size: 0.88rem; font-weight: 800; color: #1e293b; margin-bottom: 0.2rem; }
        body.dark .ff-step-label { color: #f1f5f9; }
        .ff-step-hint { font-size: 0.72rem; color: #94a3b8; line-height: 1.5; }
        .ff-step-tag { display: inline-block; background: linear-gradient(135deg, #f59e0b, #f97316); color: white; padding: 0.1rem 0.45rem; border-radius: 6px; font-size: 0.7rem; font-weight: 900; }
        .ff-step-arrow { text-align: center; color: #c7d2fe; font-size: 1rem; padding: 0.25rem 0 0.25rem 0.75rem; }
        .ff-no-pending { display: flex; align-items: center; gap: 0.5rem; background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15); border-radius: 10px; padding: 0.7rem 1rem; margin-bottom: 1rem; }
        .ff-goto-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.8rem 1.5rem; background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: white; border: none; border-radius: 11px; font-weight: 800;
          font-size: 0.88rem; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(99,102,241,0.25);
        }
        .ff-goto-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99,102,241,0.35); }

        .ff-no-appts { display:flex; flex-direction:column; align-items:center; gap:0.75rem; padding:2.5rem 0; color:#94a3b8; text-align:center; font-size:0.9rem; }

        .ff-form { display:flex; flex-direction:column; gap:1.25rem; }
        .ff-field { display:flex; flex-direction:column; gap:0.5rem; }
        .ff-label { font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:#475569; }
        body.dark .ff-label { color:#94a3b8; }
        .ff-required { color:#ef4444; }
        .ff-optional { color:#94a3b8; font-weight:600; text-transform:none; }

        .ff-select {
          width:100%; padding:0.8rem 1rem; border:1.5px solid #e2e8f0; border-radius:12px;
          font-size:0.9rem; font-family:inherit; background:#f8fafc; color:#1e293b;
          transition:border-color 0.2s, box-shadow 0.2s; cursor:pointer;
        }
        body.dark .ff-select { background:#0b0e14; border-color:rgba(255,255,255,0.08); color:#f1f5f9; }
        .ff-select:focus { outline:none; border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.12); }

        .ff-textarea {
          width:100%; padding:0.85rem 1rem; border:1.5px solid #e2e8f0; border-radius:12px;
          font-size:0.9rem; font-family:inherit; resize:vertical; background:#f8fafc;
          color:#1e293b; transition:border-color 0.2s; box-sizing:border-box; line-height:1.6;
        }
        body.dark .ff-textarea { background:#0b0e14; border-color:rgba(255,255,255,0.08); color:#f1f5f9; }
        .ff-textarea:focus { outline:none; border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.12); }

        /* Toggle switch */
        .ff-toggle-row { display:flex; align-items:center; gap:0.85rem; cursor:pointer; padding:0.75rem; border-radius:12px; background:#f8fafc; border:1px solid #e2e8f0; transition:all 0.2s; user-select:none; }
        body.dark .ff-toggle-row { background:rgba(255,255,255,0.03); border-color:rgba(255,255,255,0.06); }
        .ff-toggle-row:hover { border-color:#6366f1; }
        .ff-toggle { width:40px; height:22px; border-radius:99px; background:#e2e8f0; position:relative; flex-shrink:0; transition:background 0.2s; }
        .ff-toggle.on { background:#6366f1; }
        .ff-toggle-thumb { width:18px; height:18px; border-radius:50%; background:white; position:absolute; top:2px; left:2px; transition:left 0.2s; box-shadow:0 1px 4px rgba(0,0,0,0.15); }
        .ff-toggle.on .ff-toggle-thumb { left:20px; }
        .ff-toggle-label { display:flex; align-items:center; gap:0.4rem; font-size:0.85rem; font-weight:700; color:#1e293b; }
        body.dark .ff-toggle-label { color:#e2e8f0; }
        .ff-toggle-hint { font-size:0.7rem; color:#94a3b8; margin-top:0.15rem; }

        /* Serious complaint */
        .ff-serious-toggle { display:flex; align-items:center; gap:0.85rem; cursor:pointer; padding:0.85rem 1rem; border-radius:12px; border:1.5px dashed #e2e8f0; transition:all 0.2s; user-select:none; }
        .ff-serious-toggle.active { border-color:rgba(239,68,68,0.35); background:rgba(239,68,68,0.04); }
        .ff-serious-toggle:hover { border-color:rgba(239,68,68,0.3); }
        .ff-serious-label { font-size:0.88rem; font-weight:800; transition:color 0.2s; }
        .ff-serious-hint { font-size:0.7rem; color:#94a3b8; margin-top:0.15rem; }
        .ff-serious-dot { width:16px; height:16px; border-radius:50%; border:2px solid #e2e8f0; margin-left:auto; flex-shrink:0; transition:all 0.2s; }
        .ff-serious-dot.on { background:#ef4444; border-color:#ef4444; box-shadow:0 0 8px rgba(239,68,68,0.4); }
        .ff-complaint-box { background:rgba(239,68,68,0.04); border-radius:12px; padding:1rem; border:1px solid rgba(239,68,68,0.15); }

        .ff-error { display:flex; align-items:center; gap:0.5rem; color:#ef4444; font-size:0.82rem; font-weight:700; }

        .ff-submit {
          display:inline-flex; align-items:center; gap:0.6rem;
          padding:0.9rem 2rem; background:linear-gradient(135deg,#6366f1,#7c3aed);
          color:white; border:none; border-radius:12px; font-weight:800; font-size:0.9rem;
          cursor:pointer; transition:all 0.2s; align-self:flex-start;
          box-shadow:0 4px 15px rgba(99,102,241,0.25);
        }
        .ff-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 25px rgba(99,102,241,0.35); }
        .ff-submit:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

        /* ── Complaint Status Card ─────────────────────────── */
        .csc-section { margin-bottom:1.5rem; }
        .csc-header { display:flex; align-items:center; gap:0.6rem; font-size:1rem; font-weight:900; color:#ef4444; margin-bottom:1rem; text-transform:uppercase; letter-spacing:0.04em; }
        .csc-list { display:flex; flex-direction:column; gap:1rem; }
        .csc-card { background:white; border:1.5px solid #e2e8f0; border-left:4px solid; border-radius:16px; padding:1.25rem; box-shadow:0 2px 12px rgba(0,0,0,0.04); }
        body.dark .csc-card { background:#11141d; border-color:rgba(255,255,255,0.07); }
        .csc-card-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.85rem; gap:1rem; }
        .csc-complaint-id { font-size:0.7rem; font-weight:900; color:#94a3b8; font-family:monospace; margin-bottom:0.15rem; }
        .csc-doctor { font-weight:800; font-size:0.95rem; color:#1e293b; }
        body.dark .csc-doctor { color:#f1f5f9; }
        .csc-status-badge { display:flex; align-items:center; gap:0.4rem; padding:0.4rem 0.85rem; border-radius:99px; font-size:0.72rem; font-weight:800; white-space:nowrap; }
        .csc-details { display:flex; flex-direction:column; gap:0.4rem; margin-bottom:1.1rem; }
        .csc-detail-row { display:flex; align-items:center; gap:0.4rem; font-size:0.75rem; color:#64748b; }
        .csc-reason { font-size:0.82rem; color:#64748b; font-style:italic; background:#f8fafc; padding:0.65rem 0.85rem; border-radius:8px; border-left:3px solid #e2e8f0; }
        body.dark .csc-reason { background:rgba(255,255,255,0.03); }
        .csc-timeline { display:flex; align-items:center; gap:0; margin-bottom:1rem; }
        .csc-step { display:flex; align-items:center; gap:0.4rem; }
        .csc-step-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; transition:all 0.3s; }
        .csc-step-label { font-size:0.62rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; white-space:nowrap; }
        .csc-step-line { flex:1; height:2px; min-width:24px; max-width:60px; margin:0 0.35rem; transition:background 0.3s; }
        .csc-note { display:flex; gap:0.5rem; align-items:flex-start; font-size:0.72rem; color:#94a3b8; background:#f8fafc; padding:0.6rem 0.85rem; border-radius:8px; }
        body.dark .csc-note { background:rgba(255,255,255,0.03); }

        /* ── Review History ────────────────────────────────── */
        .pfp-section { }
        .pfp-section-header { display:flex; align-items:center; gap:0.7rem; margin-bottom:1.1rem; }
        .pfp-section-title { font-size:1.05rem; font-weight:900; color:#1e293b; margin:0; }
        body.dark .pfp-section-title { color:#f1f5f9; }
        .pfp-section-count { background:#6366f1; color:white; font-size:0.65rem; font-weight:900; padding:0.2rem 0.5rem; border-radius:99px; }

        .rhl-list { display:flex; flex-direction:column; gap:1rem; }
        .rhl-empty { display:flex; flex-direction:column; align-items:center; gap:0.75rem; padding:3rem 0; color:#94a3b8; text-align:center; font-size:0.88rem; }
        .rhl-skeleton { height:120px; border-radius:16px; background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
        @keyframes shimmer { to { background-position:-200% 0; } }

        .rhl-card { background:white; border:1.5px solid #e2e8f0; border-radius:16px; padding:1.25rem; transition:border-color 0.2s, box-shadow 0.2s; }
        body.dark .rhl-card { background:#11141d; border-color:rgba(255,255,255,0.07); }
        .rhl-card:hover { border-color:#c7d2fe; box-shadow:0 4px 16px rgba(99,102,241,0.08); }
        .rhl-card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:0.75rem; margin-bottom:0.6rem; flex-wrap:wrap; }
        .rhl-doctor { font-weight:800; font-size:0.95rem; color:#1e293b; }
        body.dark .rhl-doctor { color:#f1f5f9; }
        .rhl-meta { display:flex; align-items:center; gap:0.35rem; font-size:0.68rem; color:#94a3b8; margin-top:0.2rem; }
        .rhl-sentiment { padding:0.25rem 0.65rem; border-radius:99px; font-size:0.62rem; font-weight:900; text-transform:uppercase; }
        .rhl-edit-btn { background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.2); color:#6366f1; padding:0.4rem; border-radius:8px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s; }
        .rhl-edit-btn:hover { background:rgba(99,102,241,0.15); }
        .rhl-text { font-size:0.88rem; line-height:1.65; color:#475569; margin:0 0 0.3rem; }
        body.dark .rhl-text { color:#94a3b8; }
        .rhl-expand-btn { background:none; border:none; color:#6366f1; font-size:0.72rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px; padding:0; margin-top:0.25rem; }
        .rhl-tags { display:flex; align-items:center; flex-wrap:wrap; gap:0.4rem; margin-top:0.6rem; }
        .rhl-tag { background:#f1f5f9; color:#475569; font-size:0.65rem; font-weight:700; padding:0.2rem 0.55rem; border-radius:6px; border:1px solid #e2e8f0; }
        body.dark .rhl-tag { background:rgba(255,255,255,0.05); color:#94a3b8; border-color:rgba(255,255,255,0.07); }
        .rhl-edit-textarea { width:100%; padding:0.75rem 0.9rem; border:1.5px solid #c7d2fe; border-radius:10px; font-size:0.88rem; font-family:inherit; resize:vertical; background:#f8fafc; color:#1e293b; box-sizing:border-box; margin:0.5rem 0; }
        body.dark .rhl-edit-textarea { background:#0b0e14; border-color:rgba(99,102,241,0.3); color:#f1f5f9; }
        .rhl-edit-actions { display:flex; align-items:center; gap:0.6rem; margin-top:0.85rem; flex-wrap:wrap; }
        .rhl-save-btn { display:flex; align-items:center; gap:0.4rem; background:#6366f1; color:white; border:none; padding:0.55rem 1.1rem; border-radius:8px; font-weight:800; font-size:0.8rem; cursor:pointer; }
        .rhl-cancel-btn { display:flex; align-items:center; gap:0.4rem; background:#f1f5f9; color:#64748b; border:1px solid #e2e8f0; padding:0.55rem 1.1rem; border-radius:8px; font-weight:800; font-size:0.8rem; cursor:pointer; }
        body.dark .rhl-cancel-btn { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.08); color:#94a3b8; }
        .rhl-edit-hint { font-size:0.65rem; color:#94a3b8; margin-top:0.5rem; font-style:italic; }
        .rhl-complaint-chip { display:inline-block; margin-top:0.6rem; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); color:#ef4444; font-size:0.7rem; font-weight:700; padding:0.3rem 0.7rem; border-radius:8px; }
      `}</style>
    </div>
  );
};

export default PatientFeedbackPage;
