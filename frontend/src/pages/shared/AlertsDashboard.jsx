import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAlerts } from '../../context/AlertContext';
import { fetchAlerts } from '../../api/alertsApi';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Info,
} from 'lucide-react';

const SEVERITY_COLORS = {
  critical: { border: '#dc2626', bg: '#fee2e2', text: '#991b1b', chip: 'bg-danger' },
  warning: { border: '#f97316', bg: '#ffedd5', text: '#9a3412', chip: 'bg-warning text-dark' },
  info: { border: '#2563eb', bg: '#dbeafe', text: '#1e40af', chip: 'bg-info' },
};

const TIME_WINDOWS = {
  '1h': 1,
  '24h': 24,
  '7d': 168,
};

const isDeviceAlert = (alert) => {
  const source = `${alert.vital_type || ''} ${alert.message || ''}`.toLowerCase();
  return ['device', 'sensor', 'disconnected', 'offline', 'battery'].some((keyword) => source.includes(keyword));
};

const normalizeSeverity = (alert) => {
  const raw = String(alert.severity || '').toLowerCase();
  if (raw.includes('critical')) return 'critical';
  if (raw.includes('warn')) return 'warning';
  if (raw.includes('info')) return 'info';
  if (isDeviceAlert(alert)) return 'warning';
  return 'critical';
};

const formatAlertValue = (alert) => {
  const value = alert?.value;
  if (value === null || value === undefined || value === '') return 'N/A';
  const vital = String(alert.vital_type || '').toLowerCase();
  if (vital.includes('spo2') || vital.includes('oxygen')) return `${Math.round(Number(value))}%`;
  if (vital.includes('heart')) return `${Math.round(Number(value))} BPM`;
  if (vital.includes('temp')) return `${Number(value).toFixed(1)}°C`;
  return String(value);
};

const getNormalRange = (vitalType) => {
  const vital = String(vitalType || '').toLowerCase();
  if (vital.includes('spo2') || vital.includes('oxygen')) return '95-100%';
  if (vital.includes('heart')) return '60-100 BPM';
  if (vital.includes('temp')) return '36.1-37.5°C';
  return 'N/A';
};

const getTrendPoints = (alerts, selectedAlert) => {
  if (!selectedAlert) return [];
  return alerts
    .filter(
      (item) =>
        item.patient_id === selectedAlert.patient_id &&
        item.vital_type === selectedAlert.vital_type &&
        item.value !== null &&
        item.value !== undefined,
    )
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-8)
    .map((item) => Number(item.value))
    .filter((value) => Number.isFinite(value));
};

const Sparkline = ({ points = [] }) => {
  if (points.length < 2) return <div className="small text-muted">Trend data not available</div>;
  const width = 240;
  const height = 70;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const polylinePoints = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} role="img" aria-label="alert trend chart">
      <rect x="0" y="0" width={width} height={height} fill="#f8fafc" rx="8" />
      <polyline fill="none" stroke="#dc2626" strokeWidth="3" points={polylinePoints} />
    </svg>
  );
};

const AlertsDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { alerts: liveAlerts, unreadCount, markAcknowledged } = useAlerts() || {
    alerts: [],
    unreadCount: 0,
    markAcknowledged: async () => {},
  };

  const [allAlerts, setAllAlerts] = useState([]);
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [historyDate, setHistoryDate] = useState('');
  const [historySeverity, setHistorySeverity] = useState('all');
  const [historyPatient, setHistoryPatient] = useState(searchParams.get('patientId') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const mergeAndSortAlerts = useCallback((incoming, existing = []) => {
    const mergedMap = new Map(existing.map((item) => [item.id, item]));
    incoming.forEach((item) => mergedMap.set(item.id, { ...mergedMap.get(item.id), ...item }));
    return [...mergedMap.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, []);

  const loadAllAlerts = useCallback(async () => {
    try {
      const data = await fetchAlerts(false);
      setAllAlerts((prev) => mergeAndSortAlerts(Array.isArray(data) ? data : [], prev));
      setError('');
    } catch (loadError) {
      setError('Failed to load alert history.');
      console.error('Failed to load alerts history:', loadError);
    } finally {
      setIsLoading(false);
    }
  }, [mergeAndSortAlerts]);

  useEffect(() => {
    loadAllAlerts();
    const interval = setInterval(loadAllAlerts, 30000);
    return () => clearInterval(interval);
  }, [loadAllAlerts]);

  useEffect(() => {
    if (!liveAlerts?.length) return;
    setAllAlerts((prev) => mergeAndSortAlerts(liveAlerts, prev));
  }, [liveAlerts, mergeAndSortAlerts]);

  const scopedAlerts = useMemo(() => {
    const hours = TIME_WINDOWS[timeFilter] || 24;
    const since = Date.now() - hours * 60 * 60 * 1000;
    const byTime = allAlerts.filter((alert) => new Date(alert.created_at).getTime() >= since);
    if (severityFilter === 'all') return byTime;
    return byTime.filter((alert) => normalizeSeverity(alert) === severityFilter);
  }, [allAlerts, timeFilter, severityFilter]);

  const activeAlerts = useMemo(() => scopedAlerts.filter((alert) => !alert.is_acknowledged), [scopedAlerts]);
  const criticalAlerts = useMemo(
    () => activeAlerts.filter((alert) => normalizeSeverity(alert) === 'critical'),
    [activeAlerts],
  );
  const warningAlerts = useMemo(
    () => activeAlerts.filter((alert) => normalizeSeverity(alert) === 'warning'),
    [activeAlerts],
  );
  const deviceAlerts = useMemo(() => activeAlerts.filter((alert) => isDeviceAlert(alert)), [activeAlerts]);
  const resolvedCount = useMemo(() => scopedAlerts.filter((alert) => alert.is_acknowledged).length, [scopedAlerts]);
  const infoCount = useMemo(
    () => activeAlerts.filter((alert) => normalizeSeverity(alert) === 'info').length,
    [activeAlerts],
  );
  const timelineAlerts = useMemo(() => scopedAlerts.slice(0, 10), [scopedAlerts]);

  useEffect(() => {
    if (!selectedAlertId && criticalAlerts.length) {
      setSelectedAlertId(criticalAlerts[0].id);
      return;
    }
    if (selectedAlertId && !allAlerts.some((alert) => alert.id === selectedAlertId)) {
      setSelectedAlertId(criticalAlerts[0]?.id || activeAlerts[0]?.id || null);
    }
  }, [allAlerts, selectedAlertId, criticalAlerts, activeAlerts]);

  const selectedAlert =
    allAlerts.find((item) => item.id === selectedAlertId) || criticalAlerts[0] || activeAlerts[0] || null;
  const trendPoints = useMemo(() => getTrendPoints(allAlerts, selectedAlert), [allAlerts, selectedAlert]);

  const historyAlerts = useMemo(() => {
    return allAlerts
      .filter((alert) => alert.is_acknowledged)
      .filter((alert) => {
        if (historySeverity !== 'all' && normalizeSeverity(alert) !== historySeverity) return false;
        if (historyPatient && String(alert.patient_id) !== String(historyPatient).trim()) return false;
        if (historyDate) {
          const day = new Date(alert.created_at).toISOString().slice(0, 10);
          if (day !== historyDate) return false;
        }
        return true;
      })
      .slice(0, 50);
  }, [allAlerts, historyDate, historySeverity, historyPatient]);

  const handleAcknowledge = async (alertId) => {
    await markAcknowledged(alertId);
    setAllAlerts((prev) =>
      prev.map((item) =>
        item.id === alertId
          ? {
              ...item,
              is_acknowledged: true,
              acknowledged_at: new Date().toISOString(),
            }
          : item,
      ),
    );
  };

  const handleViewPatient = (patientId) => {
    if (location.pathname.startsWith('/doctor')) {
      navigate(`/doctor/patient-hub?patientId=${patientId}`);
      return;
    }
    navigate('/patient/dashboard');
  };

  const handlePlaceholderAction = (action) => {
    window.alert(`${action} workflow will be connected to backend actions next.`);
  };

  const renderAlertCard = (alert, tone = 'critical') => {
    const colors = SEVERITY_COLORS[tone];
    return (
      <div
        key={alert.id}
        className="card border-0 shadow-sm mb-3"
        style={{ borderLeft: `5px solid ${colors.border}`, background: colors.bg, cursor: 'pointer' }}
        onClick={() => setSelectedAlertId(alert.id)}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div>
              <div className="small text-uppercase fw-bold mb-2" style={{ color: colors.text, letterSpacing: '0.06em' }}>
                {tone === 'critical' ? 'Critical Alert' : tone === 'warning' ? 'Warning Alert' : 'Info Alert'}
              </div>
              <h6 className="fw-bold mb-2">Patient #{alert.patient_id}</h6>
              <p className="mb-1 fw-semibold">
                {alert.vital_type}: {formatAlertValue(alert)}
              </p>
              <p className="mb-1 text-muted small">{alert.message}</p>
              <div className="small text-muted">
                Normal Range: {getNormalRange(alert.vital_type)} | Time:{' '}
                {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {!alert.is_acknowledged && (
              <button
                className="btn btn-sm btn-danger rounded-pill px-3 fw-semibold"
                onClick={(event) => {
                  event.stopPropagation();
                  handleAcknowledge(alert.id);
                }}
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
            <Activity size={26} className="text-danger" />
            Alerts
          </h2>
          <p className="text-muted mb-0">Monitor critical health events and device warnings in real time.</p>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span className="badge rounded-pill text-bg-dark d-flex align-items-center gap-2 px-3 py-2">
            <Bell size={14} />
            {unreadCount} unread
          </span>
          <div className="btn-group">
            {['all', 'critical', 'warning', 'info'].map((option) => (
              <button
                key={option}
                type="button"
                className={`btn btn-sm ${severityFilter === option ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setSeverityFilter(option)}
              >
                {option === 'all' ? 'All' : option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
          <div className="btn-group">
            {['1h', '24h', '7d'].map((option) => (
              <button
                key={option}
                type="button"
                className={`btn btn-sm ${timeFilter === option ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => setTimeFilter(option)}
              >
                {option === '1h' ? 'Last 1h' : option === '24h' ? '24h' : '7 days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#fee2e2' }}>
            <div className="card-body">
              <div className="small text-uppercase fw-bold text-danger mb-1">Critical Alerts</div>
              <div className="h3 mb-0 fw-black">{criticalAlerts.length}</div>
              <div className="small text-muted">Active</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#ffedd5' }}>
            <div className="card-body">
              <div className="small text-uppercase fw-bold" style={{ color: '#9a3412' }}>Warnings</div>
              <div className="h3 mb-0 fw-black">{warningAlerts.length}</div>
              <div className="small text-muted">Active</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#dbeafe' }}>
            <div className="card-body">
              <div className="small text-uppercase fw-bold text-primary mb-1">Info</div>
              <div className="h3 mb-0 fw-black">{infoCount}</div>
              <div className="small text-muted">Active</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#ecfeff' }}>
            <div className="card-body">
              <div className="small text-uppercase fw-bold text-dark mb-1">Resolved</div>
              <div className="h3 mb-0 fw-black">{resolvedCount}</div>
              <div className="small text-muted">Acknowledged</div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? <div className="alert alert-light border">Loading alerts...</div> : null}
      {error ? <div className="alert alert-warning border">{error}</div> : null}

      <div className="row g-4">
        <div className="col-xl-8">
          <section className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <AlertTriangle size={18} className="text-danger" />
              <h5 className="mb-0 fw-bold">Active Critical Alerts</h5>
            </div>
            <div className="card-body">
              {criticalAlerts.length ? criticalAlerts.map((alert) => renderAlertCard(alert, 'critical')) : (
                <p className="text-muted mb-0">No critical alerts in this time window.</p>
              )}
            </div>
          </section>

          <section className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <Clock size={18} style={{ color: '#ea580c' }} />
              <h5 className="mb-0 fw-bold">Warning Alerts</h5>
            </div>
            <div className="card-body">
              {warningAlerts.length ? warningAlerts.map((alert) => renderAlertCard(alert, 'warning')) : (
                <p className="text-muted mb-0">No warning alerts in this time window.</p>
              )}
            </div>
          </section>

          <section className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <Activity size={18} className="text-secondary" />
              <h5 className="mb-0 fw-bold">Alert Timeline</h5>
            </div>
            <div className="card-body">
              {timelineAlerts.length ? (
                <div className="d-flex flex-column gap-3">
                  {timelineAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="d-flex gap-3 align-items-start border-bottom pb-3"
                      role="button"
                      onClick={() => setSelectedAlertId(alert.id)}
                    >
                      <div className="text-nowrap small text-muted fw-semibold">
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{alert.message}</div>
                        <div className="small text-muted">
                          Patient #{alert.patient_id} | {alert.vital_type} | {formatAlertValue(alert)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">Timeline is empty for the selected filters.</p>
              )}
            </div>
          </section>

          <section className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <Info size={18} className="text-primary" />
              <h5 className="mb-0 fw-bold">Device Alerts</h5>
            </div>
            <div className="card-body">
              {deviceAlerts.length ? (
                <div className="d-flex flex-column gap-3">
                  {deviceAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-3 border"
                      style={{ borderLeft: '4px solid #ea580c', background: '#fff7ed' }}
                    >
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="fw-semibold">{alert.message}</div>
                          <div className="small text-muted">Patient #{alert.patient_id} | Source: {alert.vital_type}</div>
                        </div>
                        <div className="small text-muted">
                          {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No active device connectivity warnings.</p>
              )}
            </div>
          </section>

          <section className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex align-items-center justify-content-between flex-wrap gap-2">
              <h5 className="mb-0 fw-bold">Alert History</h5>
              <div className="d-flex flex-wrap gap-2">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={historyDate}
                  onChange={(event) => setHistoryDate(event.target.value)}
                />
                <select
                  className="form-select form-select-sm"
                  value={historySeverity}
                  onChange={(event) => setHistorySeverity(event.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Patient ID"
                  value={historyPatient}
                  onChange={(event) => setHistoryPatient(event.target.value)}
                />
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Time</th>
                      <th>Patient</th>
                      <th>Type</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyAlerts.length ? historyAlerts.map((alert) => {
                      const severity = normalizeSeverity(alert);
                      return (
                        <tr key={alert.id} role="button" onClick={() => setSelectedAlertId(alert.id)}>
                          <td className="ps-3">{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td>Patient #{alert.patient_id}</td>
                          <td>{alert.vital_type}</td>
                          <td>
                            <span className={`badge ${SEVERITY_COLORS[severity].chip}`}>
                              {severity.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">No matching history records.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <div className="col-xl-4">
          <aside className="card border-0 shadow-sm sticky-top" style={{ top: '1rem' }}>
            <div className="card-header bg-white">
              <h5 className="mb-0 fw-bold">Alert Details</h5>
            </div>
            <div className="card-body">
              {selectedAlert ? (
                <>
                  <div className="mb-3">
                    <div className="small text-muted mb-1">Patient</div>
                    <div className="fw-semibold">Patient #{selectedAlert.patient_id}</div>
                  </div>
                  <div className="mb-3">
                    <div className="small text-muted mb-1">Vital</div>
                    <div className="fw-semibold">{selectedAlert.vital_type}</div>
                  </div>
                  <div className="mb-3">
                    <div className="small text-muted mb-1">Value</div>
                    <div className="fw-semibold">{formatAlertValue(selectedAlert)}</div>
                  </div>
                  <div className="mb-3">
                    <div className="small text-muted mb-1">Normal Range</div>
                    <div className="fw-semibold">{getNormalRange(selectedAlert.vital_type)}</div>
                  </div>
                  <div className="mb-3">
                    <div className="small text-muted mb-1">Time</div>
                    <div className="fw-semibold">
                      {new Date(selectedAlert.created_at).toLocaleString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="small text-muted mb-2">Trend Before Alert</div>
                    <Sparkline points={trendPoints} />
                  </div>
                  <div className="d-grid gap-2">
                    <button className="btn btn-danger" onClick={() => handleAcknowledge(selectedAlert.id)} disabled={selectedAlert.is_acknowledged}>
                      {selectedAlert.is_acknowledged ? 'Acknowledged' : 'Acknowledge'}
                    </button>
                    <button className="btn btn-outline-dark" onClick={() => handlePlaceholderAction('Add Clinical Note')}>
                      <FileText size={16} className="me-2" />
                      Add Clinical Note
                    </button>
                    <button className="btn btn-outline-dark" onClick={() => handlePlaceholderAction('Schedule Appointment')}>
                      Schedule Appointment
                    </button>
                    <button className="btn btn-outline-dark" onClick={() => handlePlaceholderAction('Notify Patient')}>
                      Notify Patient
                    </button>
                    <button className="btn btn-outline-primary" onClick={() => handleViewPatient(selectedAlert.patient_id)}>
                      View Patient
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-muted mb-0">Select an alert to see details and actions.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AlertsDashboard;
