import React from 'react';
import { Calendar, Clock, History, AlertCircle, Info, Activity } from 'lucide-react';
import Avatar from '../shared/Avatar';

const CURRENT_YEAR = new Date().getUTCFullYear();

const PatientInfoPanel = ({ context, loading }) => {
    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center bg-light border-start border-light h-100" style={{ width: '340px', flexShrink: 0 }}>
            <div className="spinner-border text-primary border-3 mb-3" style={{ width: '2rem', height: '2rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-secondary fw-bold small text-uppercase" style={{ letterSpacing: '0.05em' }}>Synchronizing Clinical Data...</p>
        </div>
    );

    if (!context) return (
        <div className="d-flex flex-column align-items-center justify-content-center bg-light border-start border-light h-100 opacity-50" style={{ width: '340px', flexShrink: 0 }}>
            <AlertCircle size={40} className="text-secondary mb-3" />
            <p className="text-secondary fw-bold small text-uppercase text-center" style={{ letterSpacing: '0.05em' }}>Select a thread to view clinical context.</p>
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
        <div className="d-flex flex-column bg-light border-start border-light h-100 overflow-y-auto custom-scrollbar" style={{ width: '340px', flexShrink: 0 }}>
            {/* Identity Card */}
            <div className="p-4 text-center bg-white border-bottom border-light">
                <Avatar 
                    src={identity.profile_image}
                    alt={identity.full_name}
                    fallback={identity.full_name?.charAt(0)}
                    className="mx-auto mb-3 border border-2 border-white shadow-sm"
                    style={{ width: '96px', height: '96px', borderRadius: '24px' }}
                />
                <h3 className="h5 fw-bolder text-dark mb-2">{identity.full_name}</h3>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>
                        {identity.blood_group} Group
                    </span>
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>
                       {identity.gender}
                    </span>
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>
                       Age: {calculateAge(identity.dob)}
                    </span>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="row g-0 border-bottom border-light bg-white text-center">
                <div className="col border-end border-light py-3">
                    <p className="text-secondary text-uppercase fw-bold mb-1" style={{ fontSize: '0.55rem', letterSpacing: '0.05em' }}>Height</p>
                    <p className="fw-bolder text-dark mb-0" style={{ fontSize: '0.875rem' }}>{identity.height || '—'} cm</p>
                </div>
                <div className="col border-end border-light py-3">
                    <p className="text-secondary text-uppercase fw-bold mb-1" style={{ fontSize: '0.55rem', letterSpacing: '0.05em' }}>Weight</p>
                    <p className="fw-bolder text-dark mb-0" style={{ fontSize: '0.875rem' }}>{identity.weight || '—'} kg</p>
                </div>
                <div className="col py-3 px-2">
                    <p className="text-secondary text-uppercase fw-bold mb-1" style={{ fontSize: '0.55rem', letterSpacing: '0.05em' }}>Location</p>
                    <p className="fw-bolder text-dark mb-0 text-truncate" style={{ fontSize: '0.75rem' }} title={identity.location}>{identity.location || '—'}</p>
                </div>
            </div>

            {/* Clinical Milestones */}
            <div className="p-4 d-flex flex-column gap-4 flex-grow-1">
                {/* Critical Alerts */}
                <div className="d-flex flex-column gap-4">
                    <div className="d-flex flex-column gap-2">
                        <h4 className="d-flex align-items-center gap-2 text-danger text-uppercase fw-bolder mb-0" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                            <AlertCircle size={14} />
                            Allergies
                        </h4>
                        <div className={`p-3 rounded-4 border bg-white ${identity.allergies && identity.allergies !== 'None reported' ? 'border-danger border-opacity-25 bg-danger bg-opacity-10' : 'shadow-sm'}`}>
                            <p className={`mb-0 ${identity.allergies && identity.allergies !== 'None reported' ? 'fw-bolder text-danger' : 'fw-medium text-secondary'}`} style={{ fontSize: '0.8125rem' }}>
                                {identity.allergies || 'None reported'}
                            </p>
                        </div>
                    </div>
                    <div className="d-flex flex-column gap-2">
                        <h4 className="d-flex align-items-center gap-2 text-warning text-uppercase fw-bolder mb-0" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                            <Info size={14} />
                            Chronic Conditions
                        </h4>
                        <div className={`p-3 rounded-4 border bg-white ${identity.chronic_conditions && identity.chronic_conditions !== 'None reported' ? 'border-warning border-opacity-25 bg-warning bg-opacity-10' : 'shadow-sm'}`}>
                            <p className={`mb-0 ${identity.chronic_conditions && identity.chronic_conditions !== 'None reported' ? 'fw-bolder text-warning' : 'fw-medium text-secondary'}`} style={{ fontSize: '0.8125rem' }}>
                                {identity.chronic_conditions || 'None reported'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Next Appointment */}
                <div className="d-flex flex-column gap-2">
                    <h4 className="d-flex align-items-center gap-2 text-secondary text-uppercase fw-bolder mb-0" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                        <Calendar size={14} />
                        Next Encounter
                    </h4>
                    {next_appointment ? (
                        <div className="p-3 bg-white rounded-4 shadow-sm border border-start border-primary border-4">
                            <p className="fw-bolder text-dark mb-1" style={{ fontSize: '0.875rem' }}>{next_appointment.date}</p>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Clock size={12} className="text-primary" />
                                <p className="fw-bold text-secondary mb-0" style={{ fontSize: '0.75rem' }}>{next_appointment.time}</p>
                            </div>
                            <div className="fst-italic text-secondary pt-2 border-top small" style={{ fontSize: '0.75rem' }}>
                                "{next_appointment.reason}"
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-white rounded-4 border border-dashed text-center">
                            <p className="fst-italic text-secondary mb-0" style={{ fontSize: '0.75rem' }}>No future visits scheduled.</p>
                        </div>
                    )}
                </div>

                <div className="d-flex flex-column gap-2">
                    <h4 className="d-flex align-items-center gap-2 text-secondary text-uppercase fw-bolder mb-0" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                        <History size={14} />
                        Last Encounter
                    </h4>
                    {last_appointment ? (
                        <div className="p-3 bg-white rounded-4 shadow-sm border border-start border-secondary border-4">
                            <p className="fw-bolder text-dark mb-1" style={{ fontSize: '0.875rem' }}>{last_appointment.date}</p>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Clock size={12} className="text-secondary" />
                                <p className="fw-bold text-secondary mb-0" style={{ fontSize: '0.75rem' }}>{last_appointment.time}</p>
                            </div>
                            <div className="fst-italic text-secondary pt-2 border-top small" style={{ fontSize: '0.75rem' }}>
                                Status: <span className="fw-bold text-dark">{last_appointment.status}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-white rounded-4 border border-dashed text-center">
                            <p className="fst-italic text-secondary mb-0" style={{ fontSize: '0.75rem' }}>No previous encounters.</p>
                        </div>
                    )}
                </div>

                {/* Patient Vitals Triage */}
                <div className="d-flex flex-column gap-3 mt-2">
                    <h4 className="d-flex align-items-center gap-2 text-secondary text-uppercase fw-bolder mb-0" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                        <Activity size={14} />
                        System Status
                    </h4>
                    <div className="d-flex flex-column gap-2 bg-white rounded-4 p-3 shadow-sm border">
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-secondary fw-bold" style={{ fontSize: '0.75rem' }}>Messaging Role</span>
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2 py-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Verified</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-secondary fw-bold" style={{ fontSize: '0.75rem' }}>Encryption</span>
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Secure</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 mt-auto">
                <button className="btn btn-light border text-secondary w-100 rounded-pill shadow-sm transition-all hover-bg-light fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                    Open Clinical Record
                </button>
            </div>

            <style>{`
                .hover-bg-light:hover { background-color: rgba(0,0,0,0.05) !important; color: var(--bs-primary) !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default PatientInfoPanel;
