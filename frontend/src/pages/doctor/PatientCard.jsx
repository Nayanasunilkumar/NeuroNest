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
        <article className="card border-0 shadow-sm mb-3 rounded-4" style={{ overflow: 'hidden', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.classList.add('shadow')} onMouseLeave={(e) => e.currentTarget.classList.remove('shadow')}>
            <div className="card-body p-4 d-flex flex-column flex-md-row align-items-center gap-4">
                
                {/* Identity */}
                <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ minWidth: '250px' }}>
                    <div className="rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '60px', height: '60px', overflow: 'hidden' }}>
                        {patient.patient_image && !imageError ? (
                            <img 
                                src={toAssetUrl(patient.patient_image)} 
                                alt={patient.full_name} 
                                className="w-100 h-100 object-fit-cover"
                                crossOrigin="anonymous"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <span className="fs-4 fw-bold text-primary">
                                {patient.full_name ? patient.full_name.charAt(0).toUpperCase() : 'P'}
                            </span>
                        )}
                    </div>
                    <div className="text-truncate">
                        <h5 className="fw-bold mb-1 text-dark text-truncate" style={{ maxWidth: '200px' }}>{patient.full_name}</h5>
                        <div className="d-flex align-items-center gap-2 text-secondary small">
                            <Mail size={14} />
                            <span className="text-truncate" style={{ maxWidth: '180px' }}>{patient.email}</span>
                        </div>
                    </div>
                </div>

                {/* Visits info */}
                <div className="d-flex flex-row align-items-center gap-3 flex-grow-1">
                    <div className="flex-fill bg-light rounded-3 p-3 border">
                        <div className="d-flex align-items-center gap-2 text-secondary text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                            <History size={12} strokeWidth={2.5} /> Last Visit
                        </div>
                        <div className="fw-bold text-dark small">
                            {formatDate(patient.last_visit)}
                        </div>
                    </div>
                    <div className="flex-fill bg-primary bg-opacity-10 rounded-3 p-3 border border-primary border-opacity-25">
                        <div className="d-flex align-items-center gap-2 text-primary text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                            <CalendarClock size={12} strokeWidth={2.5} /> Upcoming
                        </div>
                        <div className="fw-bold text-primary small">
                            {patient.next_appointment ? formatDate(patient.next_appointment) : 'No schedule'}
                        </div>
                    </div>
                </div>

                {/* Actions & Status */}
                <div className="d-flex align-items-center gap-4 justify-content-between justify-content-md-end flex-grow-1 mt-3 mt-md-0">
                    <div className="d-none d-md-block">
                        <span className={`badge rounded-pill px-3 py-2 text-uppercase ${isActive ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25'}`} style={{ letterSpacing: '1px' }}>
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2 justify-content-end w-100 w-md-auto">
                        <button 
                            onClick={() => onMessage(patient.id)} 
                            title="Message Patient"
                            className="btn btn-outline-primary rounded-3 d-flex align-items-center justify-content-center flex-fill flex-md-grow-0"
                            style={{ width: '45px', height: '45px' }}
                        >
                            <MessageSquare size={18} />
                        </button>
                        <button 
                            onClick={() => onNavigate(patient.id)} 
                            title="View Clinical Profile"
                            className="btn btn-outline-secondary rounded-3 d-flex align-items-center justify-content-center flex-fill flex-md-grow-0"
                            style={{ width: '45px', height: '45px' }}
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
