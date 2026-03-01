import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
    getPatientDossier, 
    saveClinicalRemark, 
    completeAppointment,
    cancelAppointment,
    markNoShow
} from "../../api/doctor";
import { 
    Calendar, User, Clock, Mail, Phone, Info, 
    ChevronRight, ChevronLeft, Bookmark, ShieldAlert, Edit3, Folder, StickyNote,
    Check, X, AlertCircle, FileText, Activity, MessageSquare, LayoutGrid, Bell
} from "lucide-react";
import { toAssetUrl } from "../../utils/media";

const PatientRecords = () => {
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const navigate = useNavigate();
    
    const [dossier, setDossier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageError, setImageError] = useState(false);
    
    // Remarks State
    const [showRemarkModal, setShowRemarkModal] = useState(false);
    const [remarkContent, setRemarkContent] = useState("");
    const [savingRemark, setSavingRemark] = useState(false);

    const fetchDossier = useCallback(async () => {
        try {
            setLoading(true);
            setImageError(false);
            const data = await getPatientDossier(patientId);
            setDossier(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching dossier:", err);
            setError("Access restricted. Clinical relationship required.");
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

    const handleSaveRemark = async () => {
        if (!remarkContent.trim()) return;
        try {
            setSavingRemark(true);
            await saveClinicalRemark(patientId, remarkContent);
            setRemarkContent("");
            setShowRemarkModal(false);
            fetchDossier();
        } catch (err) {
            console.error("Failed to save remark:", err);
            alert("Failed to save clinical remark. Please try again.");
        } finally {
            setSavingRemark(false);
        }
    };

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 gap-3 bg-light">
            <div className="spinner-border text-primary border-3" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-secondary fw-bold text-uppercase" style={{ letterSpacing: '2px', fontSize: '0.75rem' }}>Retrieving Clinical Archive...</p>
        </div>
    );

    if (error || !dossier) return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center p-4 bg-light">
            <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                <ShieldAlert size={40} />
            </div>
            <h2 className="fs-3 fw-bolder text-dark mb-2">Access Restricted</h2>
            <p className="text-secondary mb-4" style={{ maxWidth: '400px' }}>{error || "Patient not found in your clinical records."}</p>
            <button 
                onClick={() => navigate(-1)}
                className="btn btn-dark rounded-pill px-5 py-2 fw-bold shadow-sm"
            >
                Return to Schedule
            </button>
        </div>
    );

    const { identity, timeline } = dossier;

    const navItems = [
        { title: "Clinical Timeline", desc: `${timeline.length} Recorded Encounters`, icon: <Calendar size={24} />, route: `/doctor/patient-timeline?patientId=${patientId}`, color: "primary" },
        { title: "Medical Summary", desc: "Allergies, Meds & Conditions", icon: <FileText size={24} />, route: `/doctor/medical-records?patientId=${patientId}`, color: "info" },
        { title: "Write Prescription", desc: "Issue high-fidelity scripts", icon: <Edit3 size={24} />, route: `/doctor/write-prescription?patientId=${patientId}`, color: "success" },
        { title: "Assessment Reports", desc: "Clinical evaluation results", icon: <ShieldAlert size={24} />, route: `/doctor/assessment-reports?patientId=${patientId}`, color: "warning" },
        { title: "Performance Analytics", desc: "Therapeutic outcome data", icon: <Activity size={24} />, route: `/doctor/performance-analytics?patientId=${patientId}`, color: "indigo", customColor: "#6610f2" },
        { title: "Patients Chat", desc: "Clinical consultation threads", icon: <MessageSquare size={24} />, route: `/doctor/chat?patientId=${patientId}`, color: "teal", customColor: "#20c997" },
        { title: "Clinical Archives", desc: "Remark logs & longitudinal history", icon: <Folder size={24} />, route: `/doctor/clinical-archives?patientId=${patientId}`, color: "secondary" },
        { title: "Alerts", desc: "Clinical triggers & notifications", icon: <Bell size={24} />, route: `/doctor/alerts?patientId=${patientId}`, color: "danger" }
    ];

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light" style={{ maxWidth: '1400px' }}>
            
            {/* Header Section */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-light" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <div className="d-flex align-items-center gap-3">
                    <button
                        onClick={() => navigate('/doctor/patients')}
                        className="btn btn-sm btn-primary rounded-pill d-flex align-items-center gap-1 fw-bold shadow-sm px-3"
                    >
                        <ChevronLeft size={16} /> My Patients
                    </button>
                    <div>
                        <div className="text-secondary small fw-medium text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>My Patients / Clinical Dossier</div>
                        <h1 className="h4 fw-bolder text-dark mb-0">Clinical Dossier</h1>
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

            <div className="row g-4">
                {/* LEFT PANEL: Patient Summary Monolith */}
                <div className="col-12 col-xl-4">
                    <div className="card shadow-sm border-0 rounded-4 bg-white h-100 overflow-hidden position-sticky" style={{ top: '2rem' }}>
                        
                        {/* Avatar Section */}
                        <div className="bg-primary bg-opacity-10 p-4 text-center border-bottom border-primary border-opacity-10">
                            <div className="position-relative d-inline-block rounded-circle overflow-hidden shadow-sm mb-3 bg-white" style={{ width: '120px', height: '120px', border: '4px solid white', padding: '2px' }}>
                                {identity.profile_image && !imageError ? (
                                    <img 
                                        src={toAssetUrl(identity.profile_image)} 
                                        alt={identity.full_name} 
                                        className="w-100 h-100 rounded-circle object-fit-cover"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="w-100 h-100 rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center">
                                        <span className="display-4 fw-bolder text-primary">
                                            {identity.full_name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <h2 className="h4 fw-bolder text-dark mb-1">{identity.full_name}</h2>
                            <span className="badge bg-white text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1 shadow-sm fw-bold">
                                Patient ID #00{identity.id}
                            </span>
                        </div>

                        {/* Info List */}
                        <div className="card-body p-4 p-lg-5">
                            <div className="d-flex flex-column gap-4 mb-5">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-light text-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                        <Mail size={18} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-secondary small fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Email Access</div>
                                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem' }}>{identity.email}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-light text-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <div className="text-secondary small fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Clinical Contact</div>
                                        <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{identity.phone}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-light text-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="text-secondary small fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Date of Birth</div>
                                        <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{identity.dob}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-light text-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <div className="text-secondary small fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Clinical Profile</div>
                                        <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{identity.gender} ({identity.blood_group})</div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowRemarkModal(true)}
                                className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-3 rounded-pill fw-bold shadow-sm"
                            >
                                <Edit3 size={18} />
                                Add Remark
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Clinical Hub Nexus */}
                <div className="col-12 col-xl-8">
                    <div className="row g-3 g-md-4">
                        {navItems.map((item, idx) => (
                            <div key={idx} className="col-12 col-md-6">
                                <button 
                                    onClick={() => navigate(item.route)} 
                                    className="btn btn-white w-100 text-start border-0 shadow-sm rounded-4 p-4 d-flex align-items-center justify-content-between position-relative overflow-hidden group bg-white hover-bg-light transition-all h-100"
                                    style={{ borderRadius: '1rem' }}
                                >
                                    {/* Action Content */}
                                    <div className="d-flex align-items-center gap-3 w-100 z-1">
                                        <div 
                                            className={`rounded-4 d-flex align-items-center justify-content-center flex-shrink-0 bg-${item.color} bg-opacity-10 text-${item.color}`}
                                            style={{ 
                                                width: '56px', height: '56px',
                                                backgroundColor: item.customColor ? `${item.customColor}1A` : undefined,
                                                color: item.customColor || undefined
                                            }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <h4 className="fw-bold text-dark fs-6 mb-1 text-truncate">{item.title}</h4>
                                            <p className="text-secondary small fw-medium mb-0 text-truncate">{item.desc}</p>
                                        </div>
                                    </div>
                                    {/* Arrow */}
                                    <ChevronRight size={20} className="text-secondary opacity-50 z-1" />
                                    
                                    {/* Hover effect pseudo-element (achieved with CSS typically, here handled by btn-light hover) */}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Clinical Remark Modal */}
            {showRemarkModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1" onClick={() => setShowRemarkModal(false)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header border-bottom-0 p-4 pb-0 d-flex justify-content-between align-items-start">
                                <div>
                                    <h3 className="h5 fw-bolder text-dark mb-1">Clinical Remarks</h3>
                                    <p className="text-secondary small fw-medium mb-0">Internal observations for {identity.full_name}</p>
                                </div>
                                <button 
                                    onClick={() => setShowRemarkModal(false)}
                                    className="btn-close shadow-none"
                                ></button>
                            </div>
                            
                            <div className="modal-body p-4">
                                <label className="form-label small fw-bolder text-secondary text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Observations & Notes</label>
                                <textarea 
                                    value={remarkContent}
                                    onChange={(e) => setRemarkContent(e.target.value)}
                                    className="form-control border-2 shadow-none rounded-3 p-3 fw-medium mb-3"
                                    placeholder="Enter clinical observations, behavioral notes, or treatment compliance remarks..."
                                    rows="6"
                                    autoFocus
                                ></textarea>
                                <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 rounded-3 border-0 bg-info bg-opacity-10 text-info fw-medium mb-0" role="alert">
                                    <Info size={16} className="flex-shrink-0" />
                                    <span>These remarks are internal and not visible to patients.</span>
                                </div>
                            </div>

                            <div className="modal-footer border-top-0 p-4 pt-0 d-flex gap-2">
                                <button 
                                    onClick={() => setShowRemarkModal(false)}
                                    className="btn btn-light rounded-pill px-4 fw-bold shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveRemark}
                                    disabled={savingRemark || !remarkContent.trim()}
                                    className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                                >
                                    {savingRemark ? "Saving..." : "Save Remark"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientRecords;
