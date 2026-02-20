import React from 'react';
import { Star, AlertTriangle, UserX, MessageSquare } from 'lucide-react';

const QualityStatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      label: 'Average Rating',
      value: stats.avg_rating,
      sub: `${stats.total_reviews} Total Reviews`,
      icon: Star,
      color: 'var(--admin-success)',
      trend: 'Institutional Quality'
    },
    {
      label: 'Recent Negatives',
      value: stats.recent_negative,
      sub: 'Last 7 Days',
      icon: AlertTriangle,
      color: 'var(--admin-warning)',
      trend: 'Triage Required'
    },
    {
      label: 'Most Reported',
      value: stats.most_reported_doctor,
      sub: 'Action Required',
      icon: UserX,
      color: 'var(--admin-danger)',
      trend: 'Escalation Alert'
    },
    {
      label: 'Open Escalations',
      value: stats.unresolved_escalations,
      sub: 'Pending Resolution',
      icon: MessageSquare,
      color: 'var(--admin-accent)',
      trend: 'Governance Queue'
    }
  ];

  return (
    <div className="summary-cards-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="summary-card">
          <div className="card-label">{card.label}</div>
          <div className="card-value" style={{ color: card.color }}>
            {card.value}
          </div>
          <div className="card-trend">
            <card.icon size={14} color={card.color} />
            <span style={{ color: card.color }}>{card.trend}</span>
          </div>
          <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem', fontWeight: 700 }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QualityStatsCards;
