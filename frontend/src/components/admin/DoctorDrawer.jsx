import React, { useState, useEffect } from 'react';
import { 
    X, ShieldCheck, Mail, MapPin, 
    Calendar, User, CreditCard, Activity, Clock,
    AlertTriangle, CheckCircle, ExternalLink, ShieldAlert, RefreshCw, Download,
    Award, HeartPulse, Stethoscope, FileText
} from 'lucide-react';
import { fetchDoctorDetail } from '../../services/adminDoctorAPI';

const DoctorDrawer = ({ doctorId, basicInfo, isOpen, onClose }) => {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && doctorId) {
            loadDoctorDetail();
        } else if (!isOpen) {
            // Optional: clear state when closed
            // setDoctor(null);
            // setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, doctorId]);

    const loadDoctorDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDoctorDetail(doctorId);
            setDoctor(data);
        } catch (err) {
            console.error('Failed to load specialist intelligence', err);
            setError('Unable to synchronize complete clinical profile. The record may be restricted or unavailable.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const targetDoc = doctor || basicInfo;
        if (!targetDoc) return;
        
        const printWindow = window.open('', '_blank');
        const certificateHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Clinical Compliance Certificate - ${targetDoc.full_name}</title>
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
                        <div class="data-point"><div class="label">Full Clinical Name</div><div class="value">${targetDoc.full_name || 'N/A'}</div></div>
                        <div class="data-point"><div class="label">Medical License Number</div><div class="value">${targetDoc.license_number || 'N/A'}</div></div>
                        <div class="data-point"><div class="label">Specialization</div><div class="value">${targetDoc.specialization || 'N/A'}</div></div>
                        <div class="data-point"><div class="label">Credential Status</div><div class="value">${targetDoc.is_verified ? 'AUTHORIZED & VERIFIED' : 'PENDING REVIEW'}</div></div>
                    </div>

                    <div class="audit-section">
                        <h2>GOVERNANCE AUDIT SUMMARY</h2>
                        ${doctor?.audit_logs?.length > 0 ? doctor.audit_logs.map(log => `<div style="font-size:12px; margin-bottom:5px;">• ${log.description}</div>`).join('') : '<p>No governance actions recorded.</p>'}
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

    const displayData = doctor || basicInfo || {};

    return (
        <div 
            className={`fixed-top w-100 h-100 bg-dark bg-opacity-50 blur-bg ${isOpen ? 'd-block' : 'd-none'}`} 
            style={{ zIndex: 3000, backdropFilter: 'blur(5px)', transition: 'all 0.3s ease' }}
            onClick={onClose}
        >
            <div 
                className={`position-fixed top-0 end-0 h-100 bg-white shadow-lg d-flex flex-column ${isOpen ? 'translate-middle-x' : ''}`} 
                style={{ width: 'min(100%, 500px)', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)', transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Premium Header */}
                <div className="p-4 border-bottom position-relative overflow-hidden" style={{ background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
                    <div className="position-absolute opacity-10 top-0 end-0 mt-n4 me-n4">
                        <Award size={180} className="text-primary" />
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-start mb-4 position-relative z-index-1">
                        <div className="d-flex align-items-center gap-3">
                            <div className="shadow-sm rounded-circle d-flex align-items-center justify-content-center fw-black h3 mb-0" 
                                style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #0d6efd, #3b82f6)', color: 'white' }}>
                                {displayData?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                            </div>
                            <div>
                                <h3 className="h4 fw-black mb-1 text-dark">{displayData?.full_name || 'Specialist Identity'}</h3>
                                <div className="d-flex align-items-center gap-2 text-secondary">
                                    <Stethoscope size={14} />
                                    <span className="fw-bold small">{displayData?.specialization || 'Clinical Provider'}</span>
                                </div>
                                <div className="small text-secondary fw-bold mt-1 opacity-75">ID: #{displayData?.id || doctorId || '---'}</div>
                            </div>
                        </div>
                        <button className="btn btn-light rounded-circle p-2 shadow-sm border" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="d-flex gap-2 position-relative z-index-1">
                        <span className={`badge rounded-pill px-3 py-2 border d-flex align-items-center gap-2 ${displayData?.is_verified ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-warning bg-opacity-10 text-warning border-warning'}`} style={{ backdropFilter: 'blur(4px)' }}>
                            {displayData?.is_verified ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                            {displayData?.is_verified ? 'VERIFIED' : 'PENDING'}
                        </span>
                        <span className={`badge rounded-pill px-3 py-2 border d-flex align-items-center gap-2 ${displayData?.account_status === 'active' ? 'bg-info bg-opacity-10 text-info border-info' : 'bg-danger bg-opacity-10 text-danger border-danger'}`} style={{ backdropFilter: 'blur(4px)' }}>
                            <Activity size={14} />
                            {displayData?.account_status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-grow-1 overflow-auto p-4 py-3 custom-scrollbar" style={{ backgroundColor: '#fcfcfd' }}>
                    {loading && !doctor ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 opacity-75">
                            <RefreshCw size={40} className="animate-spin mb-3 text-primary" />
                            <p className="fw-black small text-uppercase letter-spacing-1 text-primary">Synchronizing Intelligence...</p>
                        </div>
                    ) : error ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center px-4">
                            <div className="bg-danger bg-opacity-10 p-3 rounded-circle mb-3">
                                <AlertTriangle size={40} className="text-danger" />
                            </div>
                            <h4 className="fw-black text-dark mb-2">Access Restricted</h4>
                            <p className="text-secondary small fw-medium">{error}</p>
                            <button className="btn btn-outline-primary btn-sm rounded-pill mt-3 px-4 fw-bold" onClick={loadDoctorDetail}>
                                Retry Synchronization
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-4 pb-4">
                            <section>
                                <div className="d-flex align-items-center gap-2 mb-3 text-secondary">
                                    <FileText size={16} className="opacity-75 text-primary" />
                                    <span className="small fw-black text-uppercase letter-spacing-1 text-dark">Clinical Profile</span>
                                </div>
                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                    <div className="card-body p-0">
                                        <div className="row g-0">
                                            {[
                                                { label: 'Licensed Identifier', value: displayData?.license_number, mono: true, border: 'border-end border-bottom' },
                                                { label: 'Institutional Email', value: displayData?.email, border: 'border-bottom' },
                                                { label: 'Regional Sector', value: displayData?.sector || 'Global Network', border: 'border-end' },
                                                { label: 'Session Fee', value: displayData?.consultation_fee ? `₹${displayData.consultation_fee}` : 'N/A', border: '' }
                                            ].map((item, i) => (
                                                <div key={i} className={`col-6 p-3 ${item.border}`} style={{ backgroundColor: '#ffffff' }}>
                                                    <div className="small fw-bold text-secondary mb-1" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{item.label}</div>
                                                    <div className={`fw-bold text-dark ${item.mono ? 'font-monospace text-primary' : ''}`} style={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>
                                                        {item.value || 'N/A'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {doctor && doctor.bio && (
                                    <div className="mt-4 p-4 rounded-4 shadow-sm border border-light" style={{ backgroundColor: '#ffffff', borderLeft: '4px solid #0d6efd !important' }}>
                                        <div className="small fw-bold text-secondary mb-2 text-uppercase letter-spacing-1" style={{ fontSize: '0.65rem' }}>Specialist Biography</div>
                                        <p className="small text-dark mb-0 lh-lg fw-medium">{doctor.bio}</p>
                                    </div>
                                )}
                            </section>

                            {doctor && (
                                <section className="mt-2">
                                    <div className="d-flex align-items-center gap-2 mb-3 text-secondary">
                                        <Clock size={16} className="opacity-75 text-primary" />
                                        <span className="small fw-black text-uppercase letter-spacing-1 text-dark">Governance Audit Log</span>
                                    </div>
                                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                        <div className="d-flex flex-column gap-4">
                                            {doctor.audit_logs?.length > 0 ? doctor.audit_logs.map((log, idx) => (
                                                <div key={log.id} className="d-flex gap-3 position-relative">
                                                    {idx !== doctor.audit_logs.length - 1 && (
                                                        <div className="position-absolute bg-light" style={{ width: '2px', height: '100%', left: '4px', top: '20px', zIndex: 0 }}></div>
                                                    )}
                                                    <div className="bg-white border border-primary border-2 rounded-circle mt-1 d-flex justify-content-center align-items-center" style={{ width: '10px', height: '10px', zIndex: 1 }}></div>
                                                    <div className="pb-1 w-100">
                                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                                            <div className="small fw-black text-uppercase text-primary" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                                                {log.action.replace(/_/g, ' ')}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>
                                                                {new Date(log.timestamp).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div className="small text-dark fw-medium lh-sm">{log.description}</div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-3 text-secondary small fw-bold">
                                                    No recent governance actions recorded.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>

                {/* Premium Footer */}
                <div className="p-4 border-top bg-white shadow-lg z-index-1">
                    <div className="d-flex flex-column gap-3">
                        <button 
                            className="btn btn-primary w-100 fw-black py-3 rounded-pill shadow d-flex align-items-center justify-content-center gap-2 border-0"
                            style={{ background: 'linear-gradient(135deg, #0d6efd, #3b82f6)', transition: 'all 0.2s ease', transform: 'translateY(0)' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            onClick={handleExport}
                            disabled={!displayData}
                        >
                            <Download size={18} /> Export Compliance Certificate
                        </button>
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-light border flex-grow-1 rounded-pill fw-bold small py-2 d-flex align-items-center justify-content-center gap-2 text-dark hover-shadow"
                                onClick={() => window.open(`mailto:${displayData?.email}?subject=NeuroNest Portal - Administrative Notice`, '_self')}
                                disabled={!displayData?.email}
                            >
                                <Mail size={16} className="text-primary" /> Contact
                            </button>
                            <button className="btn btn-light border flex-grow-1 rounded-pill fw-bold small py-2 text-secondary" onClick={onClose}>
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .fw-black { font-weight: 950; }
                .letter-spacing-1 { letter-spacing: 1px; }
                .animate-spin { animation: spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .hover-shadow:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .z-index-1 { z-index: 1; }
            `}</style>
        </div>
    );
};

export default DoctorDrawer;
