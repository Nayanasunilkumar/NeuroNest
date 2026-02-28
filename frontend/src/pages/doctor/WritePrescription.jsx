import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import prescriptionService from '../../services/prescriptionService';
import { getConversations } from '../../api/chat';
import MedicineRow from '../../components/prescription/MedicineRow';
import PrescriptionList from '../../components/prescription/PrescriptionList';
import Avatar from '../../components/shared/Avatar';
import { Plus, Save, FileText, Calendar, AlertCircle, User, Clock, ShieldAlert, Activity, ChevronDown, ChevronLeft, CheckCircle, X } from 'lucide-react';
import '../../styles/doctor.css';
import '../../styles/doctor-prescription-pro.css';

const WritePrescription = ({ isEmbedded = false }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const patientIdParam = searchParams.get('patientId');
    
    // State
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientDossier, setPatientDossier] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState('');

    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [items, setItems] = useState([{ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

    // Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Fetch Patients
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const convs = await getConversations();
                const patientList = convs.map(c => c.other_user);
                const uniquePatients = Array.from(new Set(patientList.map(p => p.id)))
                    .map(id => patientList.find(p => p.id === id));
                
                setPatients(uniquePatients);

                if (patientIdParam) {
                    const found = uniquePatients.find(p => p.id === parseInt(patientIdParam));
                    if (found) setSelectedPatient(found);
                }
            } catch (err) {
                console.error("Error fetching patients:", err);
            }
        };
        fetchPatients();
    }, [patientIdParam]);

    // Fetch Dossier
    useEffect(() => {
        if (selectedPatient) {
            const fetchDossier = async () => {
                try {
                    const data = await prescriptionService.getPatientDossier(selectedPatient.id);
                    setPatientDossier(data);
                    setAppointments(data.timeline || []);
                    
                    const recentAppt = data.timeline?.[0];
                    if (recentAppt) setSelectedAppointment(recentAppt.id);
                } catch (e) {
                    console.error("Dossier fetch failed", e);
                    setPatientDossier(null);
                }
            };
            fetchDossier();
        } else {
            setPatientDossier(null);
            setAppointments([]);
            setSelectedAppointment('');
        }
    }, [selectedPatient]);

    const handleAddItem = () => {
        setItems([...items, { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const initiateSubmit = (status) => {
        if (!diagnosis && status === 'Active') {
            setError("Diagnosis is required.");
            return;
        }
        if (status === 'Active') {
            setShowConfirmModal(true);
        } else {
            handleSubmit(null, 'Draft');
        }
    };

    const handleSubmit = async (e, status = "Active") => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        setShowConfirmModal(false);

        const payload = {
            patient_id: selectedPatient.id,
            appointment_id: selectedAppointment || null,
            diagnosis,
            notes,
            valid_until: validUntil || null,
            status: status,
            items: items.filter(i => i.medicine_name.trim() !== '')
        };

        try {
            await prescriptionService.createPrescription(payload);
            setSuccess(true);
            setHistoryRefreshTrigger(prev => prev + 1);
            
            // Wait a moment then clear success (optional)
            setTimeout(() => setSuccess(false), 3000);

            if (status === 'Active') {
                setDiagnosis('');
                setNotes('');
                setItems([{ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
            }
        } catch (err) {
            console.error("Failed to save:", err);
            setError(err.response?.data?.message || "Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    const getAge = (dob) => {
        if (!dob || dob === 'N/A') return 'N/A';
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const activeProfile = patientDossier?.identity || selectedPatient;

    return (
        <div className="opd-dashboard-root custom-scrollbar" style={{ 
            display: 'flex', 
            flexDirection: 'row',
            padding: '0 24px 24px 24px', 
            gap: '24px', 
            height: 'calc(100vh - 120px)',
            overflow: 'hidden',
        }}>
            {/* LEFT PANEL: FORM (70%) */}
            <div className="prescription-form-panel" style={{ 
                flex: 7, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                background: '#FFFFFF',
                borderRadius: '24px',
                boxShadow: 'var(--doc-shadow-card)',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* 1. Header Area - Slim Sub-header */}
                {!isEmbedded && (
                    <div className="dossier-premium-header" style={{ 
                        padding: '10px 32px', 
                        marginBottom: 0, 
                        borderRadius: 0, 
                        border: 'none', 
                        borderBottom: '1px solid #F1F5F9',
                        minHeight: 'auto',
                        background: '#FFFFFF'
                    }}>
                        <div className="header-nexus-left">
                            <button
                                onClick={() => selectedPatient 
                                    ? navigate(`/doctor/patient-records?patientId=${selectedPatient.id}`) 
                                    : navigate(-1)
                                }
                                title="Back to Clinical Dossier"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '50%',
                                    border: '1px solid #E2E8F0',
                                    background: '#F8FAFC',
                                    color: '#64748B',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="header-title-stack">
                                <span className="header-breadcrumb-mini" style={{ fontSize: '11px' }}>WORKSPACE / CLINICAL SCRIPTING</span>
                                <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#64748B' }}>Secure Prescription Interface</h2>
                            </div>
                        </div>

                        <div className="header-nexus-right">
                            <div style={{ position: 'relative', minWidth: '240px' }}>
                                <select 
                                    className="pro-input" 
                                    style={{ 
                                        height: '36px', 
                                        paddingLeft: '16px', 
                                        paddingRight: '36px',
                                        fontSize: '13px', 
                                        fontWeight: 600, 
                                        background: '#F8FAFC', 
                                        borderRadius: '30px', 
                                        border: '1px solid #E2E8F0',
                                        appearance: 'none',
                                        cursor: 'pointer',
                                        color: '#1E293B',
                                        width: '100%',
                                    }}
                                    value={selectedPatient?.id || ''}
                                    onChange={(e) => {
                                        const p = patients.find(pat => pat.id === parseInt(e.target.value));
                                        setSelectedPatient(p);
                                    }}
                                >
                                    <option value="" disabled>— Select Patient —</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.full_name || p.name || `Patient #${p.id}`}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Scrollable Content Area */}
                <div className="scroll-content" style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 100px 32px' }}>
                    
                    {selectedPatient && activeProfile && (() => {
                        const age = getAge(activeProfile.dob);
                        const ageLabel = (!activeProfile.dob || activeProfile.dob === 'N/A' || age === 0) 
                            ? null 
                            : `${age} yrs`;
                        const lastVisitRaw = patientDossier?.timeline?.[0]?.appointment_date;
                        const lastVisit = lastVisitRaw 
                            ? new Date(lastVisitRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : null;

                        const Chip = ({ icon, label, color = '#64748B', bg = '#F1F5F9' }) => (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: bg, color, padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {icon}{label}
                            </span>
                        );

                        return (
                        <div className="patient-context-card fade-in" style={{ marginBottom: '24px', background: 'linear-gradient(105deg, #ffffff 60%, #f0f7ff)', borderLeft: '5px solid #2563EB', padding: '18px 24px' }}>
                            <div className="patient-info-grid">
                                {/* Avatar */}
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <Avatar 
                                        src={activeProfile.profile_image} 
                                        alt={activeProfile.full_name} 
                                        style={{ width: 64, height: 64, borderRadius: '18px', boxShadow: '0 6px 12px rgba(0,0,0,0.08)' }} 
                                    />
                                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, background: '#22C55E', border: '2.5px solid #fff', borderRadius: '50%' }}></div>
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                                            {activeProfile.full_name}
                                        </h3>
                                        <span className="capsule-id" style={{ fontSize: '11px' }}>#PID-{activeProfile.id}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {activeProfile.gender && (
                                            <Chip icon={<User size={11} />} label={activeProfile.gender} />
                                        )}
                                        {ageLabel && (
                                            <Chip icon={<Clock size={11} />} label={ageLabel} />
                                        )}
                                        {lastVisit && (
                                            <Chip icon={<Calendar size={11} />} label={`Last visit: ${lastVisit}`} bg="#EFF6FF" color="#2563EB" />
                                        )}
                                    </div>
                                </div>

                                {/* Alert Badges */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                                    {activeProfile.allergies && activeProfile.allergies !== 'None' && (
                                        <div className="badge-allergy" style={{ borderRadius: '10px', fontSize: '12px', padding: '5px 12px' }}>
                                            <ShieldAlert size={12} /> {activeProfile.allergies}
                                        </div>
                                    )}
                                    {activeProfile.chronic_conditions && activeProfile.chronic_conditions !== 'None' && (
                                        <div className="badge-chronic" style={{ borderRadius: '10px', fontSize: '12px', padding: '5px 12px' }}>
                                            <Activity size={12} /> {activeProfile.chronic_conditions}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        );
                    })()}

                    {selectedPatient ? (
                        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
                                <div className="input-field-premium">
                                    <label className="pro-label">Clinical Diagnosis <span style={{color: '#EF4444'}}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="text" 
                                            className="pro-input-lg" 
                                            placeholder="Enter primary condition..."
                                            value={diagnosis}
                                            onChange={(e) => setDiagnosis(e.target.value)}
                                            style={{ paddingLeft: '48px' }}
                                            autoFocus
                                        />
                                        <Activity size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    </div>
                                </div>
                                <div className="input-field-premium">
                                    <label className="pro-label">Prescription Validity</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="date" 
                                            className="pro-input-lg" 
                                            value={validUntil}
                                            onChange={(e) => setValidUntil(e.target.value)}
                                            style={{ paddingLeft: '48px', height: '56px' }}
                                        />
                                        <Calendar size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="pro-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={14} /> Link Appointment
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <select 
                                        className="pro-input" 
                                        value={selectedAppointment}
                                        onChange={(e) => setSelectedAppointment(e.target.value)}
                                        style={{ appearance: 'none' }}
                                    >
                                        <option value="">-- General Prescription --</option>
                                        {appointments.map(appt => (
                                            <option key={appt.id} value={appt.id}>
                                                {appt.appointment_date} — {appt.reason} ({appt.status})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                                </div>
                            </div>

                            <div style={{ height: '1px', background: '#F1F5F9', margin: '10px 0' }}></div>

                            <div>
                            <div style={{ padding: '32px', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0', borderStyle: 'dashed' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <div>
                                        <h3 className="pro-section-title" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ShieldAlert size={18} />
                                            </div>
                                            Medication Regimen
                                        </h3>
                                        <p style={{ margin: '4px 0 0 42px', fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>Specify drugs, dosages, and administration intervals.</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        className="upload-btn-premium" 
                                        onClick={handleAddItem} 
                                        style={{ padding: '0 20px', height: '42px', fontSize: '0.85rem', background: '#0F172A' }}
                                    >
                                        <Plus size={16} /> Add Medication
                                    </button>
                                </div>

                                <div className="medicine-list">
                                    {items.map((item, idx) => (
                                        <MedicineRow 
                                            key={idx} 
                                            index={idx} 
                                            item={item} 
                                            onChange={handleItemChange} 
                                            onRemove={handleRemoveItem} 
                                        />
                                    ))}
                                </div>
                                </div>
                            </div>

                            <div className="clinical-notes-area" style={{ marginTop: '10px' }}>
                                <label className="pro-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B' }}>
                                    <FileText size={16} /> Extended Clinical Notes
                                </label>
                                <textarea 
                                    className="pro-input" 
                                    rows="4"
                                    placeholder="Briefly document findings, patient instructions, or special observations..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    style={{ height: 'auto', padding: '20px', lineHeight: '1.6', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontStyle: notes ? 'normal' : 'italic' }}
                                />
                            </div>

                        </form>
                    ) : (
                        <div className="empty-state-card fade-in" style={{ marginTop: '100px', textAlign: 'center', padding: '40px' }}>
                            <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 32px' }}>
                                <div style={{ position: 'absolute', inset: 0, background: '#EFF6FF', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                                <div style={{ position: 'absolute', inset: 20, background: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)' }}>
                                    <User size={50} />
                                </div>
                            </div>
                            <h2 style={{ color: '#0F172A', fontWeight: 800, fontSize: '1.8rem', marginBottom: '12px' }}>Clinical Session Idle</h2>
                            <p style={{ color: '#64748B', maxWidth: '300px', margin: '0 auto', lineHeight: '1.6', fontWeight: 500 }}>Select a patient from the search nexus above to initiate a new prescription script.</p>
                        </div>
                    )}
                </div>

                {/* 3. Sticky Action Footer */}
                {selectedPatient && (
                    <div className="sticky-footer-bar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {success && (
                                <span className="fade-in" style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={18} /> Saved!
                                </span>
                            )}
                             {error && (
                                <span className="fade-in" style={{ color: '#DC2626', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={18} /> {error}
                                </span>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button 
                                type="button" 
                                className="btn-retry-prm"
                                onClick={() => initiateSubmit('Draft')}
                                disabled={loading}
                                style={{ padding: '0 24px', height: '48px', borderRadius: '14px' }}
                            >
                                Save Draft
                            </button>

                            <button 
                                type="button" 
                                className="upload-btn-premium" 
                                onClick={() => initiateSubmit('Active')}
                                disabled={loading} 
                                style={{ height: '48px', padding: '0 32px', border: 'none' }}
                            >
                                {loading ? 'Processing...' : 'Issue Prescription'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT PANEL */}
            <div className="prescription-history-panel" style={{ 
                flex: 3, 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%',
                background: '#FFFFFF',
                borderRadius: '24px',
                boxShadow: 'var(--doc-shadow-card)',
                overflow: 'hidden',
                border: '1px solid #E2E8F0'
            }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} className="text-gray-400" />
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Script History</h3>
                    </div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <PrescriptionList 
                        patientId={selectedPatient?.id} 
                        refreshTrigger={historyRefreshTrigger}
                    />
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {showConfirmModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal-content">
                        <h3 style={{ marginTop: 0, fontSize: '1.4rem', fontWeight: 700, color: '#1E293B' }}>Issue Prescription?</h3>
                        <p style={{ color: '#64748B', lineHeight: '1.6' }}>
                            This will finalize the prescription and make it visible to the patient. 
                            Are you sure the diagnosis and medicines are correct?
                        </p>
                        
                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                style={{ background: 'transparent', border: 'none', color: '#64748B', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={(e) => handleSubmit(e, 'Active')}
                                style={{ 
                                    background: '#2563EB', color: 'white', border: 'none', padding: '12px 24px', 
                                    borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                }}
                            >
                                Confirm & Issue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WritePrescription;
