import React from 'react';
import { AlertCircle, FileWarning, ShieldAlert, UserX } from 'lucide-react';

const GovernancePanel = ({ data }) => {
    if (!data) return <div className="p-4 text-center text-gray-500">Loading Governance Data...</div>;

    const cards = [
        {
            title: "Review Escalations",
            total: data.escalations?.total,
            unresolved: data.escalations?.unresolved,
            icon: FileWarning,
            color: "amber"
        },
        {
            title: "Patient Flags",
            total: data.patient_flags?.total,
            unresolved: data.patient_flags?.unresolved,
            icon: AlertCircle,
            color: "rose"
        },
        {
            title: "Security Events",
            total: data.security?.events_logged,
            unresolved: data.security?.failed_authentications,
            subLabel: "Failed Logins",
            icon: ShieldAlert,
            color: "blue"
        },
        {
            title: "Doctor Status Changes",
            total: data.doctor_status_changes,
            unresolved: 0,
            subLabel: "Suspensions/Reviews",
            icon: UserX,
            color: "fuchsia"
        }
    ];

    return (
        <div className="governance-cards-container grid grid-cols-2 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div key={index} className={`gov-card gov-${card.color}`}>
                        <div className="gov-header flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{card.title}</h4>
                            <div className="gov-icon-wrap w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0">
                                <Icon size={16} />
                            </div>
                        </div>
                        <div className="gov-metrics flex items-end justify-between mt-4">
                            <div>
                                <span className="block text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">
                                    {card.total}
                                </span>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                                    Total Logs
                                </span>
                            </div>
                            
                            {/* Unresolved / Sub Metric */}
                            <div className="text-right">
                                {card.unresolved > 0 ? (
                                    <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2.5 py-1 rounded-md">
                                        <AlertCircle size={12} strokeWidth={3} />
                                        <span className="text-xs font-bold">{card.unresolved} {card.subLabel || "Unresolved"}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                        All Clear
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default GovernancePanel;
