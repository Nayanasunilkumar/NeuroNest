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
    ChevronRight, Bookmark, ShieldAlert, Edit3, Folder, StickyNote,
    Check, X, AlertCircle, FileText, Activity, MessageSquare, LayoutGrid, Bell
} from "lucide-react";
import { toAssetUrl } from "../../utils/media";
import "../../styles/doctor-records.css";

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
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Retrieving Clinical Archive...</p>
        </div>
    );

    if (error || !dossier) return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Access Restricted</h2>
            <p className="text-slate-500 max-w-md mx-auto">{error || "Patient not found in your clinical records."}</p>
            <button 
                onClick={() => navigate(-1)}
                className="mt-8 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-transform active:scale-95"
            >
                Return to Schedule
            </button>
        </div>
    );

    const { identity, timeline } = dossier;

    return (
        <div className="opd-dashboard-root">
            <div className="dossier-premium-root">
                {/* Header Section */}
                <div className="dossier-premium-header">
                    <h1 className="dossier-premium-title">Clinical Dossier</h1>
                </div>

                <div className="dossier-premium-grid">
                    {/* LEFT PANEL: Patient Summary Monolith */}
                    <div className="patient-sidebar-premium">
                        <div className="sidebar-avatar-vault">
                            <div className="avatar-halo">
                                {identity.profile_image && !imageError ? (
                                    <img 
                                        src={toAssetUrl(identity.profile_image)} 
                                        alt={identity.full_name} 
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <span className="text-3xl font-black text-blue-500">
                                        {identity.full_name.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <div className="sidebar-identity-text">
                                <h2 className="sidebar-name">{identity.full_name}</h2>
                                <span className="pid-badge">Patient ID #00{identity.id}</span>
                            </div>
                        </div>

                        <div className="sidebar-info-group">
                            <div className="info-mini-row">
                                <div className="info-icon-circle"><Mail size={16} /></div>
                                <div className="info-value-stack">
                                    <span className="info-mini-label">Email Access</span>
                                    <span className="info-mini-value truncate max-w-[150px]">{identity.email}</span>
                                </div>
                            </div>
                            <div className="info-mini-row">
                                <div className="info-icon-circle"><Phone size={16} /></div>
                                <div className="info-value-stack">
                                    <span className="info-mini-label">Clinical Contact</span>
                                    <span className="info-mini-value">{identity.phone}</span>
                                </div>
                            </div>
                            <div className="info-mini-row">
                                <div className="info-icon-circle"><Calendar size={16} /></div>
                                <div className="info-value-stack">
                                    <span className="info-mini-label">Date of Birth</span>
                                    <span className="info-mini-value">{identity.dob}</span>
                                </div>
                            </div>
                            <div className="info-mini-row">
                                <div className="info-icon-circle"><User size={16} /></div>
                                <div className="info-value-stack">
                                    <span className="info-mini-label">Clinical Profile</span>
                                    <span className="info-mini-value">{identity.gender} ({identity.blood_group})</span>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-actions-premium">
                            <button 
                                onClick={() => setShowRemarkModal(true)}
                                className="btn-premium-primary"
                            >
                                <Edit3 size={16} />
                                Add Remark
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Clinical Hub Nexus */}
                    <div className="timeline-premium-axis">
                        <div className="clinical-hub-nexus fade-in">
                            <div className="hub-grid">
                                <button onClick={() => navigate(`/doctor/patient-timeline?patientId=${patientId}`)} className="hub-card timeline">
                                    <div className="hub-card-icon"><Calendar size={24} /></div>
                                    <div className="hub-card-content">
                                        <h4>Clinical Timeline</h4>
                                        <p>{timeline.length} Recorded Encounters</p>
                                    </div>
                                    <ChevronRight size={18} className="hub-arrow" />
                                </button>

                                <button onClick={() => navigate(`/doctor/medical-records?patientId=${patientId}`)} className="hub-card medical">
                                    <div className="hub-card-icon"><FileText size={24} /></div>
                                    <div className="hub-card-content">
                                        <h4>Medical Summary</h4>
                                        <p>Allergies, Meds & Conditions</p>
                                    </div>
                                    <ChevronRight size={18} className="hub-arrow" />
                                </button>

                                <button onClick={() => navigate(`/doctor/write-prescription?patientId=${patientId}`)} className="hub-card prescription">
                                    <div className="hub-card-icon"><Edit3 size={24} /></div>
                                    <div className="hub-card-content">
                                        <h4>Write Prescription</h4>
                                        <p>Issue high-fidelity scripts</p>
                                    </div>
                                    <ChevronRight size={18} className="hub-arrow" />
                                </button>

                                <button onClick={() => navigate(`/doctor/assessment-reports?patientId=${patientId}`)} className="hub-card assessments">
                                    <div className="hub-card-icon"><ShieldAlert size={24} /></div>
                                    <div className="hub-card-content">
                                        <h4>Assessment Reports</h4>
                                        <p>Clinical evaluation results</p>
                                    </div>
                                    <ChevronRight size={18} className="hub-arrow" />
                                </button>

                                <button onClick={() => navigate(`/doctor/performance-analytics?patientId=${patientId}`)} className="hub-card analytics">
                                    <div className="hub-card-icon"><Activity size={24} /></div>
                                    <div className="hub-card-content">
                                        <h4>Performance Analytics</h4>
                                        <p>Therapeutic outcome data</p>
                                    </div>
                                    <ChevronRight size={18} className="hub-arrow" />
                                </button>

                                <button onClick={() => navigate(`/doctor/chat?patientId=${patientId}`)} className="hub-card chat">
                                    <div className="hub-card-icon"><MessageSquare size={24} /></div>
                                    <div className="hub-card-content">
                                        <h4>Patients Chat</h4>
                                        <p>Clinical consultation threads</p>
                                    </div>
                                    <ChevronRight size={18} className="hub-arrow" />
                                </button>

                                <button onClick={() => navigate(`/doctor/clinical-archives?patientId=${patientId}`)} className="hub-card archives">
                                    <div className="hub-card-icon"><Folder size={24} /></div>
                                    <div className="hub-card-content">
                                        <h4>Clinical Archives</h4>
                                        <p>Remark logs & longitudinal history</p>
                                    </div>
                                    <ChevronRight size={18} className="hub-arrow" />
                                </button>

                                <button onClick={() => navigate(`/doctor/alerts?patientId=${patientId}`)} className="hub-card alerts">
                                    <div className="hub-card-icon"><Bell size={24} /></div>
                                    <div className="hub-card-content">
                                        <h4>Alerts</h4>
                                        <p>Clinical triggers & notifications</p>
                                    </div>
                                    <ChevronRight size={18} className="hub-arrow" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clinical Remark Modal */}
            {showRemarkModal && (
                <div className="modal-premium-overlay" onClick={() => setShowRemarkModal(false)}>
                    <div className="modal-premium-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <div>
                                <h3 className="modal-premium-title">Clinical Remarks</h3>
                                <p className="text-slate-400 text-sm font-medium mt-1">Internal observations for {identity.full_name}</p>
                            </div>
                            <button 
                                onClick={() => setShowRemarkModal(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="modal-divider" />

                        <div className="mb-6">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Observations & Notes</label>
                            <textarea 
                                value={remarkContent}
                                onChange={(e) => setRemarkContent(e.target.value)}
                                className="modal-premium-textarea"
                                placeholder="Enter clinical observations, behavioral notes, or treatment compliance remarks..."
                                autoFocus
                            ></textarea>
                            <div className="modal-helper-text">
                                <Info size={14} className="text-blue-500" />
                                <span>These remarks are internal and not visible to patients.</span>
                            </div>
                        </div>

                        <div className="modal-premium-footer">
                            <button 
                                onClick={() => setShowRemarkModal(false)}
                                className="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveRemark}
                                disabled={savingRemark || !remarkContent.trim()}
                                className="btn-premium-primary px-10 py-3 rounded-xl"
                            >
                                {savingRemark ? "SAVING..." : "SAVE REMARK"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientRecords;
