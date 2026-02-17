import React from 'react';
import ReactDOM from 'react-dom';
import { X, Printer, Activity, QrCode, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import '../../../styles/patient-prescriptions.css';

const PrescriptionModal = ({ isOpen, onClose, prescription }) => {
    if (!isOpen || !prescription) return null;
    
    // Format Helper
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', { 
            day: '2-digit', month: 'short', year: 'numeric' 
        });
    }

    // Doctor Name
    const formatDoctorName = (name) => {
        if (!name) return 'Consultant';
        const cleanName = name.replace(/^Dr\.?\s*/i, '');
        return `Dr. ${cleanName}`;
    };

    // Frequency Formatter
    const formatFreq = (str) => {
        if (!str || !str.includes('-')) return 'As directed';
        
        const parts = str.split('-').map(s => s.trim() === '1');
        const labels = ['Morning', 'Afternoon', 'Evening', 'Night'];
        const activeLabels = labels.filter((_, i) => parts[i]);
        
        // Construct standard string like 1-0-1-0
        const numericStr = parts.map(b => b ? '1' : '0').join(' - ');
        
        if (activeLabels.length === 0) return 'As needed';
        if (activeLabels.length === 4) return `${numericStr} (4 times)`;
        
        return (
            <div>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{numericStr}</span>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    ({activeLabels.join(', ')})
                </div>
            </div>
        );
    };

    // Generate Serial (Mock)
    const getSerial = () => {
        const year = new Date(prescription.created_at).getFullYear();
        const id = prescription.id.toString().padStart(5, '0');
        return `RX-${year}-${id}`;
    };

    return ReactDOM.createPortal(
        <div className="pro-modal-overlay" onClick={onClose}>
            <div className="rx-modal-container" onClick={e => e.stopPropagation()}>
                
                {/* Sticky Action Header */}
                <div className="rx-actions-header">
                    <button 
                        onClick={() => window.print()} 
                        className="btn-view-rx"
                        style={{ width: 'auto', background: '#0F172A', fontSize: '0.85rem' }}
                    >
                        <Printer size={16} /> Print / Save PDF
                    </button>
                    <button 
                        onClick={onClose}
                        className="btn-view-rx"
                        style={{ width: 'auto', background: 'white', color: '#64748B', border: '1px solid #E2E8F0' }}
                    >
                        <X size={18} /> Close
                    </button>
                </div>

                {/* The Paper */}
                <div className="rx-paper">
                    
                    {/* 1. Brand Header */}
                    <div className="rx-header-top">
                        <div className="hospital-brand">
                            <h1>
                                <Activity color="#0F172A" size={32} strokeWidth={2.5} />
                                NEURONEST CLINIC
                            </h1>
                            <p>Specialized Neurology & Critical Care Centre</p>
                        </div>
                        <div className="hospital-contact">
                            <p className="flex items-center justify-end gap-2"><MapPin size={12}/> Unit 402, Medical Plaza, Health City, NY</p>
                            <p className="flex items-center justify-end gap-2 my-1"><Phone size={12}/> +1 (555) 012-3456</p>
                            <p className="flex items-center justify-end gap-2"><Mail size={12}/> help@neuronest.com</p>
                        </div>
                    </div>

                    {/* 2. Doctor Strip */}
                    <div className="rx-doctor-strip">
                        <div>
                            <div className="doc-name">{formatDoctorName(prescription.doctor_name)}</div>
                            <div className="doc-qual">MBBS, MD (Neurology)</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">License No</div>
                            <div className="font-mono font-bold text-slate-700">MED-2024-889</div>
                        </div>
                    </div>

                    {/* 3. Patient Demographics Box */}
                    <div className="rx-patient-box">
                        <div className="pat-group">
                            <label>Patient Name</label>
                            <p>{prescription.patient_name || 'N/A'}</p>
                        </div>
                        <div className="pat-group">
                            <label>Patient ID</label>
                            <p>#{prescription.patient_id?.toString().padStart(4, '0')}</p>
                        </div>
                        <div className="pat-group">
                            <label>Date</label>
                            <p>{formatDate(prescription.created_at)}</p>
                        </div>
                        <div className="pat-group" style={{ textAlign: 'right' }}>
                            <label>Prescription Serial</label>
                            <p style={{ fontFamily: 'monospace', color: '#334155' }}>{getSerial()}</p>
                        </div>
                    </div>

                    {/* 4. Diagnosis */}
                    <div style={{ marginBottom: '32px', borderLeft: '4px solid #0F172A', paddingLeft: '16px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diagnosis</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                            {prescription.diagnosis}
                        </div>
                    </div>

                    {/* Watermark Logo */}
                    <div className="rx-watermark-logo">
                        <Activity size={300} strokeWidth={1} color="#CBD5E1" />
                    </div>

                    {/* 5. Medicines Table */}
                    <div className="rx-table-wrapper">
                        <div className="rx-symbol-large">℞</div>
                        
                        <table className="rx-meds-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '35%' }}>Medicine</th>
                                    <th style={{ width: '15%' }}>Dosage</th>
                                    <th style={{ width: '30%' }}>Frequency</th>
                                    <th style={{ width: '20%' }}>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescription.items && prescription.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="med-name-primary">{item.medicine_name}</div>
                                            {item.instructions && (
                                                <div className="med-instructions">
                                                    Note: {item.instructions}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{item.dosage}</td>
                                        <td>{formatFreq(item.frequency)}</td>
                                        <td>{item.duration}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 6. Footer Grid */}
                    <div className="rx-footer-grid">
                        
                        <div className="rx-legal-block">
                             {/* Valid Seal */}
                             <div className="rx-validity-box">
                                <ShieldCheck size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                                Valid Until: {formatDate(prescription.valid_until)}
                            </div>

                             {/* QR Code */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                                <QrCode size={56} color="#0F172A" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>VERIFY AUTHENTICITY</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748B', maxWidth: '140px' }}>
                                        Scan this code to verify this digital prescription securely.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rx-signature-area">
                            <div className="rx-stamp-seal">
                                NEURONEST<br/>CLINIC<br/>OFFICIAL
                            </div>
                            
                            <div className="rx-sign-image">Dr. {prescription.doctor_name?.split(' ').pop()}</div>
                            <div className="rx-sign-line-heavy"></div>
                            
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                                {formatDoctorName(prescription.doctor_name)}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', marginTop: '4px' }}>
                                Authorized Signature
                            </div>
                        </div>
                    </div>

                    {/* 7. Legal Footer */}
                    <div className="rx-legal-footer">
                        This prescription is electronically generated and valid without a physical signature.
                        Unauthorized modification is punishable under medical regulations. © 2026 NeuroNest Clinic.
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PrescriptionModal;
