import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Megaphone, Star, Smartphone, Monitor, ShieldCheck, ChevronRight } from 'lucide-react';

const Toggle = ({ checked, onChange, disabled }) => (
  <button 
    className={`pset-toggle ${checked ? 'pset-toggle-on' : 'pset-toggle-off'}`}
    onClick={() => !disabled && onChange(!checked)} 
    disabled={disabled}
    style={{ cursor: disabled ? 'not-allowed' : 'pointer', flexShrink:0, border: 'none' }}
  >
    <div className="pset-toggle-knob" />
  </button>
);

const ROWS = [
  { key: 'appointments', icon: Bell,          label: 'Appointments', hint: 'Reminders for bookings, cancellations, & reschedules', color: '#6366f1' },
  { key: 'prescriptions', icon: ShieldCheck,   label: 'Prescriptions', hint: 'Alerts for new medications and renewal updates', color: '#10b981' },
  { key: 'messages',     icon: MessageSquare, label: 'Direct Messages', hint: 'Real-time replies and follow-ups from your providers', color: '#0ea5e9' },
  { key: 'announcements',icon: Megaphone,     label: 'System Updates', hint: 'Essential maintenance and feature announcements', color: '#8b5cf6' },
  { key: 'feedback',     icon: Star,          label: 'Health Surveys', hint: 'Periodic check-ins and appointment feedback requests', emailOnly: true, color: '#f59e0b' },
];

export default function NotificationPreferences({ data, saving, onSave }) {
  const [prefs, setPrefs] = useState({
    email_appointments:  true, email_prescriptions: true, email_messages: true,
    email_announcements: true, email_feedback: true,
    sms_appointments:    false, sms_prescriptions: false,
    inapp_appointments:  true, inapp_prescriptions: true,
    inapp_messages:      true, inapp_announcements: true,
    allow_doctor_followup: true, allow_promotions: false,
  });

  useEffect(() => {
    if (data?.notifications) setPrefs(p => ({ ...p, ...data.notifications }));
  }, [data]);

  const set = (k, v) => setPrefs(p => ({ ...p, [k]: v }));

  return (
    <div className="pset-section">
      <div className="pset-section-header">
        <Bell size={18} />
        <div>
          <h3>Notifications</h3>
          <p>Configure how NeuroNest communicates important medical updates with you</p>
        </div>
      </div>

      <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9', marginBottom: '2.5rem' }}>
        <div className="pset-notif-header" style={{ background: 'transparent', border: 'none', padding: '0 1.5rem 1rem 1.5rem' }}>
          <div style={{ flex:1 }}>Channel Support</div>
          <div className="pset-notif-col"><Mail size={12}/> Email</div>
          <div className="pset-notif-col"><Smartphone size={12}/> SMS</div>
          <div className="pset-notif-col"><Monitor size={12}/> Desktop</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {ROWS.map(({ key, icon: Icon, label, hint, emailOnly, color }) => (
            <div key={key} className="pset-toggle-row" style={{ background: '#fff' }}>
              <div style={{ flex:1, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: color + '10', color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="pset-toggle-label" style={{ fontSize: '0.95rem' }}>{label}</div>
                  <div className="pset-toggle-hint" style={{ fontSize: '0.8rem' }}>{hint}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="pset-notif-col">
                  <Toggle checked={prefs[`email_${key}`]} onChange={v => set(`email_${key}`, v)} disabled={saving} />
                </div>
                <div className="pset-notif-col">
                  {!emailOnly ? <Toggle checked={prefs[`sms_${key}`]} onChange={v => set(`sms_${key}`, v)} disabled={saving} />
                    : <div style={{ height: '26px', display: 'flex', alignItems: 'center', fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 800 }}>N/A</div>}
                </div>
                <div className="pset-notif-col">
                  {!emailOnly ? <Toggle checked={prefs[`inapp_${key}`]} onChange={v => set(`inapp_${key}`, v)} disabled={saving} />
                    : <div style={{ height: '26px', display: 'flex', alignItems: 'center', fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 800 }}>N/A</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pset-subsection" style={{ border: 'none', paddingTop: 0 }}>
        <div className="pset-subsection-title">
          <ShieldCheck size={16} /> Privacy & Outreach
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="pset-toggle-row" onClick={() => !saving && set('allow_doctor_followup', !prefs.allow_doctor_followup)} style={{ cursor: 'pointer' }}>
            <div style={{ flex: 1 }}>
              <div className="pset-toggle-label">Clinical Outreach</div>
              <div className="pset-toggle-hint">Allow doctors to initiate post-visit follow-ups</div>
            </div>
            <Toggle checked={prefs.allow_doctor_followup} onChange={() => {}} disabled={saving} />
          </div>

          <div className="pset-toggle-row" onClick={() => !saving && set('allow_promotions', !prefs.allow_promotions)} style={{ cursor: 'pointer' }}>
            <div style={{ flex: 1 }}>
              <div className="pset-toggle-label">Health Tips</div>
              <div className="pset-toggle-hint">Periodic educational content & campaigns</div>
            </div>
            <Toggle checked={prefs.allow_promotions} onChange={() => {}} disabled={saving} />
          </div>
        </div>
      </div>

      <button className="pset-save-btn" style={{ width: '100%', marginTop: '3rem' }} onClick={() => onSave(prefs)} disabled={saving}>
        {saving ? 'Syncing Preferences...' : 'Update Notification Policy'}
      </button>
    </div>
  );
}
