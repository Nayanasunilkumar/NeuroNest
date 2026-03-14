import React, { useState, useEffect } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { AlertTriangle, Clock, CheckCircle2, Activity } from 'lucide-react';

const AlertsDashboard = () => {
  const { alerts, markAcknowledged } = useAlerts() || { alerts: [], markAcknowledged: () => {} };
  
  const criticalCount = alerts.filter(a => !a.is_acknowledged).length; // We assume all are critical for now
  const activeAlerts = alerts.filter(a => !a.is_acknowledged);
  const historicAlerts = alerts.filter(a => a.is_acknowledged);

  return (
    <div className="container-fluid py-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
            <Activity className="text-danger" size={28} />
            Clinical Alerts Dashboard
          </h2>
          <p className="text-muted mb-0">Real-time patient monitoring and critical events</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-danger text-white h-100 transition-all hover-scale" style={{ transition: 'transform 0.2s' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="opacity-75 mb-1 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Active Critical</h6>
                  <h2 className="mb-0 fw-bold" style={{ fontSize: '2.5rem' }}>{criticalCount}</h2>
                </div>
                <div className="p-3 bg-white bg-opacity-25 rounded-circle shadow-sm">
                  <AlertTriangle size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-warning text-dark h-100 transition-all hover-scale" style={{ transition: 'transform 0.2s' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                   <h6 className="opacity-75 mb-1 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Warning</h6>
                   <h2 className="mb-0 fw-bold" style={{ fontSize: '2.5rem' }}>0</h2>
                </div>
                <div className="p-3 bg-dark bg-opacity-10 rounded-circle shadow-sm">
                  <Clock size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-info text-white h-100 transition-all hover-scale" style={{ transition: 'transform 0.2s' }}>
            <div className="card-body">
               <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="opacity-75 mb-1 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Total Acknowledged</h6>
                    <h2 className="mb-0 fw-bold" style={{ fontSize: '2.5rem' }}>{historicAlerts.length}</h2>
                  </div>
                  <div className="p-3 bg-white bg-opacity-25 rounded-circle shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm overflow-hidden border-top border-3 border-danger">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-3">
               <h5 className="fw-bold mb-0">Active Critical Alerts</h5>
            </div>
            <div className="card-body p-0">
               {activeAlerts.length === 0 ? (
                 <div className="text-center py-5">
                   <div className="d-inline-block p-4 rounded-circle bg-success bg-opacity-10 mb-3">
                     <CheckCircle2 size={48} className="text-success" />
                   </div>
                   <h5 className="text-dark fw-bold">Monitoring Stable</h5>
                   <p className="text-muted small">No critical alerts requiring immediate attention.</p>
                 </div>
               ) : (
                 <div className="table-responsive">
                   <table className="table table-hover align-middle mb-0">
                     <thead className="table-light">
                       <tr>
                         <th className="ps-4">Time</th>
                         <th>Patient ID</th>
                         <th>Vital</th>
                         <th>Value</th>
                         <th>Status</th>
                         <th className="pe-4 text-end">Action</th>
                       </tr>
                     </thead>
                     <tbody>
                       {activeAlerts.map(alert => (
                         <tr key={alert.id} className="bg-danger bg-opacity-10" style={{ backdropFilter: 'blur(10px)' }}>
                           <td className="ps-4 text-muted fw-medium">{new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                           <td className="fw-bold">#{alert.patient_id}</td>
                           <td><span className="badge bg-danger rounded-pill px-3 py-2">{alert.vital_type}</span></td>
                           <td className="fw-bold text-danger fs-5">{alert.value}</td>
                           <td><span className="text-danger small fw-bold d-flex align-items-center gap-1 pulse-active"><AlertTriangle size={14}/> CRITICAL</span></td>
                           <td className="pe-4 text-end">
                             <button onClick={() => markAcknowledged(alert.id)} className="btn btn-sm btn-danger fw-bold shadow-sm rounded-pill px-4">
                               Acknowledge
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
           <div className="card border-0 shadow-sm h-100 border-top border-3 border-secondary">
             <div className="card-header bg-white border-bottom-0 pt-4 pb-3">
               <h5 className="fw-bold mb-0">Alert History</h5>
             </div>
             <div className="card-body p-0">
               <div className="list-group list-group-flush max-vh-50 overflow-auto" style={{ maxHeight: '500px' }}>
                 {historicAlerts.length === 0 ? (
                    <div className="p-5 text-center text-muted">No historic alerts</div>
                 ) : historicAlerts.map(alert => (
                    <div key={alert.id} className="list-group-item p-4 border-bottom hover-bg-light transition-colors">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-secondary rounded-pill">{alert.vital_type}</span>
                        <small className="text-muted fw-medium">{new Date(alert.acknowledged_at || alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                      </div>
                      <p className="mb-2 fw-bold text-dark">{alert.message}</p>
                      <div className="d-flex justify-content-between align-items-end">
                        <small className="text-muted fw-medium">Value: <span className="text-dark fw-bold">{alert.value}</span> • Patient #{alert.patient_id}</small>
                        <small className="text-success fw-bold d-flex align-items-center gap-1 bg-success bg-opacity-10 px-2 py-1 rounded-pill">
                            <CheckCircle2 size={12}/> Ack by #{alert.acknowledged_by}
                        </small>
                      </div>
                    </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsDashboard;
