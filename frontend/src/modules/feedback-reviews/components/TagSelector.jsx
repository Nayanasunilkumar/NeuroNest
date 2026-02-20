import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

const POSITIVE_TAGS = [
  'Good Communication',
  'Explained Clearly',
  'Friendly & Caring',
  'Professional',
  'Thorough Examination',
  'On Time',
];

const NEGATIVE_TAGS = [
  'Long Waiting Time',
  'Rushed Consultation',
  'Poor Explanation',
  'Unprofessional',
  'Dismissed Concerns',
  'Prescription Issue',
];

const TagSelector = ({ selected, onChange }) => {
  const toggle = (tag) => {
    onChange(
      selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag]
    );
  };

  const TagPill = ({ tag, positive }) => {
    const isSelected = selected.includes(tag);
    const color = positive
      ? (isSelected ? '#10b981' : '#94a3b8')
      : (isSelected ? '#ef4444' : '#94a3b8');
    const bg = positive
      ? (isSelected ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.03)')
      : (isSelected ? 'rgba(239,68,68,0.12)' : 'rgba(0,0,0,0.03)');

    return (
      <button
        type="button"
        onClick={() => toggle(tag)}
        style={{
          padding: '0.45rem 0.9rem',
          borderRadius: '99px',
          border: `1.5px solid ${isSelected ? color : 'rgba(0,0,0,0.1)'}`,
          background: bg,
          color,
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s',
          userSelect: 'none',
        }}
      >
        {tag}
      </button>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
          <ThumbsUp size={13} color="#10b981" />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            What went well
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {POSITIVE_TAGS.map(t => <TagPill key={t} tag={t} positive />)}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
          <ThumbsDown size={13} color="#ef4444" />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Areas to improve
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {NEGATIVE_TAGS.map(t => <TagPill key={t} tag={t} />)}
        </div>
      </div>
    </div>
  );
};

export default TagSelector;
