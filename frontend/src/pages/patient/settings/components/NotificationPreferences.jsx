import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Mail,
  Megaphone,
  MessageSquare,
  Monitor,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';

const Toggle = ({ checked, onChange, disabled }) => (
  <button
    className={`pset-toggle ${checked ? 'pset-toggle-on' : 'pset-toggle-off'}`}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    style={{ cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0, border: 'none' }}
  >
    <div className="pset-toggle-knob" />
  </button>
);

const DELIVERY_ROWS = [
  { key: 'appointments', icon: Bell, label: 'Appointments', hint: 'Booking reminders, cancellations, and reschedules', color: '#6366f1' },
  { key: 'prescriptions', icon: ShieldCheck, label: 'Prescriptions', hint: 'Medication issues and renewal updates', color: '#10b981' },
  { key: 'messages', icon: MessageSquare, label: 'Messages', hint: 'Provider chat replies and follow-ups', color: '#0ea5e9' },
  { key: 'announcements', icon: Megaphone, label: 'Announcements', hint: 'Clinic-wide updates and important notices', color: '#f97316' },
  { key: 'feedback', icon: Sparkles, label: 'Feedback Requests', hint: 'Post-visit surveys and care experience prompts', color: '#ec4899' },
  { key: 'alerts', icon: AlertCircle, label: 'Clinical Alerts', hint: 'High-priority vitals and urgent health events', color: '#ef4444' },
];

const PRIVACY_ROWS = [
  {
    key: 'allow_anonymous_feedback',
    icon: Sparkles,
    label: 'Anonymous Feedback',
    hint: 'Let the app collect feedback without attaching your identity where supported.',
    color: '#8b5cf6',
  },
  {
    key: 'share_history_with_doctors',
    icon: UserCheck,
    label: 'Share History With Doctors',
    hint: 'Allow doctors to view your relevant medical history during care.',
    color: '#14b8a6',
  },
  {
    key: 'allow_analytics',
    icon: ShieldCheck,
    label: 'Product Analytics',
    hint: 'Help improve the product through usage analytics.',
    color: '#64748b',
  },
];

const baseNotificationState = {
  email_appointments: true,
  email_prescriptions: true,
  email_messages: true,
  email_announcements: true,
  email_feedback: true,
  email_alerts: true,
  inapp_appointments: true,
  inapp_prescriptions: true,
  inapp_messages: true,
  inapp_announcements: true,
  inapp_feedback: true,
  inapp_alerts: true,
  allow_anonymous_feedback: true,
  share_history_with_doctors: true,
  allow_analytics: true,
};

const cardStyle = {
  padding: '1.5rem',
  background: '#f8fafc',
  borderRadius: '24px',
  border: '1px solid #f1f5f9',
  marginBottom: '1.5rem',
};

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  marginBottom: '1rem',
};

export default function NotificationPreferences({ data, saving, onSave }) {
  const basePrefs = useMemo(() => ({
    ...baseNotificationState,
    ...(data?.notifications || {}),
  }), [data]);

  const [overrides, setOverrides] = useState({});
  const prefs = { ...basePrefs, ...overrides };

  const set = (key, value) => setOverrides((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="pset-section">
      <div className="pset-section-header">
        <Bell size={18} />
        <div>
          <h3>Notifications</h3>
          <p>Choose which medical updates reach you and which permissions stay enabled.</p>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={sectionTitleStyle}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--nn-text-main)' }}>Delivery Preferences</h4>
            <p style={{ margin: '0.35rem 0 0 0', color: 'var(--nn-text-secondary)', fontSize: '0.85rem' }}>
              Control the channels used for each type of patient communication.
            </p>
          </div>
        </div>

        <div className="pset-notif-header" style={{ background: 'transparent', border: 'none', padding: '0 1.5rem 1rem 1.5rem' }}>
          <div style={{ flex: 1 }}>Update Type</div>
          <div className="pset-notif-col"><Mail size={12} /> Email</div>
          <div className="pset-notif-col"><Monitor size={12} /> In-App</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {DELIVERY_ROWS.map(({ key, icon, label, hint, color }) => (
            <div key={key} className="pset-toggle-row" style={{ background: '#fff', padding: '1rem 1.25rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}10`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {React.createElement(icon, { size: 18 })}
                </div>
                <div>
                  <div className="pset-toggle-label" style={{ fontSize: '0.95rem' }}>{label}</div>
                  <div className="pset-toggle-hint" style={{ fontSize: '0.8rem' }}>{hint}</div>
                </div>
              </div>

              <div className="pset-notif-col">
                <Toggle checked={prefs[`email_${key}`]} onChange={(value) => set(`email_${key}`, value)} disabled={saving} />
              </div>
              <div className="pset-notif-col">
                <Toggle checked={prefs[`inapp_${key}`]} onChange={(value) => set(`inapp_${key}`, value)} disabled={saving} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 0 }}>
        <div style={sectionTitleStyle}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--nn-text-main)' }}>Privacy & Consent</h4>
            <p style={{ margin: '0.35rem 0 0 0', color: 'var(--nn-text-secondary)', fontSize: '0.85rem' }}>
              Keep these controls here for now so account preferences stay in one place.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {PRIVACY_ROWS.map(({ key, icon, label, hint, color }) => (
            <div key={key} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #eef2ff', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}10`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {React.createElement(icon, { size: 18 })}
              </div>
              <div style={{ flex: 1 }}>
                <div className="pset-toggle-label" style={{ fontSize: '0.95rem' }}>{label}</div>
                <div className="pset-toggle-hint" style={{ fontSize: '0.8rem' }}>{hint}</div>
              </div>
              <Toggle checked={prefs[key]} onChange={(value) => set(key, value)} disabled={saving} />
            </div>
          ))}
        </div>
      </div>

      <button className="pset-save-btn" style={{ width: '100%', marginTop: '3rem' }} onClick={() => onSave(prefs)} disabled={saving}>
        {saving ? 'Syncing Preferences...' : 'Update Notification Policy'}
      </button>
    </div>
  );
}
