import React, { useState } from 'react';
import { Download, FileText, Calendar, Pill, Package } from 'lucide-react';

const ExportCard = ({ icon: Icon, title, description, color, onClick, loading }) => (
  <button className="pset-export-card" onClick={onClick} disabled={loading}>
    <div className="pset-export-icon" style={{ background: color + '15', color }}>
      <Icon size={20} />
    </div>
    <div style={{ flex: 1, textAlign: 'left' }}>
      <div className="pset-export-title">{title}</div>
      <div className="pset-export-desc">{description}</div>
    </div>
    <Download size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
  </button>
);

export default function DataManagementSection({ onExport, saving }) {
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    const data = await onExport();
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `neuronest_data_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 4000);
    }
  };

  return (
    <div className="pset-section">
      <div className="pset-section-header">
        <Package size={18} />
        <div>
          <h3>Data &amp; Records</h3>
          <p>Download your health records and manage your data rights</p>
        </div>
      </div>

      <div className="pset-privacy-notice" style={{ borderColor:'#3b82f615', background:'#eff6ff' }}>
        📋 Under data protection regulations, you have the right to access and download all personal data we hold about you.
      </div>

      <div className="pset-export-list">
        <ExportCard
          icon={Package} color="#6366f1" loading={saving}
          title="Full Data Export (GDPR)" description="All your data in one file — appointments, prescriptions, profile"
          onClick={handleExport}
        />
        <ExportCard
          icon={Calendar} color="#0ea5e9" loading={false}
          title="Appointment History" description="Navigate to My Appointments and use the export or print option"
          onClick={() => window.open('/patient/appointments', '_self')}
        />
        <ExportCard
          icon={Pill} color="#10b981" loading={false}
          title="Prescription History" description="Navigate to My Prescriptions to view and print each prescription"
          onClick={() => window.open('/patient/prescriptions', '_self')}
        />
        <ExportCard
          icon={FileText} color="#f59e0b" loading={false}
          title="Medical Records" description="View and download from My Medical Records"
          onClick={() => window.open('/patient/medical-records', '_self')}
        />
      </div>

      {exported && (
        <div className="pset-info-chip" style={{ marginTop:'1rem', color:'#10b981', borderColor:'#10b98130' }}>
          ✅ Data export downloaded successfully!
        </div>
      )}

      <div className="pset-data-notice">
        <strong>Data Retention Policy:</strong> Your data is retained for a minimum of 7 years as required by medical regulations. Upon account deletion, your records are anonymised, not destroyed.
      </div>
    </div>
  );
}
