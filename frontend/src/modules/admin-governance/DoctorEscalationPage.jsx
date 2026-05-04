import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ShieldAlert, User, Star, AlertTriangle, Calendar, 
    Video, MessageCircle, FileText, Ban, AlertCircle,
    CheckCircle, XCircle, Info, Send, Phone, UserMinus, ShieldCheck
} from 'lucide-react';
import { governanceApi } from '../../shared/services/api/governance';
import './Escalation.css';

const DoctorEscalationPage = () => {
    const { doctor_id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [actionNote, setActionNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [doctor_id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await governanceApi.getDoctorGovernance(doctor_id);
            setData(result);
        } catch (err) {
            console.error("Failed to fetch governance data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionType) => {
        if (!actionNote && actionType !== 'resolve') {
            alert("Please provide a note for this action.");
            return;
        }

        setSubmitting(true);
        try {
            await governanceApi.takeDoctorAction(doctor_id, {
                action_type: actionType,
                note: actionNote || `Case ${actionType}d by administrative review.`
            });
            alert("Action performed successfully.");
            setActionNote('');
            fetchData();
        } catch (err) {
            alert("Action failed: " + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-state">Initializing Governance Nexus...</div>;
    if (!data) return <div className="error-state">Doctor Governance Profile Not Found</div>;

    const { telemetry, history } = data;
    const activeCase = history.find(e => e.status === 'open' || e.status === 'investigating');

    return (
        <div className="escalation-container">
            {/* Navigation Axis */}
            <div className="nav-axis">
                <button className="btn-back-prominent" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                    <span>Back to Governance</span>
                </button>
            </div>

            {/* Header: Identity Axis */}
            <div className="governance-header-premium">
                <div className="profile-identity-group">
                    <div className="dr-avatar-large">
                        {data.doctor_details?.profile_image ? (
                            <img src={data.doctor_details.profile_image} alt={data.doctor_details.full_name} />
                        ) : (
                            <div className="avatar-placeholder">{data.doctor_details?.full_name?.charAt(0) || 'D'}</div>
                        )}
                        <div className={`status-indicator-ring ${telemetry.doctor_status}`} />
                    </div>
                    <div className="identity-details">
                        <div className="badge-row">
                            {telemetry.risk_level !== 'low' && (
                                <div className="risk-badge-v2" data-risk={telemetry.risk_level}>
                                    <ShieldAlert size={12} />
                                    {telemetry.risk_level.toUpperCase()} RISK
                                </div>
                            )}
                            <span className={`status-pill-v2 ${telemetry.doctor_status}`}>{telemetry.doctor_status.replace('_', ' ')}</span>
                        </div>
                        <h1>{data.doctor_details?.full_name || 'Medical Practitioner'}</h1>
                        <p className="governance-meta-premium">
                            <span className="dr-context-label">{data.doctor_details?.specialization}</span>
                            <span className="separator">•</span>
                            <span className="dr-dept-label">{data.doctor_details?.department}</span>
                            <span className="separator">|</span>
                            <span className="dr-id-label">ID: #{doctor_id}</span>
                        </p>
                    </div>
                </div>
                
                <div className="header-telemetry-quickview">
                    <button className="btn-refresh-pulse" onClick={fetchData} disabled={loading}>
                        <RefreshCcw size={16} className={loading ? 'spin' : ''} />
                        Telemetry
                    </button>
                    <button className="btn-back-glass" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} />
                        Back
                    </button>
                </div>
            </div>

            <div className="governance-bento-grid">
                {/* 1. Clinical Intelligence */}
                <div className="bento-item performance-nexus">
                    <div className="governance-card">
                        <h3>Clinical Intelligence</h3>
                        <div className="clinical-pulse-bar" style={{ height: 4, background: 'var(--admin-border)', borderRadius: 2, marginBottom: '1.5rem', overflow: 'hidden' }}>
                            <div style={{ width: `${(telemetry.avg_rating / 5) * 100}%`, height: '100%', background: 'var(--admin-warning)', borderRadius: 2 }} />
                        </div>
                        <div className="metric-row">
                            <div className="event-icon" style={{ width: 32, height: 32, borderRadius: 8 }}>
                                <Star size={16} style={{ color: 'var(--admin-warning)' }} />
                            </div>
                            <span>Avg. Patient Rating</span>
                            <strong>{telemetry.avg_rating.toFixed(1)}</strong>
                        </div>
                        <div className="metric-row">
                            <div className="event-icon" style={{ width: 32, height: 32, borderRadius: 8 }}>
                                <AlertTriangle size={16} style={{ color: 'var(--admin-danger)' }} />
                            </div>
                            <span>Critical Feedback</span>
                            <strong style={{ color: telemetry.critical_review_count > 0 ? 'var(--admin-danger)' : 'inherit' }}>
                                {telemetry.critical_review_count}
                            </strong>
                        </div>
                        <div className="metric-row">
                            <div className="event-icon" style={{ width: 32, height: 32, borderRadius: 8 }}>
                                <Calendar size={16} style={{ color: 'var(--admin-info)' }} />
                            </div>
                            <span>Missed Sessions</span>
                            <strong>{telemetry.missed_appointments_count}</strong>
                        </div>
                    </div>
                </div>

                {/* 2. Case Governance */}
                <div className="bento-item case-governance">
                    <div className="governance-card">
                        <h3>Current Oversight Status</h3>
                        <div className="status-display">
                            <div className="status-main">
                                <span className={`status-pill large ${telemetry.doctor_status}`}>
                                    {telemetry.doctor_status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="case-details">
                                <div className="detail-item">
                                    <span>Last Evaluated</span>
                                    <strong>{history.length > 0 ? new Date(history[0].created_at).toLocaleDateString() : 'Never'}</strong>
                                </div>
                                <div className="detail-item">
                                    <span>Open Issues</span>
                                    <strong>{history.filter(e => e.status === 'open').length}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="telemetry-ping" style={{ marginTop: '2rem', padding: '1rem', background: 'var(--admin-surface-2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="ping-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-success)', boxShadow: '0 0 8px var(--admin-success)' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>LIVE TELEMETRY ACTIVE</span>
                        </div>
                    </div>
                </div>

                {/* 3. Immediate Response */}
                <div className="bento-item risk-matrix">
                    <div className="governance-card">
                        <h3>Immediate Response</h3>
                        <textarea 
                            placeholder="Add administrative reasoning..."
                            value={actionNote}
                            onChange={(e) => setActionNote(e.target.value)}
                            style={{ height: '80px', marginBottom: '1rem' }}
                        />
                        <div className="action-button-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <button className="btn-action warn small" onClick={() => handleAction('warning')}>
                                <AlertTriangle size={12} /> Warn
                            </button>
                            <button className="btn-action restrict small" onClick={() => handleAction('restrict')}>
                                <Ban size={12} /> Restrict
                            </button>
                            <button className="btn-action suspend small" style={{ gridColumn: 'span 2' }} onClick={() => handleAction('suspend')}>
                                <UserMinus size={12} /> Suspend Account
                            </button>
                        </div>
                        <button className="btn-action resolve" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleAction('resolve')}>
                            <ShieldCheck size={14} /> Resolve & Close Case
                        </button>
                    </div>
                </div>

                {/* 4. Full Event Stream (Full Width) */}
                <div className="bento-item full-stream" style={{ gridColumn: 'span 3' }}>
                    <div className="governance-card">
                        <h3>Oversight Event Stream</h3>
                        <div className="event-list horizontal">
                            {history.length === 0 ? (
                                <p className="empty-stream">No governance events on record.</p>
                            ) : (
                                history.map((event, i) => (
                                    <div key={i} className="event-item" data-status={event.status}>
                                        <div className="event-icon">
                                            {event.status === 'resolved' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                        </div>
                                        <div className="event-content">
                                            <div className="event-meta">
                                                <span className="event-date">{new Date(event.created_at).toLocaleDateString()}</span>
                                                <span className={`event-status ${event.status}`}>{event.status}</span>
                                            </div>
                                            <p className="event-reason">{event.reason}</p>
                                            <div className="audit-timeline">
                                                {event.actions && event.actions.map((act, j) => (
                                                    <div key={j} className="audit-log mini">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                            <strong>{act.admin_name}</strong>
                                                            <span className="act-type">{act.action_type}</span>
                                                        </div>
                                                        <p className="audit-note">"{act.note}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorEscalationPage;
