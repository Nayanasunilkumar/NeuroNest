import React from 'react';
import { Calendar, CheckCircle, XCircle, Clock, BarChart2, Activity } from 'lucide-react';

const AppointmentSummaryCards = ({ stats }) => {
    const cards = [
        {
            label: "Total Today",
            value: stats?.total_today || 0,
            icon: Calendar,
            trend: "Clinical Load",
            color: "var(--admin-accent)"
        },
        {
            label: "Upcoming",
            value: stats?.upcoming || 0,
            icon: Clock,
            trend: "Queue",
            color: "#f59e0b"
        },
        {
            label: "Completed Today",
            value: stats?.completed_today || 0,
            icon: CheckCircle,
            trend: "Resolved",
            color: "#10b981"
        },
        {
            label: "Completion Rate",
            value: `${stats?.completion_rate || 0}%`,
            icon: BarChart2,
            trend: "Historical Performance",
            color: "#6366f1"
        },
        {
            label: "Cancellation Rate",
            value: `${stats?.cancellation_rate || 0}%`,
            icon: Activity,
            trend: "Dropout Delta",
            color: "#ef4444"
        }
    ];

    return (
        <div className="summary-cards-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div key={idx} className="summary-card">
                        <div className="card-label">{card.label}</div>
                        <div className="card-value" style={{ color: card.color }}>{card.value}</div>
                        <div className="card-trend">
                            <Icon size={12} strokeWidth={3} />
                            <span>{card.trend}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AppointmentSummaryCards;
