import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Flag, 
  Calendar, 
  MoreVertical, 
  Mail, 
  ShieldCheck 
} from 'lucide-react';

const PatientTable = ({ patients, onSelectPatient }) => {
  const getFlagClass = (count) => {
    if (count === 0) return 'flag-safe';
    if (count <= 2) return 'flag-warn';
    return 'flag-danger';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="patient-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient Name</th>
            <th style={{ width: '200px' }}>Clinical Email</th>
            <th>Status</th>
            <th>Verif</th>
            <th>Appts</th>
            <th>Flags</th>
            <th>Joined</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td style={{ 
                fontFamily: 'JetBrains Mono, monospace', 
                color: 'var(--admin-accent)', 
                fontWeight: 700
              }}>
                #{p.id}
              </td>
              <td style={{ fontWeight: 800, color: 'var(--admin-text-main)' }}>{p.full_name}</td>
              <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>{p.email}</td>
              <td>
                <span className={`status-pill status-${p.account_status}`}>
                  {p.account_status}
                </span>
              </td>
              <td>
                <div className="verif-matrix" style={{ display: 'flex', gap: '10px' }}>
                  <span className={`verif-pill ${p.is_email_verified ? 'verified' : 'pending'}`} title={p.is_email_verified ? "Email Communication Secure" : "Email Uplink Pending"}>
                    <Mail size={12} strokeWidth={3} />
                  </span>
                  <span className={`verif-pill ${p.is_verified ? 'verified' : 'pending'}`} title={p.is_verified ? "Institutional Identity Verified" : "Identity Verification Required"}>
                    <ShieldCheck size={12} strokeWidth={3} />
                  </span>
                </div>
              </td>
              <td style={{ fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{p.appointments_total}</td>
              <td>
                <div className={`flag-nexus ${getFlagClass(p.flags_count)}`}>
                  <Flag size={10} fill="currentColor" />
                  <span className="flag-count">{p.flags_count}</span>
                </div>
              </td>
              <td style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
                  <Calendar size={12} />
                  {formatDate(p.created_at)}
                </div>
              </td>
              <td style={{ textAlign: 'center' }}>
                <button className="action-trigger" onClick={(e) => {
                  e.stopPropagation();
                  onSelectPatient(p);
                }}>
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
          {patients.length === 0 && (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center', padding: '5rem', color: 'var(--admin-text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                NO CLINICAL RECORDS MATCHING CURRENT FILTERS
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
