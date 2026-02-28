import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
    getPatientDossier, 
    getClinicalRemarks
} from "../../api/doctor";
import { 
    Calendar, ChevronLeft, StickyNote, FileText, Clock
} from "lucide-react";
import "../../styles/doctor-records.css";

const ClinicalArchivesPage = () => {
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const navigate = useNavigate();
    
    const [dossier, setDossier] = useState(null);
    const [remarksList, setRemarksList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDossier = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getPatientDossier(patientId);
            setDossier(data);
            const remarksData = await getClinicalRemarks(patientId);
            setRemarksList(remarksData);
            setError(null);
        } catch (err) {
            console.error("Error fetching dossier:", err);
            setError("Unable to load clinical archive.");
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

    const handleBack = () => {
        if (patientId) {
            navigate(`/doctor/patient-records?patientId=${patientId}`);
        } else {
            navigate(-1);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px', color: '#64748B' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTop: '4px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Decrypting Clinical Stream…</span>
        </div>
    );
    
    if (error || !dossier) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: '#EF4444', fontWeight: 800 }}>Access Restricted</h2>
            <p style={{ color: '#64748B' }}>{error}</p>
            <button 
                onClick={() => navigate(-1)} 
                style={{ padding: '10px 24px', background: '#0F172A', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
                Return
            </button>
        </div>
    );

    const { identity } = dossier;

    return (
        <div className="opd-dashboard-root">
            <div className="dossier-premium-root">

                {/* Header */}
                <div className="dossier-premium-header">
                    <div className="header-nexus-left">
                        <button onClick={handleBack} className="btn-back-circle">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="header-title-stack">
                            <span className="header-breadcrumb-mini">Clinical Dossier / Archives</span>
                            <h1 className="dossier-premium-title">Clinical Archives</h1>
                        </div>
                    </div>
                    <div className="header-nexus-right">
                        <div className="patient-identity-capsule">
                            <div className="capsule-avatar-mini">
                                {identity.full_name ? identity.full_name.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <div className="capsule-text">
                                <span className="capsule-name">{identity.full_name}</span>
                                <span className="capsule-id">#PID-{identity.id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="dossier-premium-grid-single">
                    <div className="timeline-premium-axis custom-scrollbar">
                        <div style={{ padding: '24px' }}>

                            {/* Count Bar */}
                            {remarksList.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', borderRadius: '999px', padding: '6px 14px', border: '1px solid #DBEAFE' }}>
                                        <FileText size={14} style={{ color: '#2563EB' }} />
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>
                                            {remarksList.length} Clinical {remarksList.length === 1 ? 'Remark' : 'Remarks'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {remarksList.length === 0 ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '80px 40px',
                                    background: '#F8FAFC',
                                    borderRadius: '24px',
                                    border: '1px dashed #E2E8F0',
                                    gap: '16px',
                                    color: '#94A3B8'
                                }}>
                                    <div style={{ width: 72, height: 72, borderRadius: '20px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <StickyNote size={36} style={{ opacity: 0.4 }} />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h4 style={{ margin: '0 0 6px', fontWeight: 800, color: '#1E293B', fontSize: '1.1rem' }}>Archives Empty</h4>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>No internalized clinical remarks have been recorded for this patient.</p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {remarksList.map((remark, idx) => (
                                        <div 
                                            key={remark.id} 
                                            className="fade-in"
                                            style={{
                                                background: '#FFFFFF',
                                                borderRadius: '20px',
                                                border: '1px solid #E2E8F0',
                                                padding: '24px 28px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                transition: 'box-shadow 0.2s, transform 0.2s',
                                                borderLeft: '4px solid #2563EB',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            {/* Card Header */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                                                        <StickyNote size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                            Clinical Remark
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontSize: '13px', fontWeight: 700 }}>
                                                            <Calendar size={12} />
                                                            {new Date(remark.created_at).toLocaleDateString('en-US', { 
                                                                month: 'long', day: 'numeric', year: 'numeric' 
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ 
                                                        fontSize: '11px', 
                                                        fontWeight: 700, 
                                                        color: '#94A3B8',
                                                        background: '#F8FAFC',
                                                        border: '1px solid #E2E8F0',
                                                        borderRadius: '8px',
                                                        padding: '4px 10px',
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        Ref #{String(remark.id).padStart(4, '0')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Remark Content */}
                                            <div style={{
                                                background: '#F8FAFC',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                color: '#374151',
                                                fontSize: '15px',
                                                lineHeight: '1.7',
                                                fontWeight: 500,
                                                letterSpacing: '0.01em',
                                            }}>
                                                {remark.content}
                                            </div>

                                            {/* Footer */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: '#94A3B8', fontSize: '12px', fontWeight: 600 }}>
                                                <Clock size={12} />
                                                {new Date(remark.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                <span style={{ margin: '0 4px' }}>·</span>
                                                Recorded by Dr. {identity.full_name ? identity.full_name.split(' ')[0] : 'Physician'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicalArchivesPage;
