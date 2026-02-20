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
  CheckCircle2
} from 'lucide-react';
import { fetchPatientDetail, updatePatientStatus } from '../../services/adminPatientAPI';

const PatientDrawer = ({ patientId, isOpen, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      loadDetail();
    } else {
      setData(null);
    }
  }, [isOpen, patientId]);

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

  const handleStatusChange = async (newStatus) => {
    const reason = prompt(`Establish reason for ${newStatus.toUpperCase()} protocol:`);
    if (!reason) return;

    try {
      setUpdating(true);
      await updatePatientStatus(patientId, { status: newStatus, reason });
      await loadDetail();
      onRefresh(); 
    } catch (err) {
      alert("CRITICAL ERROR: Failed to update node status.");
    } finally {
      setUpdating(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Clinical Profile', icon: <User size={16} /> },
    { id: 'timeline', label: 'Event History', icon: <Clock size={16} /> },
    { id: 'clinical', label: 'Metric Analysis', icon: <Stethoscope size={16} /> }
  ];

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
               <span className={`status-pill status-${data?.user_info.account_status}`}>
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
                   <div className="info-grid">
                      <div className="info-item">
                         <div className="info-label"><MapPin size={12} /> Geographic Node</div>
                         <div className="info-value">{data?.profile_info.city || 'UNDEFINED'}</div>
                      </div>
                      <div className="info-item">
                         <div className="info-label"><Phone size={12} /> Comm Link</div>
                         <div className="info-value">{data?.profile_info.phone || 'DISCONNECTED'}</div>
                      </div>
                      <div className="info-item full">
                         <div className="info-label"><User size={12} /> Institutional Email</div>
                         <div className="info-value">{data?.user_info.email}</div>
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
                             onClick={() => handleStatusChange('suspended')}
                           >
                             <AlertTriangle size={14} />
                             Initialize Suspension
                           </button>
                         ) : (
                           <button 
                             className="gov-btn-success"
                             disabled={updating}
                             onClick={() => handleStatusChange('active')}
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
                   </div>

                   <div className="medical-context-panel">
                      <h4 className="section-title">Medical Context Archive</h4>
                      <div className="context-item">
                         <strong>Known Hypersensitivities:</strong>
                         <p>{data?.profile_info.allergies || 'No critical data recorded'}</p>
                      </div>
                      <div className="context-item">
                         <strong>Chronic Pathology:</strong>
                         <p>{data?.profile_info.chronic_conditions || 'Base state stable'}</p>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="tab-pane animate-in">
                   <div className="audit-timeline">
                      {data?.audit_summary.map((log, i) => (
                        <div key={i} className="timeline-event">
                           <div className="event-dot" />
                           <div className="event-time">{log.created_at}</div>
                           <div className="event-desc">{log.description}</div>
                        </div>
                      ))}
                      {data?.audit_summary.length === 0 && (
                        <div className="empty-state">
                           No historical events found in local cluster.
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDrawer;
