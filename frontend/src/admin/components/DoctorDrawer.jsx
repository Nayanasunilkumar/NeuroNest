import React, { useEffect, useMemo, useState } from 'react';
import {
    X, ShieldCheck, Mail, Activity, Clock, AlertTriangle, CheckCircle,
    ShieldAlert, RefreshCw, Download, Award, Stethoscope, FileText,
    Phone, MapPin, IndianRupee, Star, UserCheck, Ban,
    ClipboardCheck, CalendarDays
} from 'lucide-react';
import { fetchDoctorDetail, updateDoctorStatus, verifyDoctor } from '../../services/adminDoctorAPI';

const formatDate = (value) => {
    if (!value) return 'Not recorded';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'Not recorded' : parsed.toLocaleDateString();
};

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const displayValue = (value, fallback = 'Not provided') => {
    if (value === 0) return '0';
    return value ? value : fallback;
};

const DoctorDrawer = ({ doctorId, basicInfo, isOpen, onClose, onChanged }) => {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState('');
    const [error, setError] = useState(null);

    const displayData = useMemo(() => ({ ...(basicInfo || {}), ...(doctor || {}) }), [basicInfo, doctor]);
    const telemetry = displayData.telemetry || {};
    const isActive = displayData?.account_status === 'active';
    const initials = displayData?.full_name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '??';

    useEffect(() => {
        if (isOpen && doctorId) {
            loadDoctorDetail();
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
            setError('Unable to load the complete clinical profile. Showing the roster snapshot for now.');
        } finally {
            setLoading(false);
        }
    };

    const runAction = async (actionName, action) => {
        try {
            setActionLoading(actionName);
            await action();
            await loadDoctorDetail();
            onChanged?.();
        } catch (err) {
            console.error(`Doctor action failed: ${actionName}`, err);
            alert(err?.response?.data?.error || err?.response?.data?.message || 'Action failed. Please try again.');
        } finally {
            setActionLoading('');
        }
    };

    const handleVerifyToggle = () => {
        if (!displayData?.id) return;
        const nextStatus = !displayData.is_verified;
        const message = nextStatus
            ? 'Confirm clinical credential verification for this specialist?'
            : 'Revoke credential verification for this specialist?';
        if (!window.confirm(message)) return;
        runAction('verify', () => verifyDoctor(displayData.id, nextStatus));
    };

    const handleStatusToggle = () => {
        if (!displayData?.id) return;
        const nextStatus = isActive ? 'suspended' : 'active';
        const reason = prompt(`Reason for changing status to ${nextStatus}:`);
        if (!reason) return;
        runAction('status', () => updateDoctorStatus(displayData.id, { status: nextStatus, reason }));
    };

    const handleExport = () => {
        if (!displayData?.id) return;

        const auditRows = doctor?.audit_logs?.length
            ? doctor.audit_logs.map((log) => `<li><strong>${escapeHtml(log.action || 'Audit').replace(/_/g, ' ')}</strong>: ${escapeHtml(log.description || 'No detail recorded')}</li>`).join('')
            : '<li>No governance actions recorded.</li>';

        const certificateHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Clinical Compliance Certificate - ${escapeHtml(displayData.full_name || 'Specialist')}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; color: #172033; line-height: 1.55; }
                    .cert { border: 8px solid #e6eef8; padding: 36px; max-width: 820px; margin: auto; }
                    .header { border-bottom: 2px solid #0f766e; padding-bottom: 18px; margin-bottom: 28px; }
                    h1 { margin: 0; color: #0f766e; font-size: 24px; letter-spacing: 1px; text-transform: uppercase; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
                    .point { border: 1px solid #dbe5f1; border-radius: 10px; padding: 14px; }
                    .label { color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
                    .value { font-size: 14px; font-weight: 700; margin-top: 4px; }
                    h2 { font-size: 15px; margin: 0 0 10px; color: #172033; }
                    li { margin-bottom: 8px; font-size: 13px; }
                    .footer { margin-top: 42px; font-size: 11px; color: #64748b; text-align: center; }
                    @media print { .no-print { display: none; } body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="cert">
                    <div class="header">
                        <h1>NeuroNest Clinical Governance</h1>
                        <div>Official Compliance Certificate</div>
                    </div>
                    <div class="grid">
                        <div class="point"><div class="label">Full Clinical Name</div><div class="value">${escapeHtml(displayData.full_name || 'N/A')}</div></div>
                        <div class="point"><div class="label">Medical License</div><div class="value">${escapeHtml(displayData.license_number || 'N/A')}</div></div>
                        <div class="point"><div class="label">Specialization</div><div class="value">${escapeHtml(displayData.specialization || 'N/A')}</div></div>
                        <div class="point"><div class="label">Credential Status</div><div class="value">${displayData.is_verified ? 'Verified' : 'Pending Review'}</div></div>
                        <div class="point"><div class="label">Account Status</div><div class="value">${escapeHtml(displayData.account_status || 'Unknown')}</div></div>
                        <div class="point"><div class="label">Risk Level</div><div class="value">${escapeHtml(telemetry.risk_level || 'low')}</div></div>
                    </div>
                    <h2>Governance Audit Summary</h2>
                    <ul>${auditRows}</ul>
                    <div class="footer">Generated on ${escapeHtml(new Date().toLocaleString())}</div>
                </div>
                <div class="no-print" style="text-align:center;margin-top:20px;">
                    <button onclick="window.print()" style="padding:10px 18px;background:#0f766e;color:white;border:0;border-radius:8px;cursor:pointer;">Print to PDF</button>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow pop-ups to export the certificate.');
            return;
        }
        printWindow.document.write(certificateHTML);
        printWindow.document.close();
    };

    if (!isOpen) return null;

    const profileStats = [
        { label: 'License', value: displayValue(displayData.license_number), icon: <ClipboardCheck size={16} />, tone: 'primary' },
        { label: 'Region', value: displayValue(displayData.sector, 'Unassigned'), icon: <MapPin size={16} />, tone: 'success' },
        { label: 'Fee', value: displayData.consultation_fee ? `₹${displayData.consultation_fee}` : 'Not set', icon: <IndianRupee size={16} />, tone: 'warning' },
        { label: 'Mode', value: displayValue(displayData.consultation_mode, 'Online'), icon: <Activity size={16} />, tone: 'info' }
    ];

    const telemetryCards = [
        { label: 'Rating', value: telemetry.avg_rating ? Number(telemetry.avg_rating).toFixed(1) : 'N/A', icon: <Star size={16} /> },
        { label: 'Reports', value: telemetry.report_count || 0, icon: <ShieldAlert size={16} /> },
        { label: 'Critical', value: telemetry.critical_review_count || 0, icon: <AlertTriangle size={16} /> },
        { label: 'Missed', value: telemetry.missed_appointments_count || 0, icon: <CalendarDays size={16} /> }
    ];

    return (
        <div
            className="fixed-top w-100 h-100 bg-dark bg-opacity-50 doctor-drawer-backdrop"
            style={{ zIndex: 3000 }}
            onClick={onClose}
        >
            <aside
                className="position-fixed top-0 end-0 h-100 bg-white shadow-lg d-flex flex-column doctor-drawer-panel"
                onClick={(event) => event.stopPropagation()}
                aria-label="Specialist identity drawer"
            >
                <div className="doctor-drawer-header">
                    <Award size={170} className="doctor-drawer-watermark" />
                    <div className="d-flex justify-content-between align-items-start gap-3 position-relative">
                        <div className="d-flex align-items-center gap-3 min-w-0">
                            <div className="doctor-drawer-avatar">{initials}</div>
                            <div className="min-w-0">
                                <h3 className="h4 fw-black mb-1 text-dark text-truncate">{displayData?.full_name || 'Specialist Identity'}</h3>
                                <div className="d-flex align-items-center gap-2 text-secondary">
                                    <Stethoscope size={14} />
                                    <span className="fw-bold small text-truncate">{displayData?.specialization || 'Clinical Provider'}</span>
                                </div>
                                <div className="small text-secondary fw-bold mt-1 opacity-75">ID: #{displayData?.id || doctorId || '---'}</div>
                            </div>
                        </div>
                        <button className="btn btn-light rounded-circle p-2 shadow-sm border flex-shrink-0" onClick={onClose} aria-label="Close specialist drawer">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="d-flex flex-wrap gap-2 mt-4 position-relative">
                        <span className={`badge rounded-pill px-3 py-2 border d-flex align-items-center gap-2 ${displayData?.is_verified ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-warning bg-opacity-10 text-warning border-warning'}`}>
                            {displayData?.is_verified ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                            {displayData?.is_verified ? 'VERIFIED' : 'PENDING'}
                        </span>
                        <span className={`badge rounded-pill px-3 py-2 border d-flex align-items-center gap-2 ${isActive ? 'bg-info bg-opacity-10 text-info border-info' : 'bg-danger bg-opacity-10 text-danger border-danger'}`}>
                            <Activity size={14} />
                            {displayData?.account_status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        <button className="btn btn-sm btn-light border rounded-pill ms-auto fw-bold d-flex align-items-center gap-2" onClick={loadDoctorDetail} disabled={loading}>
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar doctor-drawer-body">
                    {error && (
                        <div className="alert alert-warning border-0 rounded-4 small fw-semibold d-flex align-items-start gap-2">
                            <AlertTriangle size={18} className="flex-shrink-0 mt-1" />
                            <div>{error}</div>
                        </div>
                    )}

                    <section className="doctor-section">
                        <div className="doctor-section-title">
                            <FileText size={16} />
                            Clinical Snapshot
                        </div>
                        <div className="doctor-info-grid">
                            {profileStats.map((item) => (
                                <div key={item.label} className="doctor-info-card">
                                    <div className={`doctor-info-icon text-${item.tone} bg-${item.tone} bg-opacity-10`}>{item.icon}</div>
                                    <div className="small text-secondary fw-bold text-uppercase">{item.label}</div>
                                    <div className="fw-black text-dark doctor-info-value">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="doctor-section">
                        <div className="doctor-section-title">
                            <UserCheck size={16} />
                            Identity & Contact
                        </div>
                        <div className="doctor-detail-list">
                            <div><span>Email</span><strong>{displayValue(displayData.email)}</strong></div>
                            <div><span>Phone</span><strong>{displayValue(displayData.phone)}</strong></div>
                            <div><span>Qualification</span><strong>{displayValue(displayData.qualification)}</strong></div>
                            <div><span>Department</span><strong>{displayValue(displayData.department)}</strong></div>
                            <div><span>Hospital</span><strong>{displayValue(displayData.hospital_name)}</strong></div>
                            <div><span>Experience</span><strong>{displayData.experience_years ? `${displayData.experience_years} years` : 'Not provided'}</strong></div>
                        </div>
                    </section>

                    <section className="doctor-section">
                        <div className="doctor-section-title">
                            <Activity size={16} />
                            Governance Signals
                        </div>
                        <div className="doctor-telemetry-grid">
                            {telemetryCards.map((item) => (
                                <div key={item.label} className="doctor-telemetry-card">
                                    <div className="text-secondary">{item.icon}</div>
                                    <strong>{item.value}</strong>
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className={`doctor-risk-strip doctor-risk-${telemetry.risk_level || 'low'}`}>
                            <span>Risk Level</span>
                            <strong>{(telemetry.risk_level || 'low').toUpperCase()}</strong>
                        </div>
                    </section>

                    <section className="doctor-section">
                        <div className="doctor-section-title">
                            <Stethoscope size={16} />
                            Specialist Biography
                        </div>
                        <div className="doctor-bio-box">
                            {displayData.bio || 'No biography has been added yet. This profile can still be reviewed using the credential and governance records above.'}
                        </div>
                    </section>

                    <section className="doctor-section">
                        <div className="doctor-section-title">
                            <Clock size={16} />
                            Governance Audit Log
                        </div>
                        <div className="doctor-timeline">
                            {doctor?.audit_logs?.length > 0 ? doctor.audit_logs.map((log, idx) => (
                                <div key={log.id || idx} className="doctor-timeline-item">
                                    <span className="doctor-timeline-dot" />
                                    <div>
                                        <div className="d-flex justify-content-between gap-3">
                                            <strong>{(log.action || 'audit').replace(/_/g, ' ')}</strong>
                                            <time>{formatDate(log.timestamp)}</time>
                                        </div>
                                        <p>{log.description || 'No detail recorded.'}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="doctor-empty-state">No recent governance actions recorded.</div>
                            )}
                        </div>
                    </section>

                    {doctor?.status_logs?.length > 0 && (
                        <section className="doctor-section mb-0">
                            <div className="doctor-section-title">
                                <Ban size={16} />
                                Status History
                            </div>
                            <div className="doctor-status-history">
                                {doctor.status_logs.map((log) => (
                                    <div key={log.id}>
                                        <strong>{log.previous_status || 'unknown'} {'->'} {log.new_status}</strong>
                                        <span>{log.reason || 'No reason recorded'} - {formatDate(log.timestamp)}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="p-4 border-top bg-white shadow-lg">
                    <div className="d-grid gap-2">
                        <div className="d-flex gap-2">
                            <button
                                className={`btn flex-fill fw-black rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 ${displayData?.is_verified ? 'btn-outline-warning' : 'btn-success'}`}
                                onClick={handleVerifyToggle}
                                disabled={!!actionLoading || !displayData?.id}
                            >
                                {actionLoading === 'verify' ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                {displayData?.is_verified ? 'Revoke' : 'Verify'}
                            </button>
                            <button
                                className={`btn flex-fill fw-black rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 ${isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                onClick={handleStatusToggle}
                                disabled={!!actionLoading || !displayData?.id}
                            >
                                {actionLoading === 'status' ? <RefreshCw size={16} className="animate-spin" /> : isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                                {isActive ? 'Suspend' : 'Activate'}
                            </button>
                        </div>
                        <button
                            className="btn btn-primary w-100 fw-black py-3 rounded-pill shadow d-flex align-items-center justify-content-center gap-2 border-0 doctor-export-btn"
                            onClick={handleExport}
                            disabled={!displayData?.id}
                        >
                            <Download size={18} /> Export Compliance Cert
                        </button>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-light border flex-grow-1 rounded-pill fw-bold small py-2 d-flex align-items-center justify-content-center gap-2 text-dark"
                                onClick={() => window.open(`mailto:${displayData?.email}?subject=NeuroNest Portal - Administrative Notice`, '_self')}
                                disabled={!displayData?.email}
                            >
                                <Mail size={16} className="text-primary" /> Contact
                            </button>
                            {displayData?.phone && (
                                <button
                                    className="btn btn-light border flex-grow-1 rounded-pill fw-bold small py-2 d-flex align-items-center justify-content-center gap-2 text-dark"
                                    onClick={() => window.open(`tel:${displayData.phone}`, '_self')}
                                >
                                    <Phone size={16} className="text-success" /> Call
                                </button>
                            )}
                            <button className="btn btn-light border flex-grow-1 rounded-pill fw-bold small py-2 text-secondary" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <style>{`
                .doctor-drawer-backdrop { backdrop-filter: blur(5px); }
                .doctor-drawer-panel { width: min(100%, 560px); transform: translateX(0); }
                .doctor-drawer-header { position: relative; overflow: hidden; padding: 1.5rem; border-bottom: 1px solid #dbe5f1; background: linear-gradient(135deg, #eff6ff 0%, #f8fbff 56%, #eefdf8 100%); }
                .doctor-drawer-watermark { position: absolute; right: -28px; top: -36px; color: rgba(13, 110, 253, 0.08); }
                .doctor-drawer-avatar { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; background: linear-gradient(135deg, #0f766e, #2563eb); font-size: 1.25rem; font-weight: 950; box-shadow: 0 10px 24px rgba(15, 118, 110, 0.22); flex: 0 0 64px; }
                .doctor-drawer-body { background: #f8fafc; }
                .doctor-section { margin-bottom: 1.25rem; }
                .doctor-section-title { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; color: #172033; font-size: 0.72rem; font-weight: 950; letter-spacing: 0.06em; text-transform: uppercase; }
                .doctor-info-grid, .doctor-telemetry-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
                .doctor-info-card, .doctor-telemetry-card, .doctor-bio-box, .doctor-detail-list, .doctor-timeline, .doctor-status-history { background: white; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04); }
                .doctor-info-card { padding: 0.9rem; min-width: 0; }
                .doctor-info-icon { width: 2rem; height: 2rem; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.7rem; }
                .doctor-info-value { font-size: 0.92rem; word-break: break-word; }
                .doctor-detail-list { padding: 0.35rem 1rem; }
                .doctor-detail-list div { display: flex; justify-content: space-between; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid #edf2f7; }
                .doctor-detail-list div:last-child { border-bottom: 0; }
                .doctor-detail-list span, .doctor-status-history span { color: #64748b; font-size: 0.78rem; font-weight: 700; }
                .doctor-detail-list strong { color: #172033; font-size: 0.86rem; text-align: right; word-break: break-word; }
                .doctor-telemetry-card { padding: 0.85rem; display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 0.55rem; }
                .doctor-telemetry-card strong { color: #172033; font-size: 1rem; }
                .doctor-telemetry-card span { grid-column: 1 / -1; color: #64748b; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-top: 0.35rem; }
                .doctor-risk-strip { display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; padding: 0.85rem 1rem; border-radius: 14px; font-size: 0.78rem; font-weight: 900; }
                .doctor-risk-strip span { color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
                .doctor-risk-low { background: #ecfdf5; color: #047857; }
                .doctor-risk-medium { background: #fffbeb; color: #b45309; }
                .doctor-risk-high, .doctor-risk-critical { background: #fef2f2; color: #b91c1c; }
                .doctor-bio-box { padding: 1rem; color: #334155; font-size: 0.9rem; line-height: 1.65; }
                .doctor-timeline { padding: 1rem; }
                .doctor-timeline-item { display: grid; grid-template-columns: 12px 1fr; gap: 0.75rem; position: relative; padding-bottom: 1rem; }
                .doctor-timeline-item:not(:last-child)::before { content: ""; position: absolute; left: 5px; top: 16px; bottom: 0; width: 2px; background: #e2e8f0; }
                .doctor-timeline-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; background: #0f766e; box-shadow: 0 0 0 4px #ccfbf1; z-index: 1; }
                .doctor-timeline strong { color: #0f766e; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; }
                .doctor-timeline time { color: #94a3b8; font-size: 0.68rem; font-weight: 800; white-space: nowrap; }
                .doctor-timeline p { margin: 0.25rem 0 0; color: #334155; font-size: 0.84rem; line-height: 1.45; }
                .doctor-empty-state { text-align: center; color: #64748b; font-size: 0.84rem; font-weight: 800; padding: 0.75rem; }
                .doctor-status-history { padding: 0.25rem 1rem; }
                .doctor-status-history div { padding: 0.75rem 0; border-bottom: 1px solid #edf2f7; display: flex; flex-direction: column; gap: 0.2rem; }
                .doctor-status-history div:last-child { border-bottom: 0; }
                .doctor-status-history strong { color: #172033; font-size: 0.82rem; text-transform: uppercase; }
                .doctor-export-btn { background: linear-gradient(135deg, #0f766e, #0d9488) !important; }
                .fw-black { font-weight: 950; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .min-w-0 { min-width: 0; }
                @media (max-width: 520px) {
                    .doctor-info-grid, .doctor-telemetry-grid { grid-template-columns: 1fr; }
                    .doctor-detail-list div { flex-direction: column; gap: 0.25rem; }
                    .doctor-detail-list strong { text-align: left; }
                }
            `}</style>
        </div>
    );
};

export default DoctorDrawer;
