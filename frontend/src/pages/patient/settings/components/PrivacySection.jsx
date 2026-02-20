import React, { useState, useEffect } from 'react';
import { Eye, BarChart2, Share2, UserX } from 'lucide-react';

const Toggle = ({ checked, onChange, label, hint, icon: Icon }) => (
  <div className="pset-toggle-row" onClick={() => onChange(!checked)} style={{ cursor: 'pointer' }}>
    <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
      {Icon && <div className="pset-toggle-icon"><Icon size={15}/></div>}
      <div>
        <div className="pset-toggle-label">{label}</div>
        {hint && <div className="pset-toggle-hint">{hint}</div>}
      </div>
    </div>
    <div className={`pset-toggle ${checked ? 'pset-toggle-on' : 'pset-toggle-off'}`}>
      <div className="pset-toggle-knob" />
    </div>
  </div>
);

export default function PrivacySection({ data, saving, onSave }) {
  const [prefs, setPrefs] = useState({
    share_history_with_doctors: true,
    allow_analytics: true,
    allow_anonymous_feedback: true,
  });

  useEffect(() => {
    if (data?.notifications) {
      const n = data.notifications;
      setPrefs({
        share_history_with_doctors: n.share_history_with_doctors ?? true,
        allow_analytics:            n.allow_analytics ?? true,
        allow_anonymous_feedback:   n.allow_anonymous_feedback ?? true,
      });
    }
  }, [data]);

  const set = (k, v) => setPrefs(p => ({ ...p, [k]: v }));

  return (
    <div className="pset-section">
      <div className="pset-section-header">
        <Eye size={18} />
        <div>
          <h3>Privacy Controls</h3>
          <p>Manage how your health data is used and shared</p>
        </div>
      </div>

      <div className="pset-privacy-notice">
        🔒 Your medical data is always encrypted and never sold. These controls let you fine-tune how it is used within NeuroNest.
      </div>

      <div className="pset-toggles-list">
        <Toggle
          icon={Share2} checked={prefs.share_history_with_doctors}
          onChange={v => set('share_history_with_doctors', v)}
          label="Share medical history with treating doctors"
          hint="Allows any doctor you consult to view your full visit history for better care continuity."
        />
        <Toggle
          icon={BarChart2} checked={prefs.allow_analytics}
          onChange={v => set('allow_analytics', v)}
          label="Allow anonymous analytics"
          hint="Helps NeuroNest improve services. Data is fully anonymised — your identity is never shared."
        />
        <Toggle
          icon={UserX} checked={prefs.allow_anonymous_feedback}
          onChange={v => set('allow_anonymous_feedback', v)}
          label="Submit feedback anonymously by default"
          hint="Your reviews will not include your name. You can still override this per review."
        />
      </div>

      <button className="pset-save-btn" disabled={saving} onClick={() => onSave(prefs)}>
        {saving ? 'Saving…' : 'Save Privacy Settings'}
      </button>
    </div>
  );
}
