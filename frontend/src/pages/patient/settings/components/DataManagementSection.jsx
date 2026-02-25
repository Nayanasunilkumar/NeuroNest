import React, { useState } from 'react';
import { Download, FileText, Calendar, Pill, Package, FileCheck, ChevronRight, Share2 } from 'lucide-react';

const ExportCard = ({ icon: Icon, title, description, color, onClick, loading, actionText = "Download PDF" }) => (
  <button 
    className="pset-export-card" 
    onClick={onClick} 
    disabled={loading}
    style={{ '--card-color': color }}
  >
    <div className="pset-export-icon" style={{ background: color + '15', color }}>
      <Icon size={24} />
    </div>
    <div style={{ flex: 1 }}>
      <div className="pset-export-title">{title}</div>
      <div className="pset-export-desc">{description}</div>
    </div>
    <div className="pset-export-footer">
      <div className="pset-export-action">
        {loading ? 'Processing...' : actionText}
        <ChevronRight size={14} />
      </div>
      <Download size={16} style={{ color: '#94a3b8' }} />
    </div>
  </button>
);

export default function DataManagementSection({ onExport, onExportPDF, onExportAppts, onExportPresc, saving }) {
  const [exported, setExported] = useState(false);

  const _triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 4000);
  };

  const handleExportJSON = async () => {
    try {
      const data = await onExport();
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        _triggerDownload(blob, `neuronest_data_export_${new Date().toISOString().split('T')[0]}.json`);
      }
    } catch (e) { console.error(e); }
  };

  const handleExportPDF = async () => {
    try {
      const response = await onExportPDF();
      if (response && response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        _triggerDownload(blob, `neuronest_medical_report_${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (e) { console.error(e); }
  };

  const handleExportAppts = async () => {
    try {
      const response = await onExportAppts();
      if (response && response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        _triggerDownload(blob, `neuronest_appointments_${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (e) { console.error(e); }
  };

  const handleExportPresc = async () => {
    try {
      const response = await onExportPresc();
      if (response && response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        _triggerDownload(blob, `neuronest_prescriptions_${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="pset-section data-mgmt">
      <div className="pset-section-header">
        <Share2 size={18} />
        <div>
          <h3>Data &amp; Records</h3>
          <p>Securely manage your personal health information and medical archives</p>
        </div>
      </div>

      <div className="pset-privacy-notice" style={{ borderColor:'#4f46e515', background:'#f5f3ff', color: '#4c1d95' }}>
        <Shield size={16} />
        Your health data is encrypted and protected under HIPAA and GDPR standards. You have the right to portability.
      </div>

      <div className="pset-export-list">
        <ExportCard
          icon={FileCheck} color="#4f46e5" loading={saving}
          title="Full Medical Report" description="A comprehensive clinical summary of your entire medical history with us."
          onClick={handleExportPDF}
        />
        <ExportCard
          icon={Calendar} color="#0ea5e9" loading={saving}
          title="Appointment History" description="Archive of all your consultations, past visits, and upcoming schedules."
          onClick={handleExportAppts}
        />
        <ExportCard
          icon={Pill} color="#10b981" loading={saving}
          title="Prescription Log" description="Detailed list of all prescribed medications and dosage instructions."
          onClick={handleExportPresc}
        />
        <ExportCard
          icon={Package} color="#6366f1" loading={saving}
          title="Personal Data Archive" actionText="Download JSON"
          description="Machine-readable archive for backup or porting your data to other systems."
          onClick={handleExportJSON}
        />
      </div>

      {exported && (
        <div className="pset-info-chip" style={{ marginTop:'2rem', color:'#059669', borderColor:'#10b98130', background: '#ecfdf5' }}>
          <FileCheck size={16} />
          <span>Document generated and downloaded successfully!</span>
        </div>
      )}

      <div className="pset-data-notice">
        <strong>Digital Rights & Retention:</strong> 
        <br />
        In accordance with healthcare regulations, your clinical records are retained for 7 years. 
        Metadata is anonymized upon account closure to protect your identity while preserving medical research data integrity.
      </div>
    </div>
  );
}

const Shield = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
