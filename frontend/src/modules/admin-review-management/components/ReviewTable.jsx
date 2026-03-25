import React from 'react';
import { Shield, Eye, ShieldAlert, BadgeCheck, Clock, EyeOff, AlertTriangle } from 'lucide-react';

const ReviewTable = ({ reviews, onSelectReview }) => {
  const getRatingColor = (rating) => {
    if (rating >= 4) return '#10b981';
    if (rating === 3) return '#f59e0b';
    return '#ef4444';
  };

  const getSentimentTag = (sentiment) => {
    const colors = {
      positive: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
      neutral: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
      negative: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' }
    };
    const style = colors[sentiment] || colors.neutral;
    return (
      <span style={{
        padding: '0.25rem 0.6rem',
        borderRadius: '6px',
        fontSize: '0.6rem',
        fontWeight: 900,
        textTransform: 'uppercase',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.text}20`
      }}>
        {sentiment}
      </span>
    );
  };

  const getGovernanceStatusTag = (review) => {
    const status = String(review?.status || '').toLowerCase();

    if (status === 'escalated') {
      return (
        <span style={escalatedStyle}>
          <AlertTriangle size={12} /> Escalated
        </span>
      );
    }

    if (status === 'hidden' || review?.is_hidden) {
      return (
        <span style={hiddenStyle}>
          <EyeOff size={12} /> Hidden
        </span>
      );
    }

    if (status === 'flagged' || review?.is_flagged) {
      return (
        <span style={flagStyle}>
          <ShieldAlert size={12} /> Flagged
        </span>
      );
    }

    if (status === 'approved') {
      return (
        <span style={verifiedStyle}>
          <BadgeCheck size={12} /> Approved
        </span>
      );
    }

    return (
      <span style={verifiedStyle}>
        <BadgeCheck size={12} /> Verified
      </span>
    );
  };

  return (
    <div className="admin-card" style={{ marginTop: '2rem', padding: 0, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'var(--admin-header-bg)', borderBottom: '1px solid var(--admin-border)' }}>
            <th style={headerStyle}>ID</th>
            <th style={headerStyle}>Patient / Doctor</th>
            <th style={headerStyle}>Rating</th>
            <th style={headerStyle}>Sentiment</th>
            <th style={headerStyle}>Status</th>
            <th style={headerStyle}>Date</th>
            <th style={{ ...headerStyle, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr
              key={review.id}
              style={{
                borderBottom: '1px solid var(--admin-border)',
                transition: 'all 0.2s',
                opacity: review.is_hidden ? 0.78 : 1,
              }}
              className="table-row-hover"
            >
              <td style={cellStyle}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', opacity: 0.6 }}>#{review.id.toString().padStart(4, '0')}</span>
              </td>
              <td style={cellStyle}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{review.patient_name}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)' }}>with {review.doctor_name}</span>
                </div>
              </td>
              <td style={cellStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={14} color={getRatingColor(review.rating)} fill={getRatingColor(review.rating)} />
                  <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>{review.rating}.0</span>
                </div>
              </td>
              <td style={cellStyle}>{getSentimentTag(review.sentiment)}</td>
              <td style={cellStyle}>{getGovernanceStatusTag(review)}</td>
              <td style={cellStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>
                  <Clock size={12} />
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </td>
              <td style={{ ...cellStyle, textAlign: 'right' }}>
                <button 
                  onClick={() => onSelectReview(review)}
                  style={actionBtnStyle}
                >
                  <Eye size={14} /> Moderate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const headerStyle = {
  padding: '1.25rem 1.5rem',
  fontSize: '0.65rem',
  fontWeight: 950,
  textTransform: 'uppercase',
  color: 'var(--admin-text-muted)',
  letterSpacing: '0.1em'
};

const cellStyle = {
  padding: '1.25rem 1.5rem',
  verticalAlign: 'middle'
};

const actionBtnStyle = {
  background: 'var(--admin-accent-soft)',
  color: 'var(--admin-accent)',
  border: '1px solid var(--admin-accent-glow)',
  padding: '0.5rem 1rem',
  borderRadius: '10px',
  fontSize: '0.7rem',
  fontWeight: 800,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s'
};

const flagStyle = {
  padding: '0.25rem 0.6rem',
  borderRadius: '6px',
  fontSize: '0.6rem',
  fontWeight: 900,
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  textTransform: 'uppercase'
};

const verifiedStyle = {
  padding: '0.25rem 0.6rem',
  borderRadius: '6px',
  fontSize: '0.6rem',
  fontWeight: 900,
  background: 'rgba(16, 185, 129, 0.1)',
  color: '#10b981',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  textTransform: 'uppercase'
};

const hiddenStyle = {
  padding: '0.25rem 0.6rem',
  borderRadius: '6px',
  fontSize: '0.6rem',
  fontWeight: 900,
  background: 'rgba(148, 163, 184, 0.12)',
  color: '#cbd5e1',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  textTransform: 'uppercase'
};

const escalatedStyle = {
  padding: '0.25rem 0.6rem',
  borderRadius: '6px',
  fontSize: '0.6rem',
  fontWeight: 900,
  background: 'rgba(249, 115, 22, 0.15)',
  color: '#fb923c',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  textTransform: 'uppercase',
  border: '1px solid rgba(249, 115, 22, 0.28)'
};

export default ReviewTable;
