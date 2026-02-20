import React, { useState } from 'react';
import { Mail, MessageSquare, ExternalLink, CalendarClock, History } from 'lucide-react';
import { toAssetUrl } from '../../utils/media';

const PatientCard = ({ patient, onNavigate, onMessage }) => {
    const [imageError, setImageError] = useState(false);
    const isActive = patient.status === 'Active';
    const formatDate = (value) => {
        if (!value) return 'Not available';
        return new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <article className="patient-roster-card">
            <div className="patient-roster-main">
                <div className="patient-roster-identity">
                    <div className="patient-roster-avatar">
                    {patient.patient_image && !imageError ? (
                        <img 
                            src={toAssetUrl(patient.patient_image)} 
                            alt={patient.full_name} 
                            crossOrigin="anonymous"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                            <span className="patient-roster-initial">
                            {patient.full_name ? patient.full_name.charAt(0).toUpperCase() : 'P'}
                        </span>
                    )}
                </div>

                    <div className="patient-roster-meta">
                        <h4>{patient.full_name}</h4>
                        <p className="patient-roster-email">
                            <Mail size={14} />
                            <span>{patient.email}</span>
                        </p>
                    </div>
                </div>

                <div className="patient-roster-visits">
                    <div className="patient-visit-chip">
                        <span className="visit-chip-label">
                            <History size={14} />
                            Last Visit
                        </span>
                        <span className="visit-chip-value">{formatDate(patient.last_visit)}</span>
                    </div>
                    <div className="patient-visit-chip upcoming">
                        <span className="visit-chip-label">
                            <CalendarClock size={14} />
                            Upcoming
                        </span>
                        <span className="visit-chip-value">
                            {patient.next_appointment ? formatDate(patient.next_appointment) : 'No schedule'}
                        </span>
                    </div>
                </div>

                <div className="patient-roster-actions">
                    <span className={`patient-status-pill ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="patient-action-buttons">
                        <button 
                            onClick={() => onMessage(patient.id)}
                            className="patient-icon-btn primary"
                            title="Message Patient"
                        >
                            <MessageSquare size={18} />
                        </button>
                        <button 
                            onClick={() => onNavigate(patient.id)}
                            className="patient-icon-btn neutral"
                            title="View Profile"
                        >
                            <ExternalLink size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default PatientCard;
