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
            // Find active escalation if any
            const activeEscalation = data.history.find(e => e.status === 'open' || e.status === 'investigating');
            if (activeEscalation) {
                await governanceApi.takeAction(activeEscalation.id, {
                    action_type: actionType,
                    note: actionNote
                });
                alert("Action performed successfully.");
                setActionNote('');
                fetchData();
            } else {
                alert("No active escalation found to perform actions on.");
            }
        } catch (err) {
            alert("Action failed: " + err.message);
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
            {/* Header: Identity Axis */}
            <div className="governance-header">
                <div className="doctor-identity">
                    <div className="risk-badge" data-risk={telemetry.risk_level}>
                        <ShieldAlert size={10} style={{ marginRight: 4 }} />
                        {telemetry.risk_level.toUpperCase()} RISK
                    </div>
                    <h1>{data.full_name || 'Medical Practitioner'}</h1>
                    <p className="governance-meta">
                        Oversight ID: <span style={{ fontWeight: 700, color: 'var(--admin-text)' }}>#{doctor_id}</span> 
                        <span style={{ margin: '0 12px', opacity: 0.3 }}>|</span> 
                        Status: <span className={`status-pill ${telemetry.doctor_status}`}>{telemetry.doctor_status.replace('_', ' ')}</span>
                    </p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate(-1)}>
                        <Calendar size={16} /> History
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--admin-success)', border: 'none', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }} onClick={fetchData}>
                        <CheckCircle size={16} /> Refresh Telemetry
                    </button>
                </div>
            </div>

            <div className="governance-grid">
                {/* Analytics Sidebar */}
                <div className="analytics-column">
                    <div className="governance-card performance-nexus">
                         <h3>Clinical Performance</h3>
                         <div className="clinical-pulse-bar" style={{ height: 4, background: 'var(--admin-border)', borderRadius: 2, marginBottom: '1.5rem', overflow: 'hidden' }}>
                            <div style={{ width: `${(telemetry.avg_rating / 5) * 100}%`, height: '100%', background: 'var(--admin-warning)', borderRadius: 2 }} />
                         </div>
                         <div className="metric-row">
                            <div className="event-icon" style={{ width: 32, height: 32, borderRadius: 8 }}>
                                <Star size={16} style={{ color: 'var(--admin-warning)' }} />
                            </div>
                            <span>Average Rating</span>
                            <strong>{telemetry.avg_rating.toFixed(1)}</strong>
                         </div>
                         <div className="metric-row">
                            <div className="event-icon" style={{ width: 32, height: 32, borderRadius: 8 }}>
                                <AlertTriangle size={16} style={{ color: 'var(--admin-danger)' }} />
                            </div>
                            <span>Critical Reviews</span>
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
                         <div className="metric-row">
                            <div className="event-icon" style={{ width: 32, height: 32, borderRadius: 8 }}>
                                <Info size={16} style={{ color: 'var(--admin-accent)' }} />
                            </div>
                            <span>Patient Reports</span>
                            <strong>{telemetry.report_count}</strong>
                         </div>
                    </div>

                    <div className="governance-card risk-matrix">
                        <h3>Risk Mitigation Actions</h3>
                        <textarea 
                            placeholder="Add administrative notes or reasoning for action..."
                            value={actionNote}
                            onChange={(e) => setActionNote(e.target.value)}
                        />
                        <div className="action-button-grid">
                            <button className="btn-action warn" onClick={() => handleAction('warning')}>
                                <AlertTriangle size={14} /> Issue Warning
                            </button>
                            <button className="btn-action restrict" onClick={() => handleAction('restrict')}>
                                <Ban size={14} /> Restrict Video
                            </button>
                            <button className="btn-action suspend" onClick={() => handleAction('suspend')}>
                                <UserMinus size={14} /> Suspend Account
                            </button>
                            <button className="btn-action resolve" onClick={() => handleAction('resolve')}>
                                <ShieldCheck size={14} /> Resolve Case
                            </button>
                        </div>
                    </div>
                </div>

                {/* Event Stream Column */}
                <div className="stream-column">
                    <div className="governance-card">
                        <h3>Oversight Event Stream</h3>
                        <div className="event-list">
                            {history.length === 0 ? (
                                <p className="empty-stream">No significant governance events recorded.</p>
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
                                            {event.actions && event.actions.map((act, j) => (
                                                <div key={j} className="audit-log">
                                                    <strong>{act.admin_name}</strong> took action: <span>{act.action_type.toUpperCase()}</span>
                                                    <p className="audit-note">"{act.note}"</p>
                                                </div>
                                            ))}
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
