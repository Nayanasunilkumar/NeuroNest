import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ShieldAlert, Search, Filter, ArrowRight, AlertTriangle, 
    CheckCircle, MessageSquare, Clock, User, ArrowLeft
} from 'lucide-react';
import { governanceApi } from '../../shared/services/api/governance';
import './Escalation.css';

const EscalationQueue = () => {
    const [escalations, setEscalations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('open');
    const navigate = useNavigate();

    useEffect(() => {
        fetchEscalations();
    }, [filter]);

    const fetchEscalations = async () => {
        setLoading(true);
        try {
            const data = await governanceApi.getEscalations(filter);
            setEscalations(data);
        } catch (err) {
            console.error("Failed to fetch queue", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="escalation-container">
            {/* Navigation Axis */}
            <div className="nav-axis">
                <button className="btn-back-prominent" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                    <span>Back to Dashboard</span>
                </button>
            </div>

            <header className="governance-header-v2">
                <div className="header-title-group">
                     <div className="title-ring-icon">
                        <ShieldAlert size={20} />
                     </div>
                     <div>
                        <h1>Escalation Queue</h1>
                        <p className="governance-subtitle">Manage and resolve high-risk clinical events with precision.</p>
                     </div>
                </div>
                <div className="header-actions">
                    <select 
                        className="filter-select-premium"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="open">Active Escalations</option>
                        <option value="resolved">Resolved History</option>
                        <option value="dismissed">Dismissed Cases</option>
                    </select>
                </div>
            </header>

            <div className="queue-matrix">
                {loading ? (
                    <div className="loading-pulse">Retrieving Governance Queue...</div>
                ) : escalations.length === 0 ? (
                    <div className="empty-queue-nexus">
                         <ShieldAlert size={48} />
                         <h3>Queue Clear</h3>
                         <p>No active escalations requiring immediate triage.</p>
                    </div>
                ) : (
                    <div className="escalation-grid">
                        {escalations.map((esc) => (
                            <div 
                                key={esc.id} 
                                className="queue-card" 
                                data-risk={esc.risk_level}
                                onClick={() => navigate(`/admin/governance/doctor/${esc.doctor_id}`)}
                            >
                                <div className="queue-card-header">
                                    <div className="risk-indicator" />
                                    <span className="esc-id">ESC-#{esc.id}</span>
                                    <span className="esc-date">{new Date(esc.created_at).toLocaleDateString()}</span>
                                </div>
                                
                                <div className="queue-card-body">
                                    <h3>{esc.doctor_name}</h3>
                                    <p className="esc-reason">{esc.reason}</p>
                                    
                                    <div className="esc-stats">
                                        <div className="esc-stat">
                                            <MessageSquare size={14} />
                                            <span>{esc.actions?.length || 0} Actions</span>
                                        </div>
                                        <div className="esc-stat">
                                            <Clock size={14} />
                                            <span>Age: {Math.floor((new Date() - new Date(esc.created_at)) / (1000 * 60 * 60 * 24))}d</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="queue-card-footer">
                                    <span className="investigate-link">Investigate Case <ArrowRight size={14} /></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .governance-header-v2 {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }

                .header-title-group {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .title-ring-icon {
                    width: 50px;
                    height: 50px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ef4444;
                }

                .governance-header-v2 h1 {
                    font-size: 2.25rem;
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: -0.02em;
                }

                .governance-subtitle {
                    font-size: 0.9rem;
                    color: var(--admin-text-muted);
                    margin: 4px 0 0 0;
                    font-weight: 600;
                }

                .filter-select-premium {
                    background: var(--admin-surface);
                    color: var(--admin-text);
                    border: 1px solid var(--admin-border);
                    border-radius: 12px;
                    padding: 0.6rem 1.2rem;
                    font-weight: 800;
                    font-size: 0.85rem;
                    outline: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .filter-select-premium:hover {
                    border-color: var(--admin-accent);
                }

                .queue-matrix {
                    margin-top: 1rem;
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .escalation-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                .queue-card {
                    background: var(--admin-surface);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--admin-border);
                    border-radius: 16px;
                    padding: 1.25rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    overflow: hidden;
                }

                .queue-card:hover {
                    transform: translateY(-5px) scale(1.02);
                    border-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
                }

                .queue-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--admin-text-muted);
                }

                .risk-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .queue-card[data-risk="critical"] .risk-indicator { background: var(--admin-danger); box-shadow: 0 0 10px var(--admin-danger); }
                .queue-card[data-risk="high"] .risk-indicator { background: var(--admin-warning); }
                .queue-card[data-risk="medium"] .risk-indicator { background: var(--admin-info); }
                .queue-card[data-risk="low"] .risk-indicator { background: var(--admin-success); }

                .queue-card-body h3 {
                    font-size: 1.1rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                }

                .esc-reason {
                    font-size: 0.85rem;
                    color: var(--admin-text-muted);
                    height: 40px;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    margin-bottom: 1rem;
                }

                .esc-stats {
                    display: flex;
                    gap: 1rem;
                }

                .esc-stat {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--admin-text-muted);
                }

                .queue-card-footer {
                    margin-top: 1.25rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    text-align: right;
                }

                .investigate-link {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: var(--admin-info);
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.4rem;
                }

                .empty-queue-nexus {
                    text-align: center;
                    padding: 5rem 0;
                    opacity: 0.5;
                }

                .empty-queue-nexus h3 { font-size: 1.5rem; margin: 1rem 0; }
            `}</style>
        </div>
    );
};

export default EscalationQueue;
