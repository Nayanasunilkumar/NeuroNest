import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPatientDossier, saveClinicalRemark, getClinicalRemarks } from "../../api/doctor";
import { 
    Calendar, User, Clock, Mail, Phone, Info, 
    ChevronRight, Bookmark, ShieldAlert, Edit3, Folder, StickyNote
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
    
    // View Remarks List State
    const [showRemarksListModal, setShowRemarksListModal] = useState(false);
    const [remarksList, setRemarksList] = useState([]);
    const [loadingRemarks, setLoadingRemarks] = useState(false);

    const fetchDossier = useCallback(async () => {
        try {
            setLoading(true);
            setImageError(false); // Reset image error when fetching new dossier
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

    const handleViewRemarks = async () => {
        try {
            setLoadingRemarks(true);
            setShowRemarksListModal(true);
            const data = await getClinicalRemarks(patientId);
            setRemarksList(data);
        } catch (err) {
            console.error("Failed to fetch remarks:", err);
        } finally {
            setLoadingRemarks(false);
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
                    <p className="dossier-premium-subtitle">Comprehensive medical archive and longitudinal engagement timeline.</p>
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
                                    <span className="text-4xl font-black text-blue-500">
                                        {identity.full_name.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <h2 className="sidebar-name">{identity.full_name}</h2>
                            <span className="pid-badge">Patient ID #00{identity.id}</span>
                        </div>

                        <div className="sidebar-info-group">
                            <div className="info-mini-row">
                                <div className="info-icon-circle"><Mail size={16} /></div>
                                <div className="info-value-stack">
                                    <span className="info-mini-label">Email Access</span>
                                    <span className="info-mini-value">{identity.email}</span>
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
                            <button 
                                onClick={handleViewRemarks}
                                className="btn-premium-secondary"
                            >
                                <Folder size={16} />
                                View All Notes
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Clinical Axis Timeline */}
                    <div className="timeline-premium-axis">
                        <div className="timeline-vertical-line" />
                        
                        <div className="timeline-section-header">
                            <div className="timeline-header-content">
                                <h3 className="timeline-main-title">Timeline Record</h3>
                                <div className="timeline-counter-badge">
                                    <span className="counter-label">Encounters:</span>
                                    <span className="counter-value">{timeline.length}</span>
                                </div>
                            </div>
                        </div>

                        {timeline.length === 0 ? (
                            <div className="encounter-item-premium">
                                <div className="encounter-card-premium text-center py-20 bg-slate-50/50">
                                    <Bookmark size={48} className="text-slate-200 mx-auto mb-4" />
                                    <h4 className="text-slate-800 dark:text-slate-200 font-bold">Timeline Empty</h4>
                                    <p className="text-slate-400 text-xs text-center">No clinical sessions recorded for this dossier.</p>
                                </div>
                            </div>
                        ) : (
                            timeline.map((event) => (
                                <div key={event.id} className="encounter-item-premium">
                                    <div className="encounter-dot" />
                                    <div className="encounter-card-premium">
                                        <div className="encounter-meta-top">
                                            <span className={`status-badge-premium status-${event.status.toLowerCase().replace('-', '')}`}>
                                                {event.status}
                                            </span>
                                            <div className="encounter-time-stamp">
                                                <Clock size={14} />
                                                {new Date(event.appointment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {event.appointment_time.substring(0, 5)}
                                            </div>
                                        </div>
                                        <h4 className="encounter-reason-title">
                                            {event.reason || "Routine Clinical Assessment"}
                                        </h4>
                                        <div className="encounter-notes-box">
                                            {event.notes || "No additional clinical notes recorded for this medical encounter."}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Clinical Remark Modal Overhaul */}
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
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                            >
                                <ChevronRight size={20} className="rotate-90" />
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
            {/* Clinical Remarks History Modal */}
            {showRemarksListModal && (
                <div className="modal-premium-overlay" onClick={() => setShowRemarksListModal(false)}>
                    <div className="modal-premium-card max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <div>
                                <h3 className="modal-premium-title">Internal Observations Log</h3>
                                <p className="text-slate-400 text-sm font-medium mt-1">Longitudinal history for {identity.full_name}</p>
                            </div>
                            <button 
                                onClick={() => setShowRemarksListModal(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                            >
                                <ChevronRight size={20} className="rotate-90" />
                            </button>
                        </div>
                        
                        <div className="modal-divider" />

                        <div className="remarks-archive-vault max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {loadingRemarks ? (
                                <div className="py-20 text-center">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decrypting Archives...</p>
                                </div>
                            ) : remarksList.length === 0 ? (
                                <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl">
                                    <StickyNote size={40} className="text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 text-xs font-medium">No archived observations found for this dossier.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {remarksList.map((remark) => (
                                        <div key={remark.id} className="remark-archive-card p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-blue-500" />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        {new Date(remark.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Ref #REM-00{remark.id}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {remark.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-premium-footer">
                            <button 
                                onClick={() => setShowRemarksListModal(false)}
                                className="px-10 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                            >
                                Close Archives
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientRecords;
