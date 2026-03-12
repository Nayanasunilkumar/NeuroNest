import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
    FileText, Folder, ClipboardList, User, ChevronLeft, 
    Pill, LayoutGrid, ArrowRight, Activity, Clock
} from 'lucide-react';
import { getPatientDossier } from '../../api/doctor';
import { toAssetUrl } from '../../utils/media';
import { useTheme } from "../../context/ThemeContext";

const PatientHub = () => {
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const navigate = useNavigate();
    const { isDark } = useTheme();
    
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!patientId) {
            navigate('/doctor/patients');
            return;
        }

        const fetchPatient = async () => {
            try {
                const data = await getPatientDossier(patientId);
                setPatient(data?.identity || null);
            } catch (err) {
                console.error("Failed to fetch patient info for hub", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [patientId, navigate]);

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 fs-6 fw-bold text-muted">Mounting Case File...</p>
        </div>
    );

    const HUB_CARDS = [
        {
            id: 'records',
            title: 'Patient Records',
            desc: 'Complete medical history, vitals, and chronic assessments',
            icon: <ClipboardList size={32} />,
            color: '#2b70ff',
            path: `/doctor/patient-records?patientId=${patientId}`
        },
        {
            id: 'prescription',
            title: 'Write Prescription',
            desc: 'Draft new medication plans and dosage schedules',
            icon: <Pill size={32} />,
            color: '#f43f5e',
            path: `/doctor/write-prescription?patientId=${patientId}`
        },
        {
            id: 'archives',
            title: 'Clinical Archives',
            desc: 'View past consultation notes and diagnostic files',
            icon: <Folder size={32} />,
            color: '#10b981',
            path: `/doctor/clinical-archives?patientId=${patientId}`
        }
    ];

    return (
        <div className={`p-4 p-md-5 ${isDark ? 'bg-darker' : 'bg-light'} min-vh-100`}>
            {/* Header */}
            <div className="container-fluid max-width-1200 mx-auto">
                <button 
                    onClick={() => navigate('/doctor/patients')}
                    className="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-0 mb-4 text-muted hover-primary transition-all fw-bold fs-7"
                >
                    <ChevronLeft size={16} /> Back to Roster
                </button>

                <div className="nn-card border-0 mb-5 p-4 d-flex align-items-center gap-4 bg-white shadow-sm rounded-5">
                    <div className="rounded-4 overflow-hidden shadow-sm d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: '80px', height: '80px' }}>
                        {patient?.profile_image ? (
                            <img src={toAssetUrl(patient.profile_image)} alt="" className="w-100 h-100 object-fit-cover" />
                        ) : (
                            <User size={40} />
                        )}
                    </div>
                    <div>
                        <h1 className="fw-black text-dark mb-1" style={{ fontSize: '1.8rem' }}>{patient?.full_name || "Unknown Patient"}</h1>
                        <div className="d-flex gap-3 text-muted fw-semi-bold fs-7">
                            <span className="d-flex align-items-center gap-1"><Clock size={14}/> ID: {patientId}</span>
                            <span className="d-flex align-items-center gap-1"><Activity size={14}/> {patient?.gender || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Hub Cards Grid */}
                <div className="row g-4 justify-content-center">
                    {HUB_CARDS.map(card => (
                        <div className="col-12 col-md-4" key={card.id}>
                            <div 
                                onClick={() => navigate(card.path)}
                                className="nn-card h-100 p-4 pt-5 border-0 shadow-sm rounded-5 cursor-pointer hover-lift text-center bg-white group"
                                style={{ transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)' }}
                            >
                                <div 
                                    className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                                    style={{ 
                                        width: '80px', height: '80px', 
                                        backgroundColor: `${card.color}15`, 
                                        color: card.color,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {card.icon}
                                </div>
                                <h3 className="fw-black text-dark mb-3" style={{ fontSize: '1.25rem' }}>{card.title}</h3>
                                <p className="text-secondary small fw-medium mb-4 lh-base px-2">
                                    {card.desc}
                                </p>
                                <div className="d-flex align-items-center justify-content-center gap-2 text-primary fw-bold small opacity-0 group-hover-opacity-100 transition-all">
                                    Open Module <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .bg-darker { background-color: #0f172a; }
                .hover-lift:hover {
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
                    transform: translateY(-8px);
                }
                .hover-lift:hover > div:first-child {
                    transform: scale(1.1);
                }
                .hover-primary:hover { color: var(--nn-primary) !important; }
                .cursor-pointer { cursor: pointer; }
                .group:hover .group-hover-opacity-100 { opacity: 1; }
                .max-width-1200 { max-width: 1200px; }
            `}</style>
        </div>
    );
};

export default PatientHub;
