import React, { useState, useEffect } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  User, 
  Clock, 
  Stethoscope, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  LogOut, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  Mail,
  ShieldCheck,
  HeartPulse,
  Ruler,
  Weight,
  Droplets,
  CalendarDays,
  MapPinned,
  FileText,
  Gauge,
  TrendingUp,
  Flag,
  ClipboardCheck,
  ListChecks,
  Video,
  Building2
} from 'lucide-react';
import { fetchPatientDetail, updatePatientStatus } from '../services/adminPatientAPI';
import { formatDateIST } from '../../shared/utils/time';

const PatientDrawer = ({ patientId, isOpen, initialTab = 'profile', onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [wide, setWide] = useState(false);
  const [statusDialog, setStatusDialog] = useState(null);
  const [statusReason, setStatusReason] = useState('');
  const [statusError, setStatusError] = useState('');
  const [statusNotice, setStatusNotice] = useState('');

  const statusActions = {
    active: {
      title: 'Authorize Reactivation',
      reasonLabel: 'Reason for Reactivation',
      submitLabel: 'OK',
      success: 'User reactivated successfully',
      icon: <CheckCircle2 size={16} />,
      buttonClass: 'gov-btn-success'
    },
    suspended: {
      title: 'Initialize Suspension',
      reasonLabel: 'Reason for Suspension',
      submitLabel: 'OK',
      success: 'User suspended successfully',
      icon: <AlertTriangle size={16} />,
      buttonClass: 'gov-btn-danger'
    }
  };

  useEffect(() => {
    if (isOpen && patientId) {
      setActiveTab(initialTab);
      loadDetail();
    } else {
      setData(null);
    }
    setStatusDialog(null);
    setStatusReason('');
    setStatusError('');
    setStatusNotice('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, patientId, initialTab]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await fetchPatientDetail(patientId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openStatusDialog = (newStatus) => {
    setStatusDialog(newStatus);
    setStatusReason('');
    setStatusError('');
    setStatusNotice('');
  };

  const closeStatusDialog = () => {
    if (updating) return;
    setStatusDialog(null);
    setStatusReason('');
    setStatusError('');
  };

  const handleStatusSubmit = async (event) => {
    event.preventDefault();
    if (!statusDialog || updating) return;

    const reason = statusReason.trim();
    if (!reason) {
      setStatusError('Reason is required.');
      return;
    }

    const action = statusActions[statusDialog];

    try {
      setUpdating(true);
      setStatusError('');
      await updatePatientStatus(patientId, { status: statusDialog, reason });
      setData((current) => current ? {
        ...current,
        user_info: {
          ...current.user_info,
          account_status: statusDialog
        }
      } : current);
      setStatusNotice(action.success);
      setStatusDialog(null);
      setStatusReason('');
      onRefresh();
    } catch (err) {
      setStatusError(err?.response?.data?.error || 'Failed to update user status.');
    } finally {
      setUpdating(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Clinical Profile', icon: <User size={16} /> },
    { id: 'timeline', label: 'Event History', icon: <Clock size={16} /> },
    { id: 'clinical', label: 'Metric Analysis', icon: <Stethoscope size={16} /> }
  ];

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    const birthDate = new Date(dateOfBirth);
    if (Number.isNaN(birthDate.getTime())) return 'Unknown';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthOffset = today.getMonth() - birthDate.getMonth();
    if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < birthDate.getDate())) age -= 1;
    return age >= 0 ? `${age} years` : 'Unknown';
  };

  const calculateBmi = () => {
    const height = Number(data?.profile_info.height_cm);
    const weight = Number(data?.profile_info.weight_kg);
    if (!height || !weight) return { value: 'Missing', label: 'Insufficient data' };
    const bmi = weight / ((height / 100) ** 2);
    let label = 'Standard range';
    if (bmi < 18.5) label = 'Below range';
    if (bmi >= 25) label = 'Above range';
    if (bmi >= 30) label = 'High range';
    return { value: bmi.toFixed(1), label };
  };

  const getRiskLevel = () => {
    const openFlags = Number(data?.metrics?.flags_open || 0);
    if (data?.user_info.account_status === 'suspended') return { label: 'Suspended', className: 'critical' };
    if (openFlags > 2) return { label: 'High attention', className: 'critical' };
    if (openFlags > 0) return { label: 'Watchlist', className: 'watch' };
    return { label: 'Stable', className: 'stable' };
  };

  const formatDateTime = (dateStr) => formatDateIST(dateStr, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) || 'Time unavailable';

  const profile = data?.profile_info || {};
  const metrics = data?.metrics || {};
  const appointmentSummary = metrics.appointment_summary || {};
  const recentAppointments = data?.recent_appointments || [];
  const recentFlags = data?.recent_flags || [];
  const statusHistory = data?.status_history || [];
  const bmi = calculateBmi();
  const riskLevel = getRiskLevel();
  const profileCompletion = metrics.profile_completion ?? 0;
  const verificationItems = [
    { label: 'Email', complete: Boolean(data?.user_info.is_email_verified) },
    { label: 'Phone', complete: Boolean(data?.user_info.is_phone_verified) },
    { label: 'Identity', complete: Boolean(data?.user_info.is_verified || metrics.is_verified) },
    { label: 'Profile', complete: profileCompletion >= 80 }
  ];
  const verificationScore = verificationItems.filter((item) => item.complete).length;

  const getAppointmentDate = (appointment) => {
    if (appointment.appointment_start_utc) return formatDateTime(appointment.appointment_start_utc);
    return [appointment.appointment_date, appointment.appointment_time].filter(Boolean).join(' ') || 'Schedule unavailable';
  };

  if (!isOpen) return null;

  return (
    <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div 
        className={`patient-drawer ${wide ? 'wide' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div className="header-identity">
            <span className="clinical-label">
              <Activity size={12} />
              Secured Clinical Instance
            </span>
            <h2>
              {loading ? 'SYNCHRONIZING...' : data?.user_info.full_name || data?.profile_info.full_name}
            </h2>
            <div className="header-meta">
               <span className={`status-pill status-${String(data?.user_info.account_status || '').toLowerCase()}`}>
                  {data?.user_info.account_status}
                </span>
                <span className="patient-id-tag">
                  IDENTIFIER: <span>#{patientId}</span>
                </span>
            </div>
          </div>
          <div className="drawer-actions">
             <button title={wide ? "Collapse View" : "Expand View"} onClick={() => setWide(!wide)} className="action-btn-circle">
                 {wide ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
             </button>
             <button title="Close Instance" onClick={onClose} className="action-btn-circle close">
                <X size={18} />
             </button>
          </div>
        </div>

        <div className="drawer-tabs">
          {tabs.map(t => (
            <div 
              key={t.id} 
              className={`drawer-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon}
              {t.label}
            </div>
          ))}
        </div>

        <div className="drawer-body">
          {loading ? (
             <div className="drawer-loading">
                <div className="animate-pulse">SCANNING NODES...</div>
                <span>Establishing encrypted uplink</span>
             </div>
          ) : (
            <div className="drawer-content-pane">
              {activeTab === 'profile' && (
                <div className="tab-pane animate-in">
                   <div className="profile-summary-strip">
                      <div>
                        <span>Patient Identity</span>
                        <strong>{data?.user_info.full_name || profile.full_name || 'Unnamed Patient'}</strong>
                      </div>
                      <div>
                        <span>Age</span>
                        <strong>{calculateAge(profile.date_of_birth)}</strong>
                      </div>
                      <div>
                        <span>Blood Group</span>
                        <strong>{profile.blood_group || 'Not recorded'}</strong>
                      </div>
                      <div>
                        <span>Risk State</span>
                        <strong className={`risk-text ${riskLevel.className}`}>{riskLevel.label}</strong>
                      </div>
                   </div>

                   <div className="info-grid">
                      <div className="info-item">
                         <div className="info-label"><MapPinned size={12} /> Geographic Node</div>
                         <div className="info-value">{[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'UNDEFINED'}</div>
                      </div>
                      <div className="info-item">
                         <div className="info-label"><Phone size={12} /> Comm Link</div>
                         <div className="info-value">{profile.phone || 'DISCONNECTED'}</div>
                      </div>
                      <div className="info-item full">
                         <div className="info-label"><Mail size={12} /> Institutional Email</div>
                         <div className="info-value">{data?.user_info.email}</div>
                      </div>
                      <div className="info-item">
                         <div className="info-label"><Ruler size={12} /> Height</div>
                         <div className="info-value">{profile.height_cm ? `${profile.height_cm} cm` : 'Not recorded'}</div>
                      </div>
                      <div className="info-item">
                         <div className="info-label"><Weight size={12} /> Weight</div>
                         <div className="info-value">{profile.weight_kg ? `${profile.weight_kg} kg` : 'Not recorded'}</div>
                      </div>
                      <div className="info-item full">
                         <div className="info-label"><MapPin size={12} /> Registered Address</div>
                         <div className="info-value">{profile.address || 'No address on record'}</div>
                      </div>
                   </div>

                   <div className="profile-function-grid">
                      <div className="profile-function-panel">
                        <div className="section-header compact">
                          <ClipboardCheck size={14} />
                          Verification Readiness
                        </div>
                        <div className="profile-progress-row">
                          <span>{profileCompletion}% profile complete</span>
                          <strong>{verificationScore}/4 checks</strong>
                        </div>
                        <div className="profile-progress-track">
                          <span style={{ width: `${profileCompletion}%` }} />
                        </div>
                        <div className="verification-list">
                          {verificationItems.map((item) => (
                            <div key={item.label} className={item.complete ? 'complete' : 'pending'}>
                              <CheckCircle2 size={13} />
                              {item.label}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="profile-function-panel">
                        <div className="section-header compact">
                          <ListChecks size={14} />
                          Recent Care Snapshot
                        </div>
                        <div className="snapshot-list">
                          <div><span>Total appointments</span><strong>{metrics.appointments_total ?? 0}</strong></div>
                          <div><span>Completed sessions</span><strong>{appointmentSummary.completed ?? 0}</strong></div>
                          <div><span>Open flags</span><strong>{metrics.flags_open ?? 0}</strong></div>
                          <div><span>Audit events</span><strong>{metrics.audit_events ?? 0}</strong></div>
                        </div>
                      </div>
                   </div>

                   <div className="governance-section">
                      <div className="section-header">
                        <ShieldAlert size={14} />
                        Account Governance
                      </div>
                      <div className="btn-group">
                         {data?.user_info.account_status === 'active' ? (
                           <button 
                             className="gov-btn-danger"
                             disabled={updating}
                             onClick={() => openStatusDialog('suspended')}
                           >
                             <AlertTriangle size={14} />
                             Initialize Suspension
                           </button>
                         ) : (
                           <button 
                             className="gov-btn-success"
                             disabled={updating}
                             onClick={() => openStatusDialog('active')}
                           >
                             <CheckCircle2 size={14} />
                             Authorize Reactivation
                           </button>
                         )}
                         <button className="gov-btn-secondary">
                            <LogOut size={14} />
                            Force Session Terminate
                         </button>
                      </div>
                      {statusNotice && (
                        <div className="governance-notice" role="status">
                          {statusNotice}
                        </div>
                      )}
                   </div>

                   <div className="medical-context-panel">
                      <h4 className="section-title">Medical Context Archive</h4>
                      <div className="context-item">
                         <strong>Known Hypersensitivities:</strong>
                         <p>{profile.allergies || 'No critical data recorded'}</p>
                      </div>
                      <div className="context-item">
                         <strong>Chronic Pathology:</strong>
                         <p>{profile.chronic_conditions || 'Base state stable'}</p>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="tab-pane animate-in">
                   <div className="tab-section-intro">
                      <h3>Event History</h3>
                      <p>Recent governance and status activity for this patient account.</p>
                   </div>
                   <div className="audit-timeline">
                      {data?.audit_summary.map((log, index) => (
                        <div key={log.id || index} className="timeline-event">
                           <div className="event-dot" />
                           <div className="event-time">{formatDateTime(log.created_at)}</div>
                           <div className="event-type">{log.action_type || 'account_event'}</div>
                           <div className="event-desc">{log.description}</div>
                        </div>
                      ))}
                      {data?.audit_summary.length === 0 && (
                        <div className="empty-state">
                           No historical events found in local cluster.
                        </div>
                      )}
                   </div>

                   <div className="history-detail-grid">
                      <div className="history-panel">
                        <h4>Status Changes</h4>
                        {statusHistory.length > 0 ? statusHistory.map((log) => (
                          <div key={log.id} className="history-row">
                            <strong>{log.previous_status || 'none'} to {log.new_status}</strong>
                            <span>{formatDateTime(log.created_at)}</span>
                            <p>{log.reason || 'No reason recorded'}</p>
                          </div>
                        )) : <div className="empty-state compact">No status changes recorded.</div>}
                      </div>
                      <div className="history-panel">
                        <h4>Recent Flags</h4>
                        {recentFlags.length > 0 ? recentFlags.map((flag) => (
                          <div key={flag.id} className={`history-row severity-${flag.severity || 'medium'}`}>
                            <strong>{flag.category || 'Flag'} · {flag.severity || 'medium'}</strong>
                            <span>{formatDateTime(flag.created_at)}</span>
                            <p>{flag.reason || 'No flag reason recorded'}</p>
                          </div>
                        )) : <div className="empty-state compact">No flags recorded.</div>}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'clinical' && (
                <div className="tab-pane animate-in">
                   <div className="tab-section-intro">
                      <h3>Metric Analysis</h3>
                      <p>Operational, verification, and baseline clinical indicators from the current record.</p>
                   </div>

                   <div className="metric-hero-grid">
                      <div className={`metric-hero-card ${riskLevel.className}`}>
                        <Gauge size={18} />
                        <span>Governance Risk</span>
                        <strong>{riskLevel.label}</strong>
                      </div>
                      <div className="metric-hero-card">
                        <CalendarDays size={18} />
                        <span>Appointments</span>
                        <strong>{metrics.appointments_total ?? 0}</strong>
                      </div>
                      <div className="metric-hero-card">
                        <Flag size={18} />
                        <span>Open Flags</span>
                        <strong>{metrics.flags_open ?? 0}</strong>
                      </div>
                   </div>

                   <div className="metric-grid">
                      <div className="metric-card">
                        <HeartPulse size={18} />
                        <span>BMI</span>
                        <strong>{bmi.value}</strong>
                        <small>{bmi.label}</small>
                      </div>
                      <div className="metric-card">
                        <Droplets size={18} />
                        <span>Blood Group</span>
                        <strong>{profile.blood_group || 'Missing'}</strong>
                        <small>Clinical baseline</small>
                      </div>
                      <div className="metric-card">
                        <ShieldCheck size={18} />
                        <span>Identity Verified</span>
                        <strong>{metrics.is_verified ? 'Yes' : 'Pending'}</strong>
                        <small>Institutional validation</small>
                      </div>
                      <div className="metric-card">
                        <Mail size={18} />
                        <span>Email Verified</span>
                        <strong>{data?.user_info.is_email_verified ? 'Yes' : 'Pending'}</strong>
                        <small>Communication readiness</small>
                      </div>
                      <div className="metric-card">
                        <FileText size={18} />
                        <span>Audit Events</span>
                        <strong>{metrics.audit_events ?? 0}</strong>
                        <small>Recorded governance entries</small>
                      </div>
                      <div className="metric-card">
                        <TrendingUp size={18} />
                        <span>Total Flags</span>
                        <strong>{metrics.flags_total ?? 0}</strong>
                        <small>Lifetime risk markers</small>
                      </div>
                   </div>

                   <div className="analysis-split-grid">
                      <div className="analysis-panel">
                        <h4>Appointment Breakdown</h4>
                        <div className="analysis-bars">
                          {[
                            ['Completed', appointmentSummary.completed ?? 0],
                            ['Upcoming', appointmentSummary.upcoming ?? 0],
                            ['Cancelled', appointmentSummary.cancelled ?? 0],
                            ['Online', appointmentSummary.online ?? 0],
                            ['In person', appointmentSummary.in_person ?? 0]
                          ].map(([label, value]) => {
                            const total = Math.max(metrics.appointments_total || 0, 1);
                            return (
                              <div key={label} className="analysis-bar-row">
                                <div><span>{label}</span><strong>{value}</strong></div>
                                <div className="analysis-bar-track">
                                  <span style={{ width: `${Math.min((value / total) * 100, 100)}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="analysis-panel">
                        <h4>Recent Appointments</h4>
                        {recentAppointments.length > 0 ? recentAppointments.map((appointment) => (
                          <div key={appointment.id} className="appointment-mini-row">
                            {appointment.consultation_type === 'online' ? <Video size={14} /> : <Building2 size={14} />}
                            <div>
                              <strong>{appointment.doctor_name || 'Doctor pending'}</strong>
                              <span>{getAppointmentDate(appointment)}</span>
                            </div>
                            <em>{appointment.status || 'pending'}</em>
                          </div>
                        )) : <div className="empty-state compact">No appointments found.</div>}
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {statusDialog && (
          <div className="governance-dialog-backdrop" onClick={closeStatusDialog}>
            <form className="governance-dialog" onSubmit={handleStatusSubmit} onClick={(e) => e.stopPropagation()}>
              <div className="governance-dialog-header">
                <span className={`governance-dialog-icon ${statusDialog}`}>
                  {statusActions[statusDialog].icon}
                </span>
                <h3>{statusActions[statusDialog].title}</h3>
              </div>
              <label htmlFor="governance-reason">{statusActions[statusDialog].reasonLabel}</label>
              <textarea
                id="governance-reason"
                value={statusReason}
                onChange={(e) => {
                  setStatusReason(e.target.value);
                  if (statusError) setStatusError('');
                }}
                disabled={updating}
                rows={4}
                autoFocus
              />
              {statusError && <div className="governance-error" role="alert">{statusError}</div>}
              <div className="governance-dialog-actions">
                <button type="button" className="gov-btn-secondary" onClick={closeStatusDialog} disabled={updating}>
                  Cancel
                </button>
                <button type="submit" className={statusActions[statusDialog].buttonClass} disabled={updating}>
                  {updating ? <LoaderCircle size={14} className="spin-icon" /> : statusActions[statusDialog].icon}
                  {updating ? 'Processing...' : statusActions[statusDialog].submitLabel}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDrawer;
