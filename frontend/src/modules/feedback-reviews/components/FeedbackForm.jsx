import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle, AlertTriangle, UserX } from 'lucide-react';
import RatingStars from './RatingStars';
import TagSelector from './TagSelector';

const FeedbackForm = ({ appointments, onSubmit }) => {
  const navigate = useNavigate();
  const [selectedAppt, setSelectedAppt] = useState('');
  const [rating, setRating]             = useState(0);
  const [text, setText]                 = useState('');
  const [tags, setTags]                 = useState([]);
  const [isAnonymous, setIsAnonymous]   = useState(false);
  const [isSerious, setIsSerious]       = useState(false);
  const [complaintReason, setComplaint] = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState('');

  const reset = () => {
    setSelectedAppt(''); setRating(0); setText(''); setTags([]);
    setIsAnonymous(false); setIsSerious(false); setComplaint(''); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) { setError('Please select an appointment.'); return; }
    if (rating === 0)  { setError('Please choose a star rating.'); return; }
    setError(''); setSubmitting(true);
    try {
      await onSubmit({
        appointment_id: parseInt(selectedAppt),
        rating,
        review_text: text,
        tags,
        is_anonymous: isAnonymous,
        is_serious_complaint: isSerious,
        complaint_reason: complaintReason,
      });
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 5000);
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  const hasAppointments = appointments && appointments.length > 0;

  return (
    <div className="ff-card">
      <div className="ff-card-header">
        <div className="ff-card-icon">⭐</div>
        <div>
          <h2 className="ff-card-title">Leave Feedback</h2>
          <p className="ff-card-sub">Help us improve care quality — takes less than a minute</p>
        </div>
      </div>

      {success && (
        <div className="ff-success">
          <CheckCircle size={20} />
          <div>
            <div style={{ fontWeight: 800 }}>Thank you for your feedback!</div>
            <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Your input helps us improve patient care.</div>
          </div>
        </div>
      )}

      {!hasAppointments ? (
        <div className="ff-how-to">
          <div className="ff-how-title">📋 How to Submit Feedback</div>
          <div className="ff-how-steps">
            <div className="ff-step">
              <div className="ff-step-num">1</div>
              <div>
                <div className="ff-step-label">Go to My Appointments</div>
                <div className="ff-step-hint">Find a completed consultation in your appointments list</div>
              </div>
            </div>
            <div className="ff-step-arrow">↓</div>
            <div className="ff-step">
              <div className="ff-step-num">2</div>
              <div>
                <div className="ff-step-label">Click the <span className="ff-step-tag">⭐ Review</span> button</div>
                <div className="ff-step-hint">It appears next to completed appointments that haven't been reviewed yet</div>
              </div>
            </div>
            <div className="ff-step-arrow">↓</div>
            <div className="ff-step">
              <div className="ff-step-num">3</div>
              <div>
                <div className="ff-step-label">You'll be brought back here</div>
                <div className="ff-step-hint">The feedback form will open automatically with your appointment selected</div>
              </div>
            </div>
          </div>
          {!hasAppointments && (
            <div className="ff-no-pending">
              <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>✓ All caught up!</span>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}> All your completed appointments have been reviewed. Thank you!</span>
            </div>
          )}
          <button
            className="ff-goto-btn"
            onClick={() => navigate('/patient/appointments')}
          >
            📅 Go to My Appointments
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="ff-form">
          {/* Appointment selector */}
          <div className="ff-field">
            <label className="ff-label">Which appointment?</label>
            <select
              className="ff-select"
              value={selectedAppt}
              onChange={e => setSelectedAppt(e.target.value)}
            >
              <option value="">— Select a completed appointment —</option>
              {appointments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.appointment_date} · Dr. {a.doctor_name || `#${a.doctor_id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Star Rating */}
          <div className="ff-field">
            <label className="ff-label">Your rating <span className="ff-required">*</span></label>
            <RatingStars value={rating} onChange={setRating} size="lg" />
          </div>

          {/* Tags */}
          <div className="ff-field">
            <label className="ff-label">Quick tags <span className="ff-optional">(optional)</span></label>
            <TagSelector selected={tags} onChange={setTags} />
          </div>

          {/* Review text */}
          <div className="ff-field">
            <label className="ff-label">Your thoughts <span className="ff-optional">(optional)</span></label>
            <textarea
              className="ff-textarea"
              placeholder="How was your consultation experience? Honest feedback helps your doctor improve and helps future patients."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
            />
          </div>

          {/* Anonymous toggle */}
          <div className="ff-toggle-row" onClick={() => setIsAnonymous(!isAnonymous)}>
            <div className={`ff-toggle ${isAnonymous ? 'on' : ''}`}>
              <div className="ff-toggle-thumb" />
            </div>
            <div>
              <div className="ff-toggle-label"><UserX size={14} /> Submit anonymously</div>
              <div className="ff-toggle-hint">Your name will not be shown to the doctor</div>
            </div>
          </div>

          {/* Serious complaint toggle */}
          <div
            className={`ff-serious-toggle ${isSerious ? 'active' : ''}`}
            onClick={() => setIsSerious(!isSerious)}
          >
            <AlertTriangle size={16} color={isSerious ? '#ef4444' : '#94a3b8'} />
            <div>
              <div className="ff-serious-label" style={{ color: isSerious ? '#ef4444' : '#64748b' }}>
                This is a serious complaint
              </div>
              <div className="ff-serious-hint">Will be escalated to the admin governance team</div>
            </div>
            <div className={`ff-serious-dot ${isSerious ? 'on' : ''}`} />
          </div>

          {/* Complaint reason box */}
          {isSerious && (
            <div className="ff-field ff-complaint-box">
              <label className="ff-label" style={{ color: '#ef4444' }}>Describe the serious issue <span className="ff-required">*</span></label>
              <textarea
                className="ff-textarea"
                placeholder="Please describe what happened in detail so the governance team can investigate…"
                value={complaintReason}
                onChange={e => setComplaint(e.target.value)}
                rows={3}
                style={{ borderColor: 'rgba(239,68,68,0.3)' }}
              />
            </div>
          )}

          {error && <div className="ff-error"><AlertTriangle size={14} /> {error}</div>}

          <button type="submit" className="ff-submit" disabled={submitting || rating === 0}>
            {submitting ? (
              <span>Submitting…</span>
            ) : (
              <><Send size={15} /> Submit Feedback</>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackForm;
