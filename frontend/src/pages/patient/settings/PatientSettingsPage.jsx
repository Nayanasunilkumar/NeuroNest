import React, { useState } from 'react';
import { Shield, Eye, Bell, Package, Trash2, CheckCircle, AlertCircle, Settings, ChevronRight, User } from 'lucide-react';
import { usePatientSettings } from './hooks/usePatientSettings';
import SecuritySection          from './components/SecuritySection';
import PrivacySection           from './components/PrivacySection';
import NotificationPreferences  from './components/NotificationPreferences';
import DataManagementSection    from './components/DataManagementSection';
import DangerZoneSection        from './components/DangerZoneSection';

const SECTIONS = [
  { id: 'security',      label: 'Security',            icon: Shield,  desc: 'Password & Protection' },
  { id: 'privacy',       label: 'Privacy Controls',    icon: Eye,     desc: 'Data sharing & consent' },
  { id: 'notifications', label: 'Notifications',       icon: Bell,    desc: 'Alerts & Messages' },
  { id: 'data',          label: 'Data & Records',      icon: Package, desc: 'Export & download' },
  { id: 'danger',        label: 'Danger Zone',         icon: Trash2,  desc: 'Account Deletion', danger: true },
];

export default function PatientSettingsPage() {
  const [active, setActive] = useState('security');
  const {
    settings, loading, saving, error, success,
    updateNotifications, updatePrivacy,
    changePassword, exportData, deleteAccount,
  } = usePatientSettings();

  const renderSection = () => {
    if (loading) return (
      <div className="pset-loading">
        <div className="pset-spinner" />
        <p>Fetching your preferences…</p>
      </div>
    );
    switch (active) {
      case 'security':      return <SecuritySection         data={settings} saving={saving} onChangePassword={changePassword} />;
      case 'privacy':       return <PrivacySection          data={settings} saving={saving} onSave={updatePrivacy} />;
      case 'notifications': return <NotificationPreferences data={settings} saving={saving} onSave={updateNotifications} />;
      case 'data':          return <DataManagementSection   saving={saving} onExport={exportData} />;
      case 'danger':        return <DangerZoneSection       onDelete={deleteAccount} />;
      default:              return null;
    }
  };

  return (
    <>
      <style>{`
        .pset-root { 
          max-width:1100px; 
          margin:0 auto; 
          padding:3rem 1.5rem; 
          font-family:'Inter', system-ui, -apple-system, sans-serif; 
          color: #1e293b;
        }

        /* Top Bar Navigation */
        .pset-topbar {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
          margin-bottom: 3rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          scrollbar-width: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .pset-topbar::-webkit-scrollbar { display: none; }

        .pset-nav-item { 
          display:flex; 
          align-items:center; 
          gap:0.75rem; 
          padding:0.75rem 1.25rem; 
          border-radius:14px; 
          cursor:pointer; 
          transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          border:none; 
          background:none; 
          white-space: nowrap;
          color: #64748b;
        }
        .pset-nav-item:hover { background:#f8fafc; color: #1e293b; }
        .pset-nav-item.active { 
          background: #4f46e5; 
          color: white; 
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
        }
        .pset-nav-item.danger-item:hover { background:#fef2f2; color: #ef4444; }
        .pset-nav-item.danger-item.active { background: #ef4444; box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3); }

        .pset-nav-icon { 
          display:flex; 
          align-items:center; 
          justify-content:center; 
        }
        .pset-nav-label { font-size:0.9rem; font-weight:700; }

        /* Header / Profile Area */
        .pset-page-header { 
          margin-bottom:2rem; 
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }
        .pset-title-wrap h1 { font-size:2.25rem; font-weight:950; color:#0f172a; margin:0 0 0.5rem 0; letter-spacing: -0.03em; }
        .pset-title-wrap p { font-size:1rem; color:#64748b; margin:0; }

        .pset-user-chip {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.25rem;
          background: white;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .pset-user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 1rem;
        }
        .pset-user-info { display: flex; flex-direction: column; }
        .pset-user-name { font-size: 0.9rem; font-weight: 800; color: #0f172a; }
        .pset-user-email { font-size: 0.75rem; color: #64748b; }

        /* Premium Section Cards */
        .pset-content { min-width:0; }
        .pset-section { 
          background: #ffffff;
          border-radius: 28px; 
          padding: 3rem; 
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          animation: sectionFadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
        }
        @keyframes sectionFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pset-section-header { display:flex; align-items:flex-start; gap:1rem; margin-bottom:2.5rem; padding-bottom:1.5rem; border-bottom:1px solid #f1f5f9; }
        .pset-section-header svg { color:#4f46e5; flex-shrink:0; margin-top:4px; }
        .pset-section-header h3 { font-size:1.25rem; font-weight:900; color:#0f172a; margin:0 0 0.35rem 0; }
        .pset-section-header p { font-size:0.875rem; color:#64748b; margin:0; line-height: 1.5; }

        /* Forms & Fields (Restored) */
        .pset-grid1 { display:flex; flex-direction:column; gap:1.5rem; }
        .pset-field { display:flex; flex-direction:column; gap:0.5rem; }
        .pset-field label { font-size:0.875rem; font-weight:800; color:#475569; }
        .pset-field input::placeholder { color: #64748b; opacity: 1; }
        .pset-field input, .pset-field select {
          height:52px; padding:0 1.25rem; border:1.5px solid #e2e8f0; border-radius:14px;
          font-size:0.95rem; background:#f8fafc; color:#0f172a; transition:all 0.2s;
          outline:none; width:100%; box-sizing:border-box;
        }
        .pset-field input:focus { border-color:#4f46e5; box-shadow:0 0 0 4px rgba(79, 70, 229, 0.1); background: white; }
        .pset-field input.pset-error-border { border-color: #ef4444; }
        .pset-icon-input { position:relative; display:flex; align-items:center; }
        .pset-icon-input svg:first-child { position:absolute; left:1rem; color:#94a3b8; }
        .pset-icon-input input { padding-left:2.75rem; }

        /* Toggles (Restored) */
        .pset-toggle { width:46px; height:26px; border-radius:99px; position:relative; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink:0; }
        .pset-toggle-on  { background:#4f46e5; }
        .pset-toggle-off { background:#e2e8f0; }
        .pset-toggle-knob { position:absolute; top:4px; width:18px; height:18px; background:#fff; border-radius:50%; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow:0 2px 4px rgba(0,0,0,0.1); }
        .pset-toggle-on .pset-toggle-knob  { left:24px; }
        .pset-toggle-off .pset-toggle-knob { left:4px; }
        .pset-toggle-row { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 0; border-bottom:1px solid #f1f5f9; gap:1.5rem; }
        .pset-toggle-label { font-size:1rem; font-weight:700; color:#1e293b; }
        .pset-toggle-hint { font-size:0.85rem; color:#64748b; margin-top:4px; line-height:1.5; }

        /* Notification table (Restored) */
        .pset-notif-table { border:1px solid #e2e8f0; border-radius:20px; overflow:hidden; margin-top: 1rem; }
        .pset-notif-header { display:flex; align-items:center; padding:1rem 1.5rem; background:#f8fafc; font-size:0.75rem; font-weight:900; color:#64748b; text-transform:uppercase; letter-spacing:0.1em; border-bottom:1px solid #e2e8f0; }
        .pset-notif-row { display:flex; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid #f1f5f9; gap:2rem; }
        .pset-notif-col { width:70px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .pset-notif-label { font-size:0.95rem; font-weight:700; color:#1e293b; }
        .pset-notif-hint { font-size:0.8rem; color:#94a3b8; margin-top:2px; }

        /* Subsection (Restored) */
        .pset-subsection { margin-top:3rem; border-top:1px solid #f1f5f9; padding-top:2.5rem; }
        .pset-subsection-title { 
          font-size:0.85rem; 
          font-weight:900; 
          color:#64748b; 
          text-transform:uppercase; 
          letter-spacing:0.12em; 
          margin-bottom:1.5rem; 
          display:flex; 
          align-items:center; 
          gap:0.6rem; 
        }

        /* Utilities */
        .pset-flash { display:flex; align-items:center; gap:1rem; padding:1.25rem; border-radius:18px; margin-bottom:2.5rem; font-size:1rem; font-weight:700; border: 1px solid transparent; }
        .pset-flash.success { background:#ecfdf5; color:#065f46; border-color:#d1fae5; }
        .pset-flash.error   { background:#fef2f2; color:#991b1b; border-color:#fee2e2; }
        
        .pset-info-chip { display:flex; align-items:center; gap:0.75rem; font-size:0.875rem; color:#4f46e5; background:#eff6ff; border:1px solid #dbeafe; border-radius:14px; padding:1rem 1.25rem; margin-top:2rem; }
        .pset-inline-error { display:flex; align-items:center; gap:0.5rem; color:#ef4444; font-size:0.85rem; font-weight:700; margin-top: 0.5rem; }

        .pset-save-btn {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          padding: 1rem 3rem;
          border-radius: 16px;
          font-weight: 800;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          margin-top: 2.5rem;
        }
        .pset-save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4); filter: brightness(1.1); }
        .pset-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Loading & Empty states */
        .pset-loading { display:flex; flex-direction:column; align-items:center; gap:1.5rem; padding:8rem 0; color:#94a3b8; }
        .pset-spinner { width:48px; height:48px; border:4px solid #f1f5f9; border-top-color:#4f46e5; border-radius:50%; animation:psSpin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        @keyframes psSpin { to{transform:rotate(360deg)} }

        /* Export Cards */
        .pset-export-list { display:grid; grid-template-columns: 1fr; gap:1rem; margin-top: 1.5rem; }
        .pset-export-card { display:flex; align-items:center; gap:1.25rem; padding:1.25rem 1.5rem; background:#fff; border:1.5px solid #e2e8f0; border-radius:20px; cursor:pointer; transition:all 0.3s; width:100%; text-align: left; }
        .pset-export-card:hover { border-color:#4f46e5; background: #f8fafc; transform: scale(1.02); }
        .pset-export-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .pset-export-title { font-size:1rem; font-weight:800; color:#1e293b; }
        .pset-export-desc { font-size:0.85rem; color:#64748b; margin-top:2px; }

        /* Modal Enhancement */
        .pset-modal-backdrop { position:fixed; inset:0; background:rgba(15, 23, 42, 0.7); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:9999; }
        .pset-modal { background:#fff; border-radius:32px; padding:3rem; max-width:480px; width:90%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .pset-modal-title { font-size:1.5rem; font-weight:950; color:#0f172a; text-align:center; margin-bottom: 1rem; letter-spacing: -0.02em; }
        .pset-modal-cancel { background: #f1f5f9; padding: 1rem; border-radius: 14px; color: #475569; font-weight: 700; border: none; cursor: pointer; flex: 1; transition: all 0.2s; }
        .pset-modal-cancel:hover { background: #e2e8f0; }
        .pset-modal-danger { background: #ef4444; padding: 1rem; border-radius: 14px; color: white; font-weight: 800; border: none; cursor: pointer; flex: 1; transition: all 0.2s; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
        .pset-modal-danger:hover { background: #dc2626; transform: translateY(-2px); }
      `}</style>

      <div className="pset-root">
        {/* Header Area */}
        <div className="pset-page-header">
          <div className="pset-title-wrap">
            <h1>Settings</h1>
            <p>Configure your account security and application preferences</p>
          </div>
          <div className="pset-user-chip">
            <div className="pset-user-avatar">
              {settings?.account?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="pset-user-info">
              <span className="pset-user-name">{settings?.account?.full_name || 'Loading...'}</span>
              <span className="pset-user-email">{settings?.account?.email || ''}</span>
            </div>
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

          {renderSection()}
        </div>
      </div>
    </>
  );
}
