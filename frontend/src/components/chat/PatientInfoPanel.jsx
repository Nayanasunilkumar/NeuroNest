import React from 'react';
import { Calendar, Clock, History, AlertCircle, Info, Activity } from 'lucide-react';
import Avatar from '../shared/Avatar';

const CURRENT_YEAR = new Date().getUTCFullYear();

const PatientInfoPanel = ({ context, loading }) => {
    if (loading) return (
        <div className="nexus-clinical-panel" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="nexus-panel-avatar animate-spin" style={{ width: '32px', height: '32px', borderTopColor: 'transparent' }}></div>
            <p className="nexus-status-text" style={{ textAlign: 'center' }}>Synchronizing Clinical Data...</p>
        </div>
    );

    if (!context) return (
        <div className="nexus-clinical-panel" style={{ alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            <AlertCircle size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <p className="nexus-status-text" style={{ textAlign: 'center' }}>Select a thread to view clinical context.</p>
        </div>
    );

    const { identity, next_appointment, last_appointment } = context;

    const calculateAge = (dob) => {
        if (!dob || dob === 'N/A') return 'N/A';
        const birthDate = new Date(dob);
        if (Number.isNaN(birthDate.getTime())) return 'N/A';
        return Math.max(0, CURRENT_YEAR - birthDate.getUTCFullYear());
    };

    return (
        <div className="nexus-clinical-panel custom-scrollbar">
            {/* Identity Card */}
            <div className="nexus-panel-identity">
                <Avatar 
                    src={identity.profile_image}
                    alt={identity.full_name}
                    fallback={identity.full_name?.charAt(0)}
                    className="nexus-panel-avatar"
                />
                <h3 className="nexus-panel-name">{identity.full_name}</h3>
                <div className="nexus-badge-row">
                    <span className="nexus-mini-badge slate">
                        {identity.blood_group} Group
                    </span>
                    <span className="nexus-mini-badge blue">
                       {identity.gender}
                    </span>
                    <span className="nexus-mini-badge blue">
                       Age: {calculateAge(identity.dob)}
                    </span>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="nexus-stats-grid">
                <div className="nexus-stat-box">
                    <p className="nexus-stat-label">Height</p>
                    <p className="nexus-stat-value">{identity.height || '—'} cm</p>
                </div>
                <div className="nexus-stat-box">
                    <p className="nexus-stat-label">Weight</p>
                    <p className="nexus-stat-value">{identity.weight || '—'} kg</p>
                </div>
                <div className="nexus-stat-box" style={{ borderRight: 'none' }}>
                    <p className="nexus-stat-label">Location</p>
                    <p className="nexus-stat-value" style={{ fontSize: '0.75rem' }}>{identity.location || '—'}</p>
                </div>
            </div>

            {/* Clinical Milestones */}
            <div className="nexus-panel-clinical-section">
                {/* Critical Alerts */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col gap-3">
                        <h4 className="nexus-section-header text-red-500">
                            <AlertCircle size={12} strokeWidth={3} />
                            Allergies
                        </h4>
                        <div className={`nexus-clinical-card ${identity.allergies && identity.allergies !== 'None reported' ? 'hazard-red' : ''}`}>
                            <p style={{ 
                                fontSize: '0.8125rem', 
                                fontWeight: (identity.allergies && identity.allergies !== 'None reported') ? '800' : '500', 
                                color: (identity.allergies && identity.allergies !== 'None reported') ? '#ef4444' : '#64748b', 
                                margin: 0 
                            }}>
                                {identity.allergies || 'None reported'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h4 className="nexus-section-header text-amber-500">
                            <Info size={12} strokeWidth={3} />
                            Chronic Conditions
                        </h4>
                        <div className={`nexus-clinical-card ${identity.chronic_conditions && identity.chronic_conditions !== 'None reported' ? 'hazard-amber' : ''}`}>
                            <p style={{ 
                                fontSize: '0.8125rem', 
                                fontWeight: (identity.chronic_conditions && identity.chronic_conditions !== 'None reported') ? '800' : '500', 
                                color: (identity.chronic_conditions && identity.chronic_conditions !== 'None reported') ? '#f59e0b' : '#64748b', 
                                margin: 0 
                            }}>
                                {identity.chronic_conditions || 'None reported'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Next Appointment */}
                <div className="flex flex-col gap-3 mb-8">
                    <h4 className="nexus-section-header">
                        <Calendar size={12} strokeWidth={3} />
                        Next Encounter
                    </h4>
                    {next_appointment ? (
                        <div className="nexus-clinical-card" style={{ borderLeft: '3px solid #3b82f6' }}>
                            <p className="text-sm font-extrabold text-slate-800 mb-1">{next_appointment.date}</p>
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={12} className="text-blue-500" />
                                <p className="text-xs font-bold text-slate-500">{next_appointment.time}</p>
                            </div>
                            <div className="nexus-card-note">
                                "{next_appointment.reason}"
                            </div>
                        </div>
                    ) : (
                        <div className="nexus-clinical-card border-dashed text-center py-5">
                            <p className="text-xs text-slate-400 italic">No future visits scheduled.</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 mb-8">
                    <h4 className="nexus-section-header">
                        <History size={12} strokeWidth={3} />
                        Last Encounter
                    </h4>
                    {last_appointment ? (
                        <div className="nexus-clinical-card" style={{ borderLeft: '3px solid #64748b' }}>
                            <p className="text-sm font-extrabold text-slate-800 mb-1">{last_appointment.date}</p>
                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={12} className="text-slate-500" />
                                <p className="text-xs font-bold text-slate-500">{last_appointment.time}</p>
                            </div>
                            <div className="nexus-card-note">
                                Status: {last_appointment.status}
                            </div>
                        </div>
                    ) : (
                        <div className="nexus-clinical-card border-dashed text-center py-5">
                            <p className="text-xs text-slate-400 italic">No previous encounters.</p>
                        </div>
                    )}
                </div>

                {/* Patient Vitals Triage */}
                <div className="flex flex-col gap-4">
                    <h4 className="nexus-section-header">
                        <Activity size={12} />
                        System Status
                    </h4>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-medium">Messaging Role</span>
                            <span className="nexus-mini-badge blue">Verified</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-medium">Encryption</span>
                            <span className="nexus-mini-badge green">Secure</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ marginTop: 'auto', padding: '32px' }}>
                <button className="nexus-input-action-btn" style={{ width: '100%', fontSize: '0.625rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Open Clinical Record
                </button>
            </div>
        </div>
    );
};

export default PatientInfoPanel;
