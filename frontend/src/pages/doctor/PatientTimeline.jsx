import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
    getPatientDossier, getPatients, getPatientRecords, getClinicalRemarks, getAppointmentHistory
} from "../../api/doctor";
import { 
    Calendar, User, Mail, Phone, Clock, Bookmark, 
    ShieldAlert, ChevronLeft, Check, X, AlertCircle, 
    Activity, Heart, Thermometer, Wind, Pill, 
    FlaskConical, AlertTriangle, Fingerprint, Layers,
    ChevronDown, Plus, Download, Filter, ChevronRight, Zap
} from "lucide-react";
import '../../styles/dashboard.css';

const PatientTimelinePage = () => {
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const navigate = useNavigate();
    
    const [dossier, setDossier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [expandedCards, setExpandedCards] = useState(new Set());

    const toggleExpand = (id) => {
        setExpandedCards(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const fetchDossier = useCallback(async () => {
        try {
            setLoading(true);
            
            const [dossierData, recordsRes, remarksRes, historyRes] = await Promise.all([
                getPatientDossier(patientId).catch(() => null),
                getPatientRecords(patientId).catch(() => []),
                getClinicalRemarks(patientId).catch(() => []),
                getAppointmentHistory().catch(() => [])
            ]);

            const recordsData = Array.isArray(recordsRes) ? recordsRes : (recordsRes?.records || []);
            const remarksData = Array.isArray(remarksRes) ? remarksRes : (remarksRes?.remarks || []);
            const allHistory = Array.isArray(historyRes) ? historyRes : (historyRes?.appointments || []);
            const patientHistory = allHistory.filter(apt => String(apt.patient_id) === String(patientId));

            const existingTimelineIds = new Set();
            const mergedTimeline = [];

            // Helper to determine record type and color
            const getRecordMetadata = (reason = "", notes = "") => {
                const text = (reason + " " + notes).toLowerCase();
                if (text.includes("alert") || text.includes("urgent") || text.includes("high blood")) return { type: "Alert", color: "#ef4444", icon: <AlertTriangle size={16} /> };
                if (text.includes("med") || text.includes("pill") || text.includes("prescription")) return { type: "Medication", color: "#10b981", icon: <Pill size={16} /> };
                if (text.includes("lab") || text.includes("test") || text.includes("blood work")) return { type: "Lab", color: "#8b5cf6", icon: <FlaskConical size={16} /> };
                return { type: "Visit", color: "#3b82f6", icon: <Activity size={16} /> };
            };

            // 1. Dossier Timeline
            if (dossierData?.timeline) {
                (dossierData.timeline || []).forEach(t => {
                    if (t.id) {
                        const meta = getRecordMetadata(t.reason, t.notes);
                        mergedTimeline.push({ ...t, ...meta });
                        existingTimelineIds.add(String(t.id));
                    }
                });
            }

            // 2. Patient Records
            recordsData.forEach(record => {
                const rid = String(record.id);
                if (!existingTimelineIds.has(rid)) {
                    const meta = getRecordMetadata(record.reason || record.diagnosis, record.notes);
                    mergedTimeline.push({
                        id: record.id,
                        appointment_date: record.appointment_date || record.created_at || record.date,
                        reason: record.reason || record.diagnosis || "General Consultation",
                        status: record.status || "Completed",
                        diagnosis: record.diagnosis || record.reason || "Under Observation",
                        symptoms: record.symptoms || "Standard review",
                        notes: record.notes || record.clinical_notes || "Clinical baseline recorded.",
                        ...meta,
                        isLegacyRecord: true
                    });
                    existingTimelineIds.add(rid);
                }
            });

            // 3. Appointment History
            patientHistory.forEach(apt => {
                const aid = String(apt.id);
                if (!existingTimelineIds.has(aid)) {
                    const meta = getRecordMetadata(apt.reason, apt.notes);
                    mergedTimeline.push({
                        id: apt.id,
                        appointment_date: apt.appointment_date || apt.date,
                        reason: apt.reason || "Scheduled Appointment",
                        status: apt.status || "Matched",
                        diagnosis: "General Visit",
                        symptoms: "Check-up",
                        notes: apt.notes || "Periodic health assessment.",
                        ...meta
                    });
                    existingTimelineIds.add(aid);
                }
            });

            // 4. Clinical Remarks
            remarksData.forEach(rem => {
                const remId = `rem-${rem.id}`;
                if (!existingTimelineIds.has(remId)) {
                    const meta = getRecordMetadata("Clinical Remark", rem.content);
                    mergedTimeline.push({
                        id: remId,
                        appointment_date: rem.created_at || rem.date,
                        reason: "Clinical Remark",
                        status: "Pinned",
                        diagnosis: "Remark",
                        symptoms: "N/A",
                        notes: rem.content || rem.remark,
                        ...meta
                    });
                    existingTimelineIds.add(remId);
                }
            });

            mergedTimeline.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

            if (dossierData) {
                setDossier({ ...dossierData, timeline: mergedTimeline });
            } else {
                const roster = await getPatients().catch(() => []);
                const match = (roster || []).find(p => String(p.id) === String(patientId));
                if (match) {
                    setDossier({
                        identity: {
                            id: match.id,
                            full_name: match.full_name,
                            profile_image: match.patient_image || null,
                        },
                        timeline: mergedTimeline
                    });
                } else if (mergedTimeline.length > 0) {
                    setDossier({
                        identity: { id: patientId, full_name: "Patient Archive" },
                        timeline: mergedTimeline
                    });
                } else {
                    setError("History stream unavailable.");
                }
            }
        } catch (err) {
            setError("Connection integrity failure.");
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        if (patientId) fetchDossier();
        else setLoading(false);
    }, [patientId, fetchDossier]);

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 gap-3 premium-dashboard-bg">
            <div className="spinner-grow text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
            <p className="text-secondary fw-black text-uppercase small">Accessing Health Streams...</p>
        </div>
    );
    
    if (error || !dossier) return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center p-4 premium-dashboard-bg">
            <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}><ShieldAlert size={40} /></div>
            <h2 className="fw-black text-dark mb-2">Sync Error</h2>
            <button onClick={() => navigate(-1)} className="btn btn-dark rounded-pill px-5 shadow-sm mt-3">Go Back</button>
        </div>
    );

    const { identity, timeline } = dossier;

    const filteredTimeline = timeline.filter(event => {
        const matchesFilter = activeFilter === "All" || 
            (activeFilter === "Visits" && event.type === "Visit") ||
            (activeFilter === "Medications" && event.type === "Medication") ||
            (activeFilter === "Labs" && event.type === "Lab") ||
            (activeFilter === "Alerts" && event.type === "Alert");

        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || 
            String(event.id).toLowerCase().includes(searchLower) ||
            event.reason?.toLowerCase().includes(searchLower) ||
            event.diagnosis?.toLowerCase().includes(searchLower) ||
            event.notes?.toLowerCase().includes(searchLower) ||
            event.symptoms?.toLowerCase().includes(searchLower);

        return matchesFilter && matchesSearch;
    });

    return (
        <div className="premium-dashboard-bg min-vh-100 d-flex flex-column">
            {/* Header section */}
            <div className="bg-white border-bottom sticky-top shadow-sm" style={{ zIndex: 1020 }}>
                <div className="px-4 px-lg-5 py-3">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-3">
                            <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle p-2 border-0"><ChevronLeft size={20} /></button>
                            <h4 className="fw-black mb-0 text-dark">Medical Timeline — {identity?.full_name}</h4>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary rounded-pill px-4 fw-black shadow-sm"><Plus size={14} /> New Record</button>
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <div className="position-relative">
                                <Filter size={18} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted opacity-50" />
                                <input 
                                    type="text" 
                                    className="form-control rounded-pill ps-5 bg-light border-0 py-2 fw-bold" 
                                    placeholder="Search by Report ID, diagnosis, symptoms..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-6 d-flex gap-2 overflow-auto thin-scrollbar pb-1">
                            {["All", "Visits", "Medications", "Labs", "Alerts"].map(label => (
                                <button 
                                    key={label}
                                    onClick={() => setActiveFilter(label)}
                                    className={`btn rounded-pill px-3 py-1 fw-black small text-nowrap transition-all ${activeFilter === label ? 'btn-dark' : 'btn-white border opacity-75'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow-1 overflow-auto bg-light bg-opacity-50">
                <div className="container py-4">
                    <div className="mx-auto" style={{ maxWidth: '900px' }}>
                        {filteredTimeline.length > 0 ? (
                            <div className="position-relative ms-md-5 ps-md-4">
                                <div className="position-absolute start-0 top-0 bottom-0 border-start border-3 opacity-10 d-none d-md-block" style={{ borderColor: '#2b70ff' }}></div>

                                {filteredTimeline.map((event, index) => {
                                    const eventDate = new Date(event.appointment_date);
                                    const isExpanded = expandedCards.has(event.id);
                                    const showDateHeader = index === 0 || 
                                        new Date(filteredTimeline[index-1].appointment_date).toLocaleDateString() !== eventDate.toLocaleDateString();

                                    return (
                                        <div key={event.id} className="mb-4 position-relative">
                                            {showDateHeader && (
                                                <div className="d-md-absolute start-0 translate-middle-x ms-md-n4 mb-3 d-flex align-items-center gap-2" style={{ top: '-15px' }}>
                                                    <div className="badge bg-white text-dark border py-2 px-3 rounded-pill fw-black shadow-sm small">
                                                        {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="d-flex flex-column flex-md-row gap-3">
                                                <div className="d-none d-md-block position-absolute start-0 translate-middle-x pe-4 text-end" style={{ width: '100px', left: '-50px' }}>
                                                    <div className="text-muted fw-black small opacity-50">{eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                </div>

                                                <div className="flex-grow-1 bg-white border-0 rounded-4 shadow-sm overflow-hidden transition-all hover-reveal">
                                                    <div className="p-4">
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="rounded-4 d-flex align-items-center justify-content-center text-white p-2" style={{ backgroundColor: event.color }}>
                                                                    {event.icon}
                                                                </div>
                                                                <div>
                                                                    <div className="small fw-black text-uppercase opacity-50" style={{ letterSpacing: '1px', fontSize: '0.65rem', color: event.color }}>
                                                                        {event.type} — ID: NN-{String(event.id).substring(0,6)}
                                                                    </div>
                                                                    <h5 className="fw-black mb-0 text-dark">{event.type === 'Alert' ? 'ALERT: ' : ''}{event.diagnosis || event.reason}</h5>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex gap-1">
                                                                <button title="View Full" className="btn btn-light btn-sm rounded-circle p-2 border"><ChevronRight size={14} /></button>
                                                                <button title="Download" className="btn btn-light btn-sm rounded-circle p-2 border"><Download size={14} /></button>
                                                            </div>
                                                        </div>

                                                        <div className="row g-2 mb-3">
                                                            <div className="col-12 col-md-6">
                                                                <div className="p-3 bg-light rounded-3 h-100 border">
                                                                    <div className="text-muted small fw-black mb-1 text-uppercase" style={{fontSize: '0.6rem'}}>🩺 Diagnosis</div>
                                                                    <div className="small fw-bold text-dark">{event.diagnosis || event.reason}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-md-6">
                                                                <div className="p-3 bg-light rounded-3 h-100 border">
                                                                    <div className="text-muted small fw-black mb-1 text-uppercase" style={{fontSize: '0.6rem'}}>💬 Symptoms</div>
                                                                    <div className="small fw-bold text-dark">{event.symptoms || "Regular clinical checkup"}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-1"><User size={12} /></div>
                                                                <span className="small fw-bold text-muted">Dr. Naina</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => toggleExpand(event.id)}
                                                                className="btn btn-link text-primary p-0 small fw-black text-decoration-none d-flex align-items-center gap-1"
                                                            >
                                                                {isExpanded ? "Hide Details ▲" : "Show Details ▼"}
                                                            </button>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="mt-4 pt-4 border-top border-dashed animate-fade-in">
                                                                <div className="mb-3">
                                                                    <div className="fw-black small text-uppercase mb-2 text-muted" style={{fontSize: '0.6rem'}}>Clinical Observations</div>
                                                                    <div className="p-3 bg-light rounded-3 small fw-bold text-secondary lh-lg">{event.notes}</div>
                                                                </div>
                                                                <div className="d-flex gap-2">
                                                                    <button className="btn btn-white border btn-sm rounded-pill px-3 fw-black small">View Prescription</button>
                                                                    <button className="btn btn-white border btn-sm rounded-pill px-3 fw-black small">Lab Results</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-5 bg-white rounded-5 shadow-sm border">
                                <Activity size={48} className="text-muted opacity-25 mb-3" />
                                <h4 className="fw-black text-dark">No records found</h4>
                                <p className="text-muted fw-bold">Try adjusting your search or filter parameters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .premium-dashboard-bg { background: #f4f7fa; }
                .fw-black { font-weight: 850; }
                .hover-reveal:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.08) !important; }
                .border-dashed { border-top-style: dashed !important; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .thin-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default PatientTimelinePage;
