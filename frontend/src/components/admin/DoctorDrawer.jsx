import React, { useState, useEffect } from 'react';
import { 
    X, ShieldCheck, Mail, MapPin, 
    Calendar, User, CreditCard, Activity, Clock,
    AlertTriangle, CheckCircle, ExternalLink, ShieldAlert, RefreshCw, Download
} from 'lucide-react';
import { fetchDoctorDetail } from '../../services/adminDoctorAPI';

const DoctorDrawer = ({ doctorId, isOpen, onClose }) => {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && doctorId) {
            loadDoctorDetail();
        }
    }, [isOpen, doctorId]);

    const loadDoctorDetail = async () => {
        setLoading(true);
        try {
            const data = await fetchDoctorDetail(doctorId);
            setDoctor(data);
        } catch (err) {
            console.error('Failed to load specialist intelligence', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const printWindow = window.open('', '_blank');
        const certificateHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Clinical Compliance Certificate - ${doctor.full_name}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                    .cert-container { border: 10px solid #f8fafc; padding: 40px; max-width: 800px; margin: auto; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                    .header { text-align: center; border-bottom: 2px solid #0d6efd; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #0d6efd; text-transform: uppercase; letter-spacing: 2px; }
                    .identity-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                    .data-point { border-bottom: 1px solid #f1f5f9; padding: 10px 0; }
                    .label { color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
                    .value { font-size: 14px; font-weight: bold; }
                    .audit-section h2 { font-size: 16px; border-left: 4px solid #0d6efd; padding-left: 10px; margin-bottom: 15px; }
                    .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #94a3b8; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="cert-container">
                    <div class="header">
                        <h1>NEURONEST CLINICAL GOVERNANCE</h1>
                        <p>OFFICIAL COMPLIANCE CERTIFICATE</p>
                    </div>
                    
                    <div class="identity-section">
                        <div class="data-point"><div class="label">Full Clinical Name</div><div class="value">${doctor.full_name}</div></div>
                        <div class="data-point"><div class="label">Medical License Number</div><div class="value">${doctor.license_number}</div></div>
                        <div class="data-point"><div class="label">Specialization</div><div class="value">${doctor.specialization}</div></div>
                        <div class="data-point"><div class="label">Credential Status</div><div class="value">${doctor.is_verified ? 'AUTHORIZED & VERIFIED' : 'PENDING REVIEW'}</div></div>
                    </div>

                    <div class="audit-section">
                        <h2>GOVERNANCE AUDIT SUMMARY</h2>
                        ${doctor.audit_logs?.map(log => `<div style="font-size:12px; margin-bottom:5px;">• ${log.description}</div>`).join('') || '<p>No governance actions recorded.</p>'}
                    </div>

                    <div class="footer">
                        <p>Electronically generated on: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;" class="no-print">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #0d6efd; color: white; border: none; border-radius: 5px; cursor: pointer;">Print to PDF</button>
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(certificateHTML);
        printWindow.document.close();
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed-top w-100 h-100 bg-dark bg-opacity-50 blur-bg ${isOpen ? 'd-block' : 'd-none'}`} 
            style={{ zIndex: 3000, backdropFilter: 'blur(4px)', transition: 'all 0.3s ease' }}
            onClick={onClose}
        >
            <div 
                className={`position-fixed top-0 end-0 h-100 bg-white shadow-lg d-flex flex-column ${isOpen ? 'translate-middle-x' : ''}`} 
                style={{ width: 'min(100%, 480px)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-bottom bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-black h4 mb-0" style={{ width: '56px', height: '56px' }}>
                                {doctor?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                            </div>
                            <div>
                                <h3 className="h5 fw-black mb-1">{doctor?.full_name || 'Specialist Identity'}</h3>
                                <p className="small text-secondary fw-bold mb-0">ID: #{doctor?.id} • {doctor?.specialization}</p>
                            </div>
                        </div>
                        <button className="btn btn-light rounded-circle p-2" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="d-flex gap-2">
                        <span className={`badge rounded-pill px-3 py-2 border d-flex align-items-center gap-2 ${doctor?.is_verified ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-warning bg-opacity-10 text-warning border-warning'}`}>
                            {doctor?.is_verified ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                            {doctor?.is_verified ? 'VERIFIED' : 'PENDING'}
                        </span>
                        <span className={`badge rounded-pill px-3 py-2 border d-flex align-items-center gap-2 ${doctor?.account_status === 'active' ? 'bg-info bg-opacity-10 text-info border-info' : 'bg-danger bg-opacity-10 text-danger border-danger'}`}>
                            <Activity size={14} />
                            {doctor?.account_status?.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-grow-1 overflow-auto p-4 py-3 custom-scrollbar">
                    {loading ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 opacity-50">
                            <RefreshCw size={40} className="animate-spin mb-3 text-primary" />
                            <p className="fw-black small text-uppercase letter-spacing-1">Synchronizing Intelligence...</p>
                        </div>
                    ) : doctor ? (
                        <div className="d-flex flex-column gap-5">
                            <section>
                                <div className="d-flex align-items-center gap-2 mb-3 text-secondary">
                                    <User size={14} className="opacity-50" />
                                    <span className="small fw-black text-uppercase letter-spacing-1">Clinical Profile</span>
                                </div>
                                <div className="card border-0 bg-light rounded-4 p-4">
                                    <div className="row g-4">
                                        {[
                                            { label: 'Licensed Identifier', value: doctor.license_number, mono: true },
                                            { label: 'Institutional Email', value: doctor.email },
                                            { label: 'Regional Sector', value: doctor.sector || 'N/A' },
                                            { label: 'Session Fee', value: `₹${doctor.consultation_fee}` }
                                        ].map((item, i) => (
                                            <div key={i} className="col-6">
                                                <div className="small fw-bold text-secondary mb-1" style={{ fontSize: '0.65rem' }}>{item.label}</div>
                                                <div className={`fw-bold text-dark ${item.mono ? 'font-monospace' : ''}`} style={{ fontSize: '0.85rem' }}>{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-3 border-top border-secondary border-opacity-10">
                                        <div className="small fw-bold text-secondary mb-2" style={{ fontSize: '0.65rem' }}>Specialist Biography</div>
                                        <p className="small text-dark mb-0 lh-base opacity-75">{doctor.bio || 'Record contains no clinical biography for this provider.'}</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="d-flex align-items-center gap-2 mb-3 text-secondary">
                                    <Clock size={14} className="opacity-50" />
                                    <span className="small fw-black text-uppercase letter-spacing-1">Governance Audit Log</span>
                                </div>
                                <div className="d-flex flex-column gap-3">
                                    {doctor.audit_logs?.length > 0 ? doctor.audit_logs.map(log => (
                                        <div key={log.id} className="d-flex gap-3 position-relative">
                                            <div className="bg-primary rounded-circle mt-1 shadow-sm" style={{ width: '8px', height: '8px', zIndex: 1 }} />
                                            <div className="pb-2 border-start border-light ps-3 ms-n3 position-relative">
                                                <div className="small fw-black text-uppercase text-primary mb-1" style={{ fontSize: '0.6rem' }}>{log.action.replace(/_/g, ' ')}</div>
                                                <div className="small text-dark opacity-75">{log.description}</div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-4 rounded-4 border border-dashed text-secondary small fw-bold">
                                            No recent governance actions recorded.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-top bg-light">
                    <div className="d-flex flex-column gap-2">
                        <button 
                            className="btn btn-primary w-100 fw-black py-2 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2 border-0"
                            style={{ background: 'linear-gradient(135deg, #0d6efd, #6610f2)' }}
                            onClick={handleExport}
                        >
                            <Download size={18} /> Export Compliance Cert
                        </button>
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-outline-secondary flex-grow-1 rounded-pill fw-bold small py-2 d-flex align-items-center justify-content-center gap-2"
                                onClick={() => window.open(`mailto:${doctor?.email}?subject=NeuroNest Portal - Administrative Notice`, '_self')}
                            >
                                <Mail size={16} /> Contact
                            </button>
                            <button className="btn btn-light flex-grow-1 rounded-pill fw-bold small py-2" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .fw-black { font-weight: 950; }
                .letter-spacing-1 { letter-spacing: 1px; }
                .animate-spin { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default DoctorDrawer;
