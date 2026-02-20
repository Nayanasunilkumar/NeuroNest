import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, Clipboard, ShieldAlert, CheckCircle, Octagon, User, Activity, ArrowRight } from 'lucide-react';

const AppointmentDetailDrawer = ({ appointment, isOpen, onClose, onUpdateStatus }) => {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleEsc);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen || !appointment) return null;

    const handleStatusTransition = async (newStatus) => {
        setLoading(true);
        try {
            await onUpdateStatus(appointment.id, newStatus, notes);
            setNotes('');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const s = status?.toLowerCase() || '';
        if (s === 'approved') return { label: 'Verified', class: 'status-approved' };
        if (s === 'pending') return { label: 'Pending Oversight', class: 'status-pending' };
        if (s === 'completed') return { label: 'Event Completed', class: 'status-completed' };
        if (s.includes('cancelled')) return { label: 'Event Cancelled', class: 'status-cancelled' };
        if (s.includes('no_show') || s.includes('no-show')) return { label: 'Patient No-Show', class: 'status-no-show' };
        if (s === 'rejected') return { label: 'Rejected', class: 'status-rejected' };
        return { label: status, class: '' };
    };

    const statusConfig = getStatusConfig(appointment.status);

    // Timeline parsing helper
    const renderAuditTimeline = () => {
        const rawNotes = appointment.notes || "SYSTEM: Initial booking authorized.";
        const lines = rawNotes.split('\n').filter(l => l.trim());
        
        return lines.reverse().map((line, idx) => {
            const timeMatch = line.match(/\[(.*?)\]/);
            const timestamp = timeMatch ? timeMatch[1].split(' ')[1] : '';
            const date = timeMatch ? timeMatch[1].split(' ')[0] : '';
            const content = line.replace(/\[.*?\]/, '').trim();
            
            return (
                <div key={idx} className="timeline-item">
                    <div className="timeline-marker" />
                    <div className="timeline-content">
                        <div className="timeline-meta">
                            <span className="timeline-time">{timestamp || 'RECORDED'}</span>
                            <span className="timeline-date">{date}</span>
                        </div>
                        <div className="timeline-msg">{content}</div>
                    </div>
                </div>
            );
        });
    };

    return createPortal(
        <div className="appt-modal-portal">
            <div className="appt-modal-overlay" onClick={onClose} />
            <div className="appt-modal-container">
                <div className="appt-modal-nexus enterprise-theme">
                    <div className="modal-header-nexus">
                        <div className="header-prime">
                            <div className="institutional-tag">
                                <Activity size={10} /> Secured Clinical Event
                            </div>
                            <h1>Oversight Event #{appointment.id}</h1>
                        </div>
                        <div className="header-actions">
                            <div className={`status-pill ${statusConfig.class}`}>
                                {statusConfig.label}
                            </div>
                            <button className="close-trigger" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="modal-body-scroll">
                        {/* Dual Identity Grid */}
                        <div className="identity-matrix">
                            <div className="identity-card patient-card">
                                <div className="card-header">
                                    <User size={14} /> <span>Clinical Subject</span>
                                </div>
                                <div className="card-content">
                                    <h3 className="identity-title">{appointment.patient_name}</h3>
                                    <p className="identity-sub">{appointment.patient_email}</p>
                                    <div className="meta-row">
                                        <span className="meta-tag">ID: {appointment.patient_id || 'P-428'}</span>
                                        <span className="meta-tag">Priority: High</span>
                                    </div>
                                </div>
                            </div>
                            <div className="identity-card specialist-card">
                                <div className="card-header">
                                    <ShieldAlert size={14} /> <span>Assigned Specialist</span>
                                </div>
                                <div className="card-content">
                                    <h3 className="identity-title">
                                        {appointment.doctor_name?.startsWith('Dr.') ? appointment.doctor_name : `Dr. ${appointment.doctor_name}`}
                                    </h3>
                                    <p className="identity-sub">{appointment.doctor_specialization}</p>
                                    <div className="meta-row">
                                        <span className="meta-tag">Licensed</span>
                                        <span className="meta-tag">Sector: {appointment.sector || 'North'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule & Metadata */}
                        <div className="operational-matrix">
                            <div className="data-block schedule-block">
                                <label className="block-header">SCHEDULE PARAMETERS</label>
                                <div className="schedule-nexus">
                                    <div className="sched-item">
                                        <Calendar size={14} />
                                        <span>{appointment.appointment_date}</span>
                                    </div>
                                    <div className="sched-divider" />
                                    <div className="sched-item">
                                        <Clock size={14} />
                                        <span>{appointment.appointment_time}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="data-block consultation-block">
                                <label className="block-header">REASON FOR CONSULTATION</label>
                                <div className="clinical-narrative">
                                    {appointment.reason || "No diagnostic briefing provided."}
                                </div>
                            </div>
                        </div>

                        {/* Audit Timeline */}
                        <div className="audit-nexus">
                            <label className="block-header">GOVERNANCE AUDIT TRAIL</label>
                            <div className="clinical-timeline">
                                {renderAuditTimeline()}
                            </div>
                        </div>
                    </div>

                    <div className="governance-footer">
                        <div className="override-header">
                            <label className="override-label-nexus">
                                <div className="label-prime">
                                    <ShieldAlert size={12} /> 
                                    <span>INSTITUTIONAL JUSTIFICATION LOG</span>
                                </div>
                                <span className={`audit-badge ${notes.trim().length >= 10 ? 'verified' : 'required'}`}>
                                    {notes.trim().length >= 10 ? 'LOG VERIFIED' : 'MIN 10 CHARS'}
                                </span>
                            </label>
                        </div>
                        
                        <div className="justification-portal">
                            <textarea 
                                placeholder="State justification for medical oversight audit..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className={`audit-textarea ${notes.trim().length >= 10 ? 'audit-pass' : 'audit-fail'}`}
                            />
                            <div className="audit-meta">
                                <span className="char-count">{notes.length} / 250 characters recorded</span>
                            </div>
                        </div>

                        <div className="governance-action-grid">
                            <button 
                                className="gov-btn btn-complete" 
                                disabled={loading || appointment.status === 'Completed' || notes.trim().length < 10}
                                onClick={() => handleStatusTransition('Completed')}
                            >
                                <CheckCircle size={14} /> Mark Completed
                            </button>
                            <button 
                                className="gov-btn btn-cancel" 
                                disabled={loading || appointment.status === 'Cancelled' || notes.trim().length < 10}
                                onClick={() => handleStatusTransition('Cancelled')}
                            >
                                <Octagon size={14} /> Cancel Event
                            </button>
                            <button 
                                className="gov-btn btn-noshow" 
                                disabled={loading || appointment.status === 'No-show' || notes.trim().length < 10}
                                onClick={() => handleStatusTransition('No-show')}
                            >
                                <ShieldAlert size={14} /> No-Show
                            </button>
                            <button 
                                className="gov-btn btn-restore" 
                                disabled={loading || appointment.status === 'Approved' || notes.trim().length < 10}
                                onClick={() => handleStatusTransition('Approved')}
                            >
                                <Activity size={14} /> Restore Approved
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AppointmentDetailDrawer;
