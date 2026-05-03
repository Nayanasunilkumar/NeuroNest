import React, { useEffect, useRef, useState } from 'react';
import { 
  Flag, 
  Calendar, 
  MoreVertical, 
  Mail, 
  ShieldCheck,
  Eye,
  History,
  Clipboard,
  AlertTriangle,
  CheckCircle2,
  UserX
} from 'lucide-react';

import { formatDateIST } from '../../utils/time';

const PatientTable = ({ patients, onSelectPatient, onOpenTimeline, onStatusAction, onCopyEmail }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFlagClass = (count) => {
    if (count === 0) return 'flag-safe';
    if (count <= 2) return 'flag-warn';
    return 'flag-danger';
  };

  const formatDate = (dateStr) => formatDateIST(dateStr, { year: 'numeric', month: 'short', day: 'numeric' }) || '—';

  const handleAction = (callback) => {
    setOpenMenuId(null);
    callback();
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
            <th>Appts</th>
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
                <span className={`status-pill status-${String(p.account_status || '').toLowerCase()}`}>
                  {p.account_status}
                </span>
              </td>
              <td style={{ fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{p.appointments_total}</td>
              <td style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
                  <Calendar size={12} />
                  {formatDate(p.created_at)}
                </div>
              </td>
              <td style={{ textAlign: 'center' }}>
                <div className="action-menu-wrap" ref={openMenuId === p.id ? menuRef : null}>
                  <button
                    className="action-trigger"
                    aria-label={`Open actions for ${p.full_name}`}
                    aria-expanded={openMenuId === p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId((current) => current === p.id ? null : p.id);
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === p.id && (
                    <div className="patient-action-menu">
                      <button type="button" onClick={() => handleAction(() => onSelectPatient(p))}>
                        <Eye size={14} />
                        View Profile
                      </button>
                      <button type="button" onClick={() => handleAction(() => onOpenTimeline(p))}>
                        <History size={14} />
                        Event History
                      </button>
                      <button type="button" onClick={() => handleAction(() => onCopyEmail(p.email))}>
                        <Clipboard size={14} />
                        Copy Email
                      </button>
                      <div className="patient-action-divider" />
                      {String(p.account_status || '').toLowerCase() === 'active' ? (
                        <button type="button" className="danger" onClick={() => handleAction(() => onStatusAction(p, 'suspended'))}>
                          <AlertTriangle size={14} />
                          Suspend Account
                        </button>
                      ) : (
                        <button type="button" className="success" onClick={() => handleAction(() => onStatusAction(p, 'active'))}>
                          <CheckCircle2 size={14} />
                          Reactivate Account
                        </button>
                      )}
                      {String(p.account_status || '').toLowerCase() !== 'deleted' && (
                        <button type="button" className="danger" onClick={() => handleAction(() => onStatusAction(p, 'deleted'))}>
                          <UserX size={14} />
                          Deactivate Account
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
