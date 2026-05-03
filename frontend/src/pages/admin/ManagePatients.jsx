import React, { useState, useEffect } from 'react';
import PatientTable from '../../components/admin/PatientTable';
import PatientFilters from '../../components/admin/PatientFilters';
import PatientDrawer from '../../components/admin/PatientDrawer';
import { fetchPatients, updatePatientStatus } from '../../services/adminPatientAPI';
import '../../styles/admin-manage-patients.css';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState('profile');
  const [statusDialog, setStatusDialog] = useState(null);
  const [statusReason, setStatusReason] = useState('');
  const [statusError, setStatusError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await fetchPatients({ search, status });
      setPatients(data.patients);
    } catch (err) {
      console.error("Failed to load patients", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setDrawerInitialTab('profile');
    setSelectedPatientId(patient.id);
    setIsDrawerOpen(true);
  };

  const handleOpenTimeline = (patient) => {
    setDrawerInitialTab('timeline');
    setSelectedPatientId(patient.id);
    setIsDrawerOpen(true);
  };

  const handleStatusAction = (patient, nextStatus) => {
    setStatusDialog({ patient, nextStatus });
    setStatusReason('');
    setStatusError('');
    setActionNotice('');
  };

  const getStatusActionCopy = (nextStatus) => {
    if (nextStatus === 'active') {
      return {
        title: 'Authorize Reactivation',
        reason: 'Reason for Reactivation',
        success: 'User reactivated successfully',
        submitClass: 'status-success-btn'
      };
    }
    if (nextStatus === 'deleted') {
      return {
        title: 'Deactivate Account',
        reason: 'Reason for Deactivation',
        success: 'User deactivated successfully',
        submitClass: 'status-danger-btn'
      };
    }
    return {
      title: 'Initialize Suspension',
      reason: 'Reason for Suspension',
      success: 'User suspended successfully',
      submitClass: 'status-danger-btn'
    };
  };

  const closeStatusDialog = () => {
    if (statusUpdating) return;
    setStatusDialog(null);
    setStatusReason('');
    setStatusError('');
  };

  const handleStatusSubmit = async (event) => {
    event.preventDefault();
    if (!statusDialog || statusUpdating) return;

    const reason = statusReason.trim();
    if (!reason) {
      setStatusError('Reason is required.');
      return;
    }

    try {
      setStatusUpdating(true);
      setStatusError('');
      await updatePatientStatus(statusDialog.patient.id, {
        status: statusDialog.nextStatus,
        reason
      });
      setPatients((current) => current.map((patient) => (
        patient.id === statusDialog.patient.id
          ? { ...patient, account_status: statusDialog.nextStatus }
          : patient
      )));
      setActionNotice(getStatusActionCopy(statusDialog.nextStatus).success);
      setStatusDialog(null);
      setStatusReason('');
    } catch (err) {
      setStatusError(err?.response?.data?.error || 'Failed to update user status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCopyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      setActionNotice('Email copied to clipboard');
    } catch {
      setActionNotice('Copy failed. Select the email manually.');
    }
  };

  return (
    <div className="manage-patients-page">
      <header className="manage-header">
        <div className="manage-welcome-text">
          <h1>Clinical Nexus</h1>
          <p>
             Patient Governance & Integrated Risk Control
          </p>
        </div>
        <div className="manage-header-stats">
             <div className="stat-item">
                <div className="stat-label">Total Patients</div>
                <div className="stat-value">{patients.length}</div>
             </div>
             <div className="stat-item">
                <div className="stat-label">Suspended</div>
                <div className="stat-value" style={{color: 'var(--admin-danger)'}}>
                    {patients.filter(p => p.account_status === 'suspended').length}
                </div>
             </div>
             <div className="stat-item">
                <div className="stat-label">Active Today</div>
                <div className="stat-value" style={{color: 'var(--admin-success)'}}>
                    {patients.filter(p => p.account_status === 'active').length}
                </div>
             </div>
        </div>
      </header>

      <PatientFilters 
        search={search} 
        setSearch={setSearch} 
        status={status} 
        setStatus={setStatus} 
      />

      {actionNotice && (
        <div className="patient-action-notice" role="status">
          {actionNotice}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '8rem', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', color: 'var(--admin-accent)', letterSpacing: '0.2em' }}>
           <div className="animate-pulse">INITIALIZING CLINICAL NEXUS...</div>
           <div style={{fontSize: '0.7rem', marginTop: '1rem', opacity: 0.5}}>ESTABLISHING SECURE DATA UPLINK</div>
        </div>
      ) : (
        <PatientTable 
          patients={patients} 
          onSelectPatient={handleSelectPatient}
          onOpenTimeline={handleOpenTimeline}
          onStatusAction={handleStatusAction}
          onCopyEmail={handleCopyEmail}
        />
      )}

      <PatientDrawer 
        patientId={selectedPatientId} 
        isOpen={isDrawerOpen} 
        initialTab={drawerInitialTab}
        onClose={() => setIsDrawerOpen(false)}
        onRefresh={loadPatients}
      />

      {statusDialog && (
        <div className="patient-status-dialog-overlay" onClick={closeStatusDialog}>
          <form className="patient-status-dialog" onSubmit={handleStatusSubmit} onClick={(event) => event.stopPropagation()}>
            <h3>
              {getStatusActionCopy(statusDialog.nextStatus).title}
            </h3>
            <p>
              {statusDialog.patient.full_name} #{statusDialog.patient.id}
            </p>
            <label htmlFor="patient-action-reason">
              {getStatusActionCopy(statusDialog.nextStatus).reason}
            </label>
            <textarea
              id="patient-action-reason"
              value={statusReason}
              onChange={(event) => {
                setStatusReason(event.target.value);
                if (statusError) setStatusError('');
              }}
              disabled={statusUpdating}
              rows={4}
              autoFocus
            />
            {statusError && <div className="patient-status-error" role="alert">{statusError}</div>}
            <div className="patient-status-actions">
              <button type="button" className="status-cancel-btn" onClick={closeStatusDialog} disabled={statusUpdating}>
                Cancel
              </button>
              <button
                type="submit"
                className={getStatusActionCopy(statusDialog.nextStatus).submitClass}
                disabled={statusUpdating}
              >
                {statusUpdating ? 'Processing...' : 'OK'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManagePatients;
