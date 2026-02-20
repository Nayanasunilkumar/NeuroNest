import React from 'react';

const TAG_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#84cc16',
];

const POSITIVE_KEYWORDS = ['communication', 'explanation', 'kind', 'helpful', 'professional', 'thorough', 'clear', 'attentive'];
const NEGATIVE_KEYWORDS = ['wait', 'late', 'rush', 'dismiss', 'rude', 'long', 'hurry', 'ignored'];

const tagSentiment = (tag) => {
  const lower = tag.toLowerCase();
  if (POSITIVE_KEYWORDS.some(k => lower.includes(k))) return 'positive';
  if (NEGATIVE_KEYWORDS.some(k => lower.includes(k))) return 'negative';
  return 'neutral';
};

const TagAnalyticsPanel = ({ tags }) => {
  if (!tags) return <div className="df-panel skeleton" style={{ height: 160 }} />;

  if (!tags.length) {
    return (
      <div className="df-panel">
        <div className="df-panel-header">
          <h3 className="df-panel-title">Feedback Tag Analytics</h3>
        </div>
        <p className="df-empty-msg">No tags have been recorded yet. Tags will appear as admin moderates reviews.</p>
      </div>
    );
  }

  const max = tags[0]?.count || 1;

  return (
    <div className="df-panel">
      <div className="df-panel-header">
        <h3 className="df-panel-title">Feedback Tag Analytics</h3>
        <span className="df-panel-sub">Most mentioned themes</span>
      </div>
      <div className="df-tags-grid">
        {tags.map((t, i) => {
          const sentiment = tagSentiment(t.tag);
          const color = sentiment === 'positive' ? '#10b981' : sentiment === 'negative' ? '#ef4444' : TAG_COLORS[i % TAG_COLORS.length];
          return (
            <div key={i} className="df-tag-item" style={{ borderColor: `${color}33`, background: `${color}0d` }}>
              <span className="df-tag-name" style={{ color }}>{t.tag}</span>
              <span className="df-tag-count" style={{ background: color, color: '#fff' }}>{t.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TagAnalyticsPanel;
