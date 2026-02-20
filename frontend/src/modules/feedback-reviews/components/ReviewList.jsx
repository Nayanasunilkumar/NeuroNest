import React, { useState } from 'react';
import { Calendar, Hash, ChevronDown, ChevronUp } from 'lucide-react';

const SENTIMENT_STYLE = {
  positive: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  neutral:  { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  negative: { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444' },
};

const StarRow = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ fontSize: '0.85rem', color: i <= rating ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>★</span>
    ))}
  </div>
);

const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const s = SENTIMENT_STYLE[review.sentiment] || SENTIMENT_STYLE.neutral;
  const hasLongText = review.review_text && review.review_text.length > 140;

  return (
    <div className="df-review-card">
      <div className="df-review-top">
        <div className="df-review-meta">
          <StarRow rating={review.rating} />
          <span className="df-review-patient">{review.patient_anonymized}</span>
        </div>
        <div className="df-review-right">
          <span className="df-sentiment-tag" style={{ background: s.bg, color: s.color }}>
            {review.sentiment}
          </span>
          <div className="df-review-date">
            <Calendar size={11} />
            <span>{review.date}</span>
          </div>
          <div className="df-review-date">
            <Hash size={11} />
            <span>Appt {review.appointment_id}</span>
          </div>
        </div>
      </div>

      {review.review_text && (
        <div className="df-review-text">
          <p>{hasLongText && !expanded ? review.review_text.slice(0, 140) + '…' : review.review_text}</p>
          {hasLongText && (
            <button className="df-expand-btn" onClick={() => setExpanded(!expanded)}>
              {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
            </button>
          )}
        </div>
      )}

      {review.tags && review.tags.length > 0 && (
        <div className="df-review-tags">
          {review.tags.map((tag, i) => (
            <span key={i} className="df-review-tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const ReviewList = ({ reviews }) => {
  if (!reviews) return <div className="df-panel skeleton" style={{ height: 200 }} />;

  return (
    <div className="df-panel">
      <div className="df-panel-header">
        <h3 className="df-panel-title">Patient Feedback</h3>
        <span className="df-panel-sub">{reviews.length} entries — anonymized</span>
      </div>
      {reviews.length === 0 ? (
        <p className="df-empty-msg">No reviews have been recorded yet.</p>
      ) : (
        <div className="df-review-list">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
