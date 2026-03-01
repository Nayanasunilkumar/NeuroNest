import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
    getPatientDossier, 
    completeAppointment,
    cancelAppointment,
    markNoShow,
    saveClinicalRemark
} from "../../api/doctor";
import { 
    Calendar, User, Mail, Phone, Clock, Bookmark, 
    ShieldAlert, ChevronLeft, Check, X, AlertCircle, Edit3
} from "lucide-react";

const PatientTimelinePage = () => {
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const navigate = useNavigate();
    
    const [dossier, setDossier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageError, setImageError] = useState(false);

    const fetchDossier = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getPatientDossier(patientId);
            setDossier(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching dossier:", err);
            setError("Dossier localized error. Path integrity failure.");
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        if (patientId) {
            fetchDossier();
        } else {
            setLoading(false);
        }
    }, [patientId, fetchDossier]);

    const handleAction = async (id, type) => {
        try {
            if (type === 'complete') await completeAppointment(id);
            if (type === 'cancel') await cancelAppointment(id);
            if (type === 'no-show') await markNoShow(id);
            fetchDossier();
        } catch (err) {
            alert(`Process failed: ${type}`);
        }
    };

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 gap-3 bg-light">
            <div className="spinner-border text-primary border-3" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-secondary fw-bold text-uppercase" style={{ letterSpacing: '2px', fontSize: '0.75rem' }}>Decrypting Clinical Stream...</p>
        </div>
    );
    
    if (error || !dossier) return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center p-4 bg-light">
            <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                <ShieldAlert size={40} />
            </div>
            <h2 className="fs-3 fw-bolder text-dark mb-2">Access Restricted</h2>
            <button 
                onClick={() => navigate(-1)}
                className="btn btn-dark rounded-pill px-5 py-2 fw-bold shadow-sm mt-3"
            >
                Return
            </button>
        </div>
    );

    const { identity, timeline } = dossier;

    const getStatusColor = (status) => {
        const s = status.toLowerCase();
        if (s.includes('approve') || s.includes('confirm')) return 'success';
        if (s.includes('pend')) return 'warning';
        if (s.includes('cancel') || s.includes('reject') || s.includes('fail')) return 'danger';
        if (s.includes('complete')) return 'primary';
        return 'secondary';
    };

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light" style={{ maxWidth: '1000px' }}>
            
            {/* Header Section */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5 pb-3 border-bottom border-light" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <div className="d-flex align-items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-sm btn-white bg-white border-0 shadow-sm rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                    >
                        <ChevronLeft size={20} className="text-dark" />
                    </button>
                    <div>
                        <div className="text-secondary small fw-medium text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Clinical Dossier / Timeline</div>
                        <h1 className="h4 fw-bolder text-dark mb-0">Clinical Timeline</h1>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3 bg-white px-3 py-2 rounded-pill shadow-sm border border-light">
                    <div className="bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                        {identity.full_name ? identity.full_name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="d-flex flex-column">
                        <span className="fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem', maxWidth: '150px' }}>{identity.full_name}</span>
                        <span className="text-secondary fw-bold" style={{ fontSize: '0.7rem' }}>#PID-{identity.id}</span>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="position-relative ms-3 ps-4 border-start border-2 border-primary border-opacity-25 py-2">
                {timeline.length === 0 ? (
                    <div className="text-center py-5 text-secondary fw-bold small">No clinical history recorded.</div>
                ) : (
                    timeline.map((event, index) => (
                        <div key={event.id} className="position-relative mb-5 last-mb-0">
                            {/* Timeline Dot */}
                            <div 
                                className={`position-absolute rounded-circle bg-${getStatusColor(event.status)} bg-opacity-25 d-flex align-items-center justify-content-center`}
                                style={{ width: '24px', height: '24px', left: '-37px', top: '0', zIndex: 1 }}
                            >
                                <div className={`rounded-circle bg-${getStatusColor(event.status)} shadow-sm`} style={{ width: '12px', height: '12px' }}></div>
                            </div>
                            
                            {/* Card Content */}
                            <div className="card border-0 shadow-sm rounded-4 bg-white hover-shadow transition-all overflow-hidden">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                                        <span className={`badge bg-${getStatusColor(event.status)} bg-opacity-10 text-${getStatusColor(event.status)} border border-${getStatusColor(event.status)} border-opacity-25 rounded-pill px-3 py-2 text-uppercase fw-bold`} style={{ letterSpacing: '1px' }}>
                                            {event.status}
                                        </span>
                                        <div className="d-flex align-items-center gap-2 text-secondary fw-bold small bg-light px-3 py-2 rounded-pill">
                                            <Clock size={14} className="text-primary" />
                                            {new Date(event.appointment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {event.appointment_time.substring(0, 5)}
                                        </div>
                                    </div>
                                    
                                    <h4 className="h5 fw-bolder text-dark mb-3">{event.reason || "Routine Clinical Assessment"}</h4>
                                    
                                    <div className="bg-light bg-opacity-50 text-secondary p-3 rounded-3 border fw-medium small mb-0 lh-base">
                                        {event.notes || "No additional clinical notes recorded for this encounter."}
                                    </div>
                                    
                                    {event.status.toLowerCase() === 'approved' && (
                                        <div className="d-flex gap-2 mt-4 pt-3 border-top border-light">
                                            <button 
                                                onClick={() => handleAction(event.id, 'complete')} 
                                                className="btn btn-sm btn-success rounded-pill d-flex align-items-center gap-1 shadow-sm px-3 fw-bold bg-opacity-10 text-success border-success border-opacity-25 hover-bg-success hover-text-white transition-all"
                                            >
                                                <Check size={14} strokeWidth={3} /> Complete
                                            </button>
                                            <button 
                                                onClick={() => handleAction(event.id, 'cancel')} 
                                                className="btn btn-sm btn-danger rounded-pill d-flex align-items-center gap-1 shadow-sm px-3 fw-bold bg-opacity-10 text-danger border-danger border-opacity-25 hover-bg-danger hover-text-white transition-all"
                                            >
                                                <X size={14} strokeWidth={3} /> Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <style>{`
                .last-mb-0:last-child { margin-bottom: 0 !important; }
                .hover-shadow { transition: box-shadow 0.3s ease; }
                .hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important; }
                .hover-bg-success:hover { background-color: var(--bs-success) !important; color: white !important; }
                .hover-bg-danger:hover { background-color: var(--bs-danger) !important; color: white !important; }
            `}</style>
        </div>
    );
};

export default PatientTimelinePage;
