import React from 'react';
import { Star, ClipboardList, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const FeedbackOverviewCards = ({ summary }) => {
  if (!summary) return <div className="df-cards-grid">{[...Array(4)].map((_, i) => <div key={i} className="df-card skeleton" />)}</div>;

  const trendIcon = summary.rating_trend === 'up'
    ? <TrendingUp size={16} color="#10b981" />
    : summary.rating_trend === 'down'
    ? <TrendingDown size={16} color="#ef4444" />
    : <Minus size={16} color="#94a3b8" />;

  const cards = [
    {
      icon: <Star size={20} />,
      label: 'Average Rating',
      value: summary.avg_rating?.toFixed(1) || '—',
      sub: 'out of 5.0',
      accent: '#f59e0b',
      accentBg: 'rgba(245,158,11,0.08)',
    },
    {
      icon: <ClipboardList size={20} />,
      label: 'Total Reviews',
      value: summary.total_reviews ?? 0,
      sub: 'all time',
      accent: '#6366f1',
      accentBg: 'rgba(99,102,241,0.08)',
    },
    {
      icon: <AlertTriangle size={20} />,
      label: 'Negative Reviews',
      value: summary.negative_reviews_30d ?? 0,
      sub: 'last 30 days',
      accent: '#ef4444',
      accentBg: 'rgba(239,68,68,0.08)',
    },
    {
      icon: trendIcon,
      label: 'Rating Trend',
      value: summary.rating_trend === 'up' ? '↑ Rising' : summary.rating_trend === 'down' ? '↓ Falling' : '→ Stable',
      sub: 'vs previous period',
      accent: summary.rating_trend === 'up' ? '#10b981' : summary.rating_trend === 'down' ? '#ef4444' : '#94a3b8',
      accentBg: summary.rating_trend === 'up' ? 'rgba(16,185,129,0.08)' : summary.rating_trend === 'down' ? 'rgba(239,68,68,0.08)' : 'rgba(148,163,184,0.08)',
    },
  ];

  return (
    <div className="df-cards-grid">
      {cards.map((card, i) => (
        <div key={i} className="df-card" style={{ borderTop: `3px solid ${card.accent}` }}>
          <div className="df-card-icon" style={{ background: card.accentBg, color: card.accent }}>
            {card.icon}
          </div>
          <div className="df-card-body">
            <div className="df-card-label">{card.label}</div>
            <div className="df-card-value" style={{ color: card.accent }}>{card.value}</div>
            <div className="df-card-sub">{card.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedbackOverviewCards;
