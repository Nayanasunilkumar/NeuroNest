import React, { useState, useEffect } from 'react';
import PatientTable from '../../components/admin/PatientTable';
import PatientFilters from '../../components/admin/PatientFilters';
import PatientDrawer from '../../components/admin/PatientDrawer';
import { fetchPatients } from '../../services/adminPatientAPI';
import '../../styles/admin-manage-patients.css';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadPatients();
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
    setSelectedPatientId(patient.id);
    setIsDrawerOpen(true);
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
             <div className="stat-item">
                <div className="stat-label">High Risk</div>
                <div className="stat-value" style={{color: 'var(--admin-warning)'}}>
                    {patients.filter(p => p.flags_count > 2).length}
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

      {loading ? (
        <div style={{ padding: '8rem', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', color: 'var(--admin-accent)', letterSpacing: '0.2em' }}>
           <div className="animate-pulse">INITIALIZING CLINICAL NEXUS...</div>
           <div style={{fontSize: '0.7rem', marginTop: '1rem', opacity: 0.5}}>ESTABLISHING SECURE DATA UPLINK</div>
        </div>
      ) : (
        <PatientTable 
          patients={patients} 
          onSelectPatient={handleSelectPatient} 
        />
      )}

      <PatientDrawer 
        patientId={selectedPatientId} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        onRefresh={loadPatients}
      />
    </div>
  );
};

export default ManagePatients;
