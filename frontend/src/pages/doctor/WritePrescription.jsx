import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import prescriptionService from '../../services/prescriptionService';
import { getConversations } from '../../api/chat';
import MedicineRow from '../../components/prescription/MedicineRow';
import PrescriptionList from '../../components/prescription/PrescriptionList';
import Avatar from '../../components/shared/Avatar';
import { Plus, Save, FileText, Calendar, AlertCircle, User, Clock, ShieldAlert, Activity, ChevronDown, CheckCircle, X } from 'lucide-react';
import '../../styles/doctor.css';
import '../../styles/doctor-prescription-pro.css';

const WritePrescription = () => {
    const [searchParams] = useSearchParams();
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
        <div className="write-prescription-page" style={{ 
            display: 'flex', 
            height: 'calc(100vh - 80px)', 
            padding: '24px', 
            gap: '32px', 
            overflow: 'hidden',
            background: 'var(--doc-bg)'
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
                {/* 1. Header Area */}
                <div style={{ 
                    padding: '24px 32px', 
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#FFFFFF',
                    zIndex: 20
                }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#1E293B' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#F1F5F9', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={20} />
                        </div>
                        Write Prescription
                    </h2>

                    <div style={{ position: 'relative', width: '280px' }}>
                        <select 
                            className="pro-input" 
                            style={{ height: '44px', paddingRight: '40px', fontWeight: 600, background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                            value={selectedPatient?.id || ''}
                            onChange={(e) => {
                                const p = patients.find(pat => pat.id === parseInt(e.target.value));
                                setSelectedPatient(p);
                            }}
                        >
                            <option value="">Select Patient...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.full_name || p.name} (ID: {p.id})
                                </option>
                            ))}
                        </select>
                        <User size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                    </div>
                </div>

                {/* 2. Scrollable Content Area */}
                <div className="scroll-content" style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 100px 32px' }}>
                    
                    {selectedPatient && activeProfile && (
                        <div className="patient-context-card fade-in" style={{ marginBottom: '32px' }}>
                            <div className="patient-info-grid">
                                <Avatar src={activeProfile.profile_image} alt={activeProfile.full_name} style={{ width: 80, height: 80, borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', letterSpacing: '-0.02em' }}>
                                        {activeProfile.full_name} 
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '8px 24px', fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>
                                        <span>Title: {activeProfile.gender || 'Unknown'}, {getAge(activeProfile.dob)} yrs</span>
                                        <span>Patient ID: #{activeProfile.id}</span>
                                        <span>Last Visit: {patientDossier?.timeline?.[0]?.appointment_date || 'New Patient'}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                                    {activeProfile.allergies && activeProfile.allergies !== 'None' && (
                                        <div className="badge-allergy">
                                            <ShieldAlert size={16} /> Allergy: {activeProfile.allergies}
                                        </div>
                                    )}
                                    {activeProfile.chronic_conditions && activeProfile.chronic_conditions !== 'None' && (
                                        <div className="badge-chronic">
                                            <Activity size={16} /> Chronic: {activeProfile.chronic_conditions}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedPatient ? (
                        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '24px', alignItems: 'start' }}>
                                <div>
                                    <label className="pro-label">Diagnosis / Condition <span style={{color: '#EF4444'}}>*</span></label>
                                    <input 
                                        type="text" 
                                        className="pro-input-lg" 
                                        placeholder="e.g. Acute Bronchitis"
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div style={{ paddingTop: '2px' }}>
                                    <label className="pro-label" style={{ opacity: 0.7, fontWeight: 500 }}>Valid Until (Optional)</label>
                                    <input 
                                        type="date" 
                                        className="pro-input" 
                                        style={{ height: '48px', color: '#64748B', background: '#F8FAFC' }}
                                        value={validUntil}
                                        onChange={(e) => setValidUntil(e.target.value)}
                                    />
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 className="pro-section-title">Prescribed Medicines</h3>
                                    <button 
                                        type="button" 
                                        className="nexus-btn secondary" 
                                        onClick={handleAddItem} 
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '6px', 
                                            padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem',
                                            border: '1px solid #E2E8F0', background: 'transparent'
                                        }}
                                    >
                                        <Plus size={16} /> Add Drug
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

                            <div>
                                <label className="pro-label">Clinical Notes</label>
                                <textarea 
                                    className="pro-input" 
                                    rows="3"
                                    placeholder="Add notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    style={{ height: 'auto', padding: '14px', lineHeight: '1.6' }}
                                />
                            </div>

                        </form>
                    ) : (
                        <div className="empty-state-card" style={{ marginTop: '60px' }}>
                            <div style={{ width: 80, height: 80, background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#94A3B8' }}>
                                <User size={40} />
                            </div>
                            <h3 style={{ color: '#1E293B', fontWeight: 700 }}>No Patient Selected</h3>
                            <p style={{ color: '#64748B' }}>Please select a patient from the header to start.</p>
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
                                className="nexus-btn secondary"
                                onClick={() => initiateSubmit('Draft')}
                                disabled={loading}
                                style={{ height: '48px', padding: '0 24px', fontSize: '0.95rem', fontWeight: 600 }}
                            >
                                Save Draft
                            </button>

                            <button 
                                type="button" 
                                className="nexus-btn primary" 
                                onClick={() => initiateSubmit('Active')}
                                disabled={loading} 
                                style={{ 
                                    height: '48px', padding: '0 32px', fontSize: '1rem', fontWeight: 700,
                                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                                    border: 'none', borderRadius: '12px', color: 'white'
                                }}
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
                <div style={{ padding: '24px', borderBottom: '1px solid #F1F5F9' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1E293B' }}>History</h3>
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
