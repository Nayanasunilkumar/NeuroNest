import React, { useState, useEffect } from 'react';
import { 
    X, ShieldCheck, ShieldAlert, Mail, MapPin, 
    Calendar, User, CreditCard, Activity, Clock,
    AlertTriangle, CheckCircle, ExternalLink
} from 'lucide-react';
import { fetchDoctorDetail } from '../../services/adminDoctorAPI';
import '../../styles/admin-manage-doctors.css';

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
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                    .cert-container { border: 4px double #e2e8f0; padding: 40px; max-width: 800px; margin: auto; position: relative; }
                    .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #6366f1; text-transform: uppercase; letter-spacing: 2px; }
                    .header p { margin: 5px 0; font-weight: bold; color: #64748b; }
                    .identity-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                    .data-point { border-bottom: 1px solid #f1f5f9; padding: 10px 0; }
                    .label { color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
                    .value { font-size: 14px; font-weight: bold; }
                    .audit-section { margin-top: 40px; }
                    .audit-section h2 { font-size: 16px; border-left: 4px solid #6366f1; padding-left: 10px; margin-bottom: 15px; }
                    .audit-log { font-size: 12px; margin-bottom: 10px; padding: 10px; background: #f8fafc; border-radius: 4px; }
                    .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #94a3b8; }
                    .signature-block { margin-top: 50px; display: flex; justify-content: space-between; }
                    .sig-line { border-top: 1px solid #475569; width: 200px; text-align: center; padding-top: 5px; font-size: 10px; }
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
                        <div class="data-point"><div class="label">Roster Status</div><div class="value">${doctor.account_status.toUpperCase()}</div></div>
                        <div class="data-point"><div class="label">Certificate ID</div><div class="value">NN-CER-${doctor.id}-${Date.now().toString().slice(-6)}</div></div>
                    </div>

                    <div class="audit-section">
                        <h2>GOVERNANCE AUDIT SUMMARY</h2>
                        ${doctor.audit_logs?.map(log => `
                            <div class="audit-log">
                                <strong>${log.action.replace(/_/g, ' ').toUpperCase()}</strong>: ${log.description}
                            </div>
                        `).join('') || '<p>No governance actions recorded.</p>'}
                    </div>

                    <div class="signature-block">
                        <div class="sig-line">Institutional Medical Director</div>
                        <div class="sig-line">Chief Administration Officer</div>
                    </div>

                    <div class="footer">
                        <p>This is an electronically generated institutional document. Valid only when presented via the NeuroNest Governance Portal.</p>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;" class="no-print">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Download / Save as PDF</button>
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(certificateHTML);
        printWindow.document.close();
    };

    if (!isOpen) return null;

    return (
        <div className={`nexus-modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className={`nexus-profile-modal ${isOpen ? 'active' : ''}`} onClick={e => e.stopPropagation()}>
                <header className="modal-header-nexus">
                    <div className="header-main-nexus">
                        <div className="specialist-avatar-lg">
                            {doctor?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                        </div>
                        <div className="header-identity-nexus">
                            <h3>{doctor?.full_name || 'Loading Specialist...'}</h3>
                            <p>{doctor?.specialization} • ID: #{doctor?.id}</p>
                        </div>
                    </div>
                    <button className="close-modal-btn-nexus" onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <div className="modal-content-nexus">
                    {loading ? (
                        <div className="modal-loading-nexus">
                            <Activity className="animate-spin" size={32} />
                            <p>Establishing Secure Intelligence Uplink...</p>
                        </div>
                    ) : doctor ? (
                        <div className="intelligence-grid-nexus">
                            {/* Compliance Status Banner */}
                            <section className="compliance-status-banner-nexus">
                                <div className={`status-node-nexus ${doctor.is_verified ? 'verified' : 'pending'}`}>
                                    {doctor.is_verified ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                                    <span>{doctor.is_verified ? 'CREDENTIALS AUTHORIZED' : 'CREDENTIALS PENDING'}</span>
                                </div>
                                <div className={`status-node-nexus account-${doctor.account_status}`}>
                                    <Clock size={16} />
                                    <span>ROSTER STATUS: {doctor.account_status.toUpperCase()}</span>
                                </div>
                            </section>

                            <div className="modal-scroll-area-nexus">
                                {/* Core Identity Details */}
                                <div className="detail-section-nexus">
                                    <h4 className="section-tag-nexus"><User size={12} /> CORE SPECIALIST DATA</h4>
                                    <div className="info-grid-nexus">
                                        <div className="info-card-nexus">
                                            <div className="info-label-nexus">Full Clinical Name</div>
                                            <div className="info-value-nexus">{doctor.full_name}</div>
                                        </div>
                                        <div className="info-card-nexus">
                                            <div className="info-label-nexus">Medical License</div>
                                            <div className="info-value-nexus monospace-nexus">{doctor.license_number}</div>
                                        </div>
                                        <div className="info-card-nexus">
                                            <div className="info-label-nexus">Clinical Email</div>
                                            <div className="info-value-nexus">{doctor.email}</div>
                                        </div>
                                        <div className="info-card-nexus">
                                            <div className="info-label-nexus">Onboarding Date</div>
                                            <div className="info-value-nexus">
                                                {new Date(doctor.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <div className="info-card-nexus">
                                            <div className="info-label-nexus">Operational Sector</div>
                                            <div className="info-value-nexus" style={{color: 'var(--admin-secondary)', fontWeight: 600}}>
                                                {doctor.sector || 'Unassigned'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Profile */}
                                <div className="detail-section-nexus">
                                    <h4 className="section-tag-nexus"><Activity size={12} /> CLINICAL PROFILE</h4>
                                    <div className="bio-container-nexus">
                                        <div className="info-label-nexus">Professional Summary</div>
                                        <p className="bio-text-nexus">{doctor.bio || 'No professional biography provided in clinical record.'}</p>
                                    </div>
                                    <div className="info-grid-nexus dual">
                                        <div className="info-card-nexus">
                                            <div className="info-label-nexus">Consultation Fee</div>
                                            <div className="info-value-nexus">₹{doctor.consultation_fee}</div>
                                        </div>
                                        <div className="info-card-nexus">
                                            <div className="info-label-nexus">Clinical Reach</div>
                                            <div className="info-value-nexus">Active Governance</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Governance Audit Trail */}
                                <div className="detail-section-nexus">
                                    <h4 className="section-tag-nexus"><Clock size={12} /> GOVERNANCE AUDIT TRAIL</h4>
                                    <div className="audit-trail-nexus">
                                        {doctor.audit_logs?.length > 0 ? doctor.audit_logs.map(log => (
                                            <div key={log.id} className="audit-item-nexus">
                                                <div className="audit-marker-nexus" />
                                                <div className="audit-body-nexus">
                                                    <div className="audit-header-nexus">
                                                        <span className="audit-action-nexus">{log.action.replace(/_/g, ' ').toUpperCase()}</span>
                                                    </div>
                                                    <p className="audit-desc-nexus">{log.description}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="no-audit-nexus">No recent governance actions recorded.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <footer className="modal-footer-nexus">
                    <button className="footer-action-btn-nexus secondary" onClick={onClose}>
                        Close Profile
                    </button>
                    <button 
                        className="footer-action-btn-nexus secondary"
                        onClick={() => window.open(`mailto:${doctor.email}?subject=NeuroNest Clinical Governance - Institutional Notice`, '_self')}
                    >
                        <Mail size={14} />
                        Contact Specialist
                    </button>
                    <button className="footer-action-btn-nexus primary" onClick={handleExport}>
                        Export Compliance Certificate
                        <ExternalLink size={14} />
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default DoctorDrawer;
