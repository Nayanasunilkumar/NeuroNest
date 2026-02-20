import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Megaphone, Star, Smartphone, Monitor } from 'lucide-react';

const Toggle = ({ checked, onChange }) => (
  <div className={`pset-toggle ${checked ? 'pset-toggle-on' : 'pset-toggle-off'}`}
    onClick={() => onChange(!checked)} style={{ cursor:'pointer', flexShrink:0 }}>
    <div className="pset-toggle-knob" />
  </div>
);

const ROWS = [
  { key: 'appointments', icon: Bell,          label: 'Appointment Reminders', hint: 'Upcoming bookings, cancellations, and reschedules' },
  { key: 'prescriptions', icon: Smartphone,   label: 'Prescription Alerts',   hint: 'New prescriptions and medication updates' },
  { key: 'messages',     icon: MessageSquare, label: 'Doctor Messages',        hint: 'Replies and follow-ups from your doctors' },
  { key: 'announcements',icon: Megaphone,     label: 'System Announcements',   hint: 'Important updates from NeuroNest' },
  { key: 'feedback',     icon: Star,          label: 'Feedback Reminders',     hint: 'Reminder to review your recent appointments', emailOnly: true },
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
          <h3>Notification Preferences</h3>
          <p>Control how and when you receive updates</p>
        </div>
      </div>

      {/* Main notification matrix */}
      <div className="pset-notif-table">
        <div className="pset-notif-header">
          <div style={{ flex:1 }}>Notification Type</div>
          <div className="pset-notif-col"><Mail size={13}/>Email</div>
          <div className="pset-notif-col"><Smartphone size={13}/>SMS</div>
          <div className="pset-notif-col"><Monitor size={13}/>In-App</div>
        </div>
        {ROWS.map(({ key, icon: Icon, label, hint, emailOnly }) => (
          <div key={key} className="pset-notif-row">
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                <Icon size={14} style={{ color:'#6366f1' }}/>
                <span className="pset-notif-label">{label}</span>
              </div>
              <span className="pset-notif-hint">{hint}</span>
            </div>
            <div className="pset-notif-col">
              <Toggle checked={prefs[`email_${key}`]} onChange={v => set(`email_${key}`, v)} />
            </div>
            <div className="pset-notif-col">
              {!emailOnly ? <Toggle checked={prefs[`sms_${key}`]} onChange={v => set(`sms_${key}`, v)} />
                : <span style={{ color:'#cbd5e1', fontSize:'0.7rem' }}>N/A</span>}
            </div>
            <div className="pset-notif-col">
              {!emailOnly ? <Toggle checked={prefs[`inapp_${key}`]} onChange={v => set(`inapp_${key}`, v)} />
                : <span style={{ color:'#cbd5e1', fontSize:'0.7rem' }}>N/A</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Communication prefs */}
      <div className="pset-subsection" style={{ marginTop:'1.5rem' }}>
        <div className="pset-subsection-title"><MessageSquare size={14}/>Communication Preferences</div>
        <div className="pset-toggles-list">
          <div className="pset-toggle-row" style={{cursor:'pointer'}} onClick={() => set('allow_doctor_followup', !prefs.allow_doctor_followup)}>
            <div>
              <div className="pset-toggle-label">Allow doctor follow-up messages</div>
              <div className="pset-toggle-hint">Doctors may send you health follow-ups after consultations</div>
            </div>
            <div className={`pset-toggle ${prefs.allow_doctor_followup ? 'pset-toggle-on' : 'pset-toggle-off'}`}><div className="pset-toggle-knob"/></div>
          </div>
          <div className="pset-toggle-row" style={{cursor:'pointer'}} onClick={() => set('allow_promotions', !prefs.allow_promotions)}>
            <div>
              <div className="pset-toggle-label">Promotional messages</div>
              <div className="pset-toggle-hint">Health tips, offers, and campaigns from NeuroNest</div>
            </div>
            <div className={`pset-toggle ${prefs.allow_promotions ? 'pset-toggle-on' : 'pset-toggle-off'}`}><div className="pset-toggle-knob"/></div>
          </div>
        </div>
      </div>

      <button className="pset-save-btn" disabled={saving} onClick={() => onSave(prefs)}>
        {saving ? 'Saving…' : 'Save Notification Settings'}
      </button>
    </div>
  );
}
