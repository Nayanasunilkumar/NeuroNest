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
import { toAssetUrl } from "../../utils/media";
import "../../styles/doctor-records.css";

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

    if (loading) return <div className="p-10 text-center animate-pulse">Decrypting Clinical Stream...</div>;
    
    if (error || !dossier) return (
        <div className="p-10 text-center">
            <h2 className="text-xl font-bold text-red-500">Access Restricted</h2>
            <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold">Return</button>
        </div>
    );

    const { identity, timeline } = dossier;

    return (
        <div className="opd-dashboard-root">
            <div className="dossier-premium-root">
                <div className="dossier-premium-header">
                    <div className="header-nexus-left">
                        <button onClick={() => navigate(-1)} className="btn-back-circle">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="header-title-stack">
                            <span className="header-breadcrumb-mini">Clinical Dossier / Timeline</span>
                            <h1 className="dossier-premium-title">Clinical Timeline</h1>
                        </div>
                    </div>
                    <div className="header-nexus-right">
                        <div className="patient-identity-capsule">
                            <div className="capsule-avatar-mini">
                                {identity.full_name.charAt(0)}
                            </div>
                            <div className="capsule-text">
                                <span className="capsule-name">{identity.full_name}</span>
                                <span className="capsule-id">#PID-{identity.id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dossier-premium-grid-single">
                    <div className="timeline-premium-axis custom-scrollbar">
                        <div className="timeline-content-wrapper fade-in">
                            <div className="timeline-vertical-line" />
                            {timeline.map((event) => (
                                <div key={event.id} className="encounter-item-premium">
                                    <div className="encounter-dot" />
                                    <div className="encounter-card-premium">
                                        <div className="encounter-meta-top">
                                            <span className={`status-badge-premium status-${event.status.toLowerCase().replace(/[_-]/g, '')}`}>
                                                {event.status}
                                            </span>
                                            <div className="encounter-time-stamp">
                                                <Clock size={14} />
                                                {new Date(event.appointment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {event.appointment_time.substring(0, 5)}
                                            </div>
                                        </div>
                                        <h4 className="encounter-reason-title">{event.reason || "Routine Clinical Assessment"}</h4>
                                        <div className="encounter-notes-box">
                                            {event.notes || "No additional clinical notes recorded."}
                                        </div>
                                        {event.status.toLowerCase() === 'approved' && (
                                            <div className="encounter-actions-row">
                                                <button onClick={() => handleAction(event.id, 'complete')} className="action-btn-complete">
                                                    <Check size={14} strokeWidth={3} /> Complete
                                                </button>
                                                <button onClick={() => handleAction(event.id, 'cancel')} className="action-btn-danger">
                                                    <X size={14} /> Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientTimelinePage;
