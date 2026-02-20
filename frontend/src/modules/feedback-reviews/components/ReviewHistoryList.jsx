import React, { useState } from 'react';
import { Clock, Edit2, Check, X, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import RatingStars from './RatingStars';
import TagSelector from './TagSelector';

const SENTIMENT_STYLE = {
  positive: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Positive' },
  neutral:  { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Neutral' },
  negative: { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444', label: 'Negative' },
};

const ReviewCard = ({ review, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [draftRating, setDraftRating] = useState(review.rating);
  const [draftText, setDraftText]     = useState(review.review_text || '');
  const [draftTags, setDraftTags]     = useState(review.tags || []);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const s = SENTIMENT_STYLE[review.sentiment] || SENTIMENT_STYLE.neutral;

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      await onEdit(review.id, { rating: draftRating, review_text: draftText, tags: draftTags });
      setEditing(false);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <div className="rhl-card">
      {/* Top row */}
      <div className="rhl-card-top">
        <div>
          <div className="rhl-doctor">Dr. {review.doctor_name}</div>
          <div className="rhl-meta">
            <Clock size={11} /> {review.date}
            &nbsp;·&nbsp; Appt #{review.appointment_id}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="rhl-sentiment" style={{ background: s.bg, color: s.color }}>{s.label}</span>
          {review.can_edit && !editing && (
            <button className="rhl-edit-btn" onClick={() => setEditing(true)} title="Edit review">
              <Edit2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Stars */}
      {editing ? (
        <div style={{ margin: '0.75rem 0' }}>
          <RatingStars value={draftRating} onChange={setDraftRating} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 2, margin: '0.5rem 0' }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{ fontSize: '1rem', color: i <= review.rating ? '#f59e0b' : 'rgba(0,0,0,0.1)' }}>★</span>
          ))}
        </div>
      )}

      {/* Text */}
      {editing ? (
        <textarea
          className="rhl-edit-textarea"
          value={draftText}
          onChange={e => setDraftText(e.target.value)}
          rows={3}
          placeholder="Describe your experience…"
        />
      ) : review.review_text && (
        <div>
          <p className="rhl-text">
            {!expanded && review.review_text.length > 120
              ? review.review_text.slice(0, 120) + '…'
              : review.review_text
            }
          </p>
          {review.review_text.length > 120 && (
            <button className="rhl-expand-btn" onClick={() => setExpanded(!expanded)}>
              {expanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> More</>}
            </button>
          )}
        </div>
      )}

      {/* Tags */}
      {editing ? (
        <div style={{ marginTop: '0.75rem' }}>
          <TagSelector selected={draftTags} onChange={setDraftTags} />
        </div>
      ) : review.tags && review.tags.length > 0 && (
        <div className="rhl-tags">
          <Tag size={11} style={{ color: '#94a3b8' }} />
          {review.tags.map((t, i) => <span key={i} className="rhl-tag">{t}</span>)}
        </div>
      )}

      {/* Edit actions */}
      {editing && (
        <div className="rhl-edit-actions">
          {err && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{err}</span>}
          <button className="rhl-save-btn" onClick={handleSave} disabled={saving}>
            <Check size={13} /> {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="rhl-cancel-btn" onClick={() => { setEditing(false); setErr(''); }}>
            <X size={13} /> Cancel
          </button>
        </div>
      )}

      {/* Edit hint */}
      {review.can_edit && !editing && (
        <div className="rhl-edit-hint">✏ Editable within 24 hours of submission</div>
      )}
      {review.complaint && (
        <div className="rhl-complaint-chip">
          🚨 Complaint raised · Status: <strong>{review.complaint.status}</strong>
        </div>
      )}
    </div>
  );
};

const ReviewHistoryList = ({ reviews, onEdit }) => {
  if (!reviews) return <div className="rhl-skeleton" />;

  return (
    <div>
      {reviews.length === 0 ? (
        <div className="rhl-empty">
          <span style={{ fontSize: '2rem' }}>📋</span>
          <p>No feedback submitted yet. Your reviews will appear here after appointments.</p>
        </div>
      ) : (
        <div className="rhl-list">
          {reviews.map(r => <ReviewCard key={r.id} review={r} onEdit={onEdit} />)}
        </div>
      )}
    </div>
  );
};

export default ReviewHistoryList;
