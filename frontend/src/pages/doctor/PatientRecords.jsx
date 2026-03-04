import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
    getPatientDossier, 
    saveClinicalRemark, 
} from "../../api/doctor";
import { 
    Calendar, User, Clock, Mail, Phone, Info, 
    ChevronLeft, Edit3, ShieldAlert,
    Check, X, FileText, Activity, MessageSquare, 
    ArrowRight, MapPin, Droplet, Hash, Heart,
    Utensils, Coffee, Moon, Scale
} from "lucide-react";
import { toAssetUrl } from "../../utils/media";
import "../../styles/patient-records.css";

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
            <button onClick={() => navigate(-1)} className="btn btn-dark rounded-pill px-5 py-2 fw-bold shadow-sm">Return to Schedule</button>
        </div>
    );

    const { identity, timeline, medications, conditions, allergies } = dossier;

    // Calculations
    const calculateAge = (dobString) => {
        if (!dobString || dobString === "N/A") return "N/A";
        const birthDate = new Date(dobString);
        const difference = Date.now() - birthDate.getTime();
        const ageDate = new Date(difference);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const calculateBMI = (weight, height) => {
        if (!weight || !height) return "N/A";
        const heightMeters = height / 100;
        return (weight / (heightMeters * heightMeters)).toFixed(1);
    };

    const age = calculateAge(identity.dob);
    const bmi = calculateBMI(identity.weight, identity.height);

    return (
        <div className="patient-profile-wrapper py-4 px-3 px-md-5">
            
            {/* Top Navigation */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <button onClick={() => navigate('/doctor/patients')} className="btn btn-light rounded-pill d-flex align-items-center gap-2 fw-bold text-secondary shadow-sm px-4">
                    <ChevronLeft size={18} /> My Roster
                </button>
                <div className="d-flex gap-2">
                    <button onClick={() => navigate(`/doctor/chat?patientId=${patientId}`)} className="btn btn-white rounded-circle shadow-sm p-3 border">
                        <MessageSquare size={20} className="text-primary" />
                    </button>
                    <button onClick={() => setShowRemarkModal(true)} className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                        <Edit3 size={18} /> Edit Remarks
                    </button>
                    <button onClick={() => navigate(`/doctor/write-prescription?patientId=${patientId}`)} className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                        Issue Prescription
                    </button>
                </div>
            </div>

            {/* IDENTITY BANNER CARD */}
            <div className="profile-card-top mb-5">
                <div className="row align-items-center g-5">
                    <div className="col-12 col-md-auto d-flex flex-column align-items-center">
                        <div className="position-relative">
                            {identity.profile_image && !imageError ? (
                                <img src={toAssetUrl(identity.profile_image)} alt={identity.full_name} className="patient-avatar-large shadow-lg" onError={() => setImageError(true)} />
                            ) : (
                                <div className="patient-avatar-large d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary display-4 fw-bold shadow-sm">
                                    {identity.full_name ? identity.full_name.charAt(0) : 'P'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-12 col-md">
                        <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-3">
                            <h1 className="h2 fw-black text-dark mb-0 m-0" style={{ letterSpacing: '-0.03em' }}>{identity.full_name}</h1>
                            <div className="d-flex gap-2">
                                <span className="signature-pill d-flex align-items-center gap-1">
                                    <Hash size={12} /> PID-{identity.id}
                                </span>
                            </div>
                        </div>

                        <div className="d-flex flex-wrap gap-4 text-secondary mb-4 fw-bold" style={{ fontSize: '0.85rem' }}>
                            <div className="d-flex align-items-center gap-2"><User size={16} /> {identity.gender}</div>
                            <div className="d-flex align-items-center gap-2"><MapPin size={16} /> {identity.phone}</div>
                            <div className="d-flex align-items-center gap-2"><Calendar size={16} /> {identity.dob} ({age} years)</div>
                            <div className="d-flex align-items-center gap-2"><Mail size={16} /> {identity.email}</div>
                        </div>

                        <div className="vitals-grid">
                            <div className="vital-item">
                                <div className="vital-label">Body Mass Index</div>
                                <div className="vital-value text-primary">{bmi} <span className="vital-unit">BMI</span></div>
                            </div>
                            <div className="vital-item">
                                <div className="vital-label">Weight Balance</div>
                                <div className="vital-value">{identity.weight || 'N/A'} <span className="vital-unit">kg</span></div>
                            </div>
                            <div className="vital-item">
                                <div className="vital-label">Body Height</div>
                                <div className="vital-value">{identity.height || 'N/A'} <span className="vital-unit">cm</span></div>
                            </div>
                            <div className="vital-item">
                                <div className="vital-label">Blood Type</div>
                                <div className="vital-value">{identity.blood_group} <Droplet size={18} className="text-danger ms-1" /></div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-xl-3">
                        <div className="p-4 rounded-4 bg-light border border-light h-100">
                            <div className="mb-4">
                                <div className="text-secondary small fw-bold text-uppercase mb-2" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Clinical Severity</div>
                                <div className="d-flex flex-wrap gap-2">
                                    {conditions && conditions.length > 0 ? conditions.map((c, i) => (
                                        <span key={i} className="badge-condition">{c.condition_name}</span>
                                    )) : <span className="badge bg-light text-secondary border fw-bold px-3 py-2 rounded-3">No Chronic Conditions</span>}
                                </div>
                            </div>
                            <div>
                                <div className="text-secondary small fw-bold text-uppercase mb-2" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Potential Barriers</div>
                                <div className="d-flex flex-wrap gap-2">
                                    {allergies && allergies.length > 0 ? allergies.map((a, i) => (
                                        <span key={i} className="badge-barrier">{a.allergy_name}</span>
                                    )) : <span className="badge bg-light text-secondary border fw-bold px-3 py-2 rounded-3">No Known Allergies</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-5">
                {/* LEFT: Clinical Timeline */}
                <div className="col-12 col-xl-4">
                    <div className="section-title">
                        <Clock className="text-primary" /> Encounters History
                        <button onClick={() => navigate(`/doctor/patient-timeline?patientId=${patientId}`)} className="btn btn-sm text-primary ms-auto fw-bold">View List</button>
                    </div>
                    <div className="timeline-vertical">
                        {timeline && timeline.length > 0 ? timeline.slice(0, 5).map((appt, i) => (
                            <div key={i} className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="timeline-date">{new Date(appt.appointment_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                                <div className="timeline-content">
                                    <div className="fw-bold text-dark mb-1">{appt.reason || 'Clinical Consultation'}</div>
                                    <div className="text-secondary small d-flex align-items-center gap-1">
                                        {appt.status === 'completed' ? <Check size={12} className="text-success" /> : <Clock size={12} />}
                                        {appt.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-5 text-muted fw-bold">No recorded encounters.</div>
                        )}
                        {timeline && timeline.length > 5 && (
                            <div className="text-center mt-3">
                                <button onClick={() => navigate(`/doctor/patient-timeline?patientId=${patientId}`)} className="btn btn-link text-primary fw-bold text-decoration-none">Show all history <ArrowRight size={14} /></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* CENTER: Structured History */}
                <div className="col-12 col-xl-5">
                    <div className="section-title">
                        <Activity className="text-primary" /> Medical Background
                    </div>
                    
                    <div className="clinical-history-card">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="mb-4">
                                    <div className="text-secondary small fw-bold text-uppercase mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.6rem' }}>
                                        <div className="bg-primary bg-opacity-10 p-1 rounded"><Activity size={12} /></div> Chronic Disease
                                    </div>
                                    <div className="fw-bold text-dark">{identity.chronic_conditions_text || 'None Reported'}</div>
                                </div>
                                <div>
                                    <div className="text-secondary small fw-bold text-uppercase mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.6rem' }}>
                                        <div className="bg-warning bg-opacity-10 p-1 rounded"><ShieldAlert size={12} /></div> Surgery History
                                    </div>
                                    <div className="fw-bold text-dark">{identity.allergies_text || 'None Reported'}</div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-4">
                                    <div className="text-secondary small fw-bold text-uppercase mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.6rem' }}>
                                        <div className="bg-danger bg-opacity-10 p-1 rounded"><Heart size={12} /></div> Emergency Alerts
                                    </div>
                                    <div className="fw-bold text-dark">Diabetes Emergencies</div>
                                </div>
                                <div>
                                    <div className="text-secondary small fw-bold text-uppercase mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.6rem' }}>
                                        <div className="bg-info bg-opacity-10 p-1 rounded"><User size={12} /></div> Hereditary History
                                    </div>
                                    <div className="fw-bold text-dark">Obesity (Father)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-title">
                        <Droplet className="text-primary" /> Active Medications
                    </div>
                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                        <table className="table medication-table mb-0">
                            <thead>
                                <tr>
                                    <th>Drug Name</th>
                                    <th>Status</th>
                                    <th>Assign By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medications && medications.length > 0 ? medications.map((med, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div className="fw-bold text-dark">{med.drug_name}</div>
                                            <div className="text-secondary small">{med.dosage}</div>
                                        </td>
                                        <td><span className="badge bg-success bg-opacity-10 text-success fw-bold p-2 px-3 rounded-pill">Active</span></td>
                                        <td><span className="signature-pill">Clinic</span></td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4 text-muted fw-bold">No active medications.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT: Lifestyle & Notes */}
                <div className="col-12 col-xl-3">
                    <div className="section-title">
                        <Utensils className="text-primary" /> Lifestyle & Diet
                        <button className="btn btn-sm btn-white border shadow-sm rounded-circle p-2 ms-auto"><Info size={14} /></button>
                    </div>
                    
                    <div className="diet-item">
                        <div className="diet-icon"><Droplet size={18} className="text-primary" /></div>
                        <div className="diet-text">Hydration Level</div>
                        <div className="diet-meta fw-bold">Normal</div>
                    </div>
                    <div className="diet-item">
                        <div className="diet-icon"><Moon size={18} className="text-indigo" /></div>
                        <div className="diet-text">Sleep Pattern</div>
                        <div className="diet-meta fw-bold">8 Hours</div>
                    </div>
                    <div className="diet-item">
                        <div className="diet-icon"><Scale size={18} className="text-success" /></div>
                        <div className="diet-text">Activity Level</div>
                        <div className="diet-meta fw-bold">Moderate</div>
                    </div>

                    <div className="mt-5 section-title">
                        <StickyNote className="text-primary" /> Internal Observation
                    </div>
                    <div className="p-4 rounded-4 bg-white shadow-sm border border-light position-relative">
                        <div className="text-secondary small fw-medium message-reveal">
                            {dossier.remarks && dossier.remarks.length > 0 ? dossier.remarks[0].content : "No internal clinical observations recorded yet. Click 'Edit Remarks' to add information."}
                        </div>
                    </div>

                    <div className="mt-5 d-flex flex-column gap-3">
                        <button onClick={() => navigate(`/doctor/assessment-reports?patientId=${patientId}`)} className="btn btn-white border shadow-sm w-100 p-3 rounded-4 fw-bold text-dark d-flex align-items-center justify-content-between">
                            Assessment Archives <ChevronLeft size={18} className="rotate-180" />
                        </button>
                        <button onClick={() => navigate(`/doctor/performance-analytics?patientId=${patientId}`)} className="btn btn-white border shadow-sm w-100 p-3 rounded-4 fw-bold text-dark d-flex align-items-center justify-content-between">
                            Metabolic Analytics <ChevronLeft size={18} className="rotate-180" />
                        </button>
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
                                <button onClick={() => setShowRemarkModal(false)} className="btn-close shadow-none"></button>
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
                                <button onClick={() => setShowRemarkModal(false)} className="btn btn-light rounded-pill px-4 fw-bold shadow-sm">Cancel</button>
                                <button onClick={handleSaveRemark} disabled={savingRemark || !remarkContent.trim()} className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
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
