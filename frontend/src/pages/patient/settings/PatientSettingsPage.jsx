import React, { useState, useMemo } from 'react';
import { Shield, Eye, Bell, Package, Trash2, CheckCircle, AlertCircle, Settings, ChevronRight, User } from 'lucide-react';
import { usePatientSettings } from './hooks/usePatientSettings';
import SecuritySection          from './components/SecuritySection';
import NotificationPreferences  from './components/NotificationPreferences';
import DataManagementSection    from './components/DataManagementSection';
import DangerZoneSection        from './components/DangerZoneSection';
import './PatientSettingsPage.css';

const SECTIONS = [
  { id: 'security',      label: 'Security',            icon: Shield,  desc: 'Password & Protection' },
  { id: 'notifications', label: 'Notifications',       icon: Bell,    desc: 'Alerts & Messages' },
  { id: 'data',          label: 'Data & Records',      icon: Package, desc: 'Export & download' },
  { id: 'danger',        label: 'Danger Zone',         icon: Trash2,  desc: 'Account Deletion', danger: true },
];

export default function PatientSettingsPage() {
  const [active, setActive] = useState('security');
  const {
    settings, securityActivity, loading, saving, exporting, error, success,
    updateNotifications, updateEmail,
    changePassword, exportData, exportReport, exportAppts, exportPresc, deleteAccount,
  } = usePatientSettings();

  // Memoize the rendered section to prevent unnecessary re-renders of the content area
  const currentSection = useMemo(() => {
    if (loading) return (
      <div className="pset-loading">
        <div className="pset-spinner" />
        <p>Fetching your preferences…</p>
      </div>
    );
    switch (active) {
      case 'security':      return <SecuritySection         data={settings} activity={securityActivity} saving={saving} onChangePassword={changePassword} onUpdateEmail={updateEmail} />;
      case 'notifications': return <NotificationPreferences data={settings} saving={saving} onSave={updateNotifications} />;
      case 'data':          return <DataManagementSection   saving={saving} exporting={exporting} onExport={exportData} onExportPDF={exportReport} onExportAppts={exportAppts} onExportPresc={exportPresc} />;
      case 'danger':        return <DangerZoneSection       onDelete={deleteAccount} />;
      default:              return null;
    }
  }, [active, loading, settings, securityActivity, saving]);

  return (
    <div className="pset-page-wrapper">
      <div className="pset-root">
        {/* Header Area */}
        <div className="pset-page-header">
          <div className="pset-title-wrap">
            <h1>Settings</h1>
            <p>Configure your account security and application preferences</p>
          </div>
        </div>

        {/* Top Navigation Bar */}
        <nav className="pset-topbar">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                className={`pset-nav-item ${active === s.id ? 'active' : ''} ${s.danger ? 'danger-item' : ''}`}
                onClick={() => setActive(s.id)}
              >
                <div className="pset-nav-icon"><Icon size={18}/></div>
                <div className="pset-nav-label">{s.label}</div>
              </button>
            );
          })}
        </nav>

        {/* Main content */}
        <div className="pset-content">
          {success && (
            <div className="pset-flash success">
              <CheckCircle size={20}/>
              <span>{success}</span>
            </div>
          )}
          {error && !loading && (
            <div className="pset-flash error">
              <AlertCircle size={20}/>
              <span>{error}</span>
            </div>
          )}

          {currentSection}
        </div>
      </div>
    </div>
  );
}
