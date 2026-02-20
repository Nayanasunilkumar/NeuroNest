import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';

export default function SecuritySection({ data, saving, onChangePassword }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [show, setShow] = useState({ cur: false, new: false, con: false });
  const [pwError, setPwError] = useState('');

  const strength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  const s = strength(form.new_password);

  const handleSubmit = () => {
    if (form.new_password !== form.confirm_password) { setPwError('Passwords do not match'); return; }
    if (form.new_password.length < 8) { setPwError('Must be at least 8 characters'); return; }
    setPwError('');
    onChangePassword({ current_password: form.current_password, new_password: form.new_password });
    setForm({ current_password: '', new_password: '', confirm_password: '' });
  };

  const Input = ({ field, showKey, label, placeholder }) => (
    <div className="pset-field">
      <label>{label}</label>
      <div className="pset-icon-input" style={{ position: 'relative' }}>
        <Lock size={14} />
        <input
          type={show[showKey] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
          placeholder={placeholder}
          style={{ paddingRight: '2.5rem' }}
        />
        <button type="button" onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}
          style={{ position:'absolute', right:'0.6rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
          {show[showKey] ? <EyeOff size={15}/> : <Eye size={15}/>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="pset-section">
      <div className="pset-section-header">
        <Shield size={18} />
        <div>
          <h3>Security</h3>
          <p>Manage your password and account security</p>
        </div>
      </div>

      <div className="pset-grid1">
        <Input field="current_password" showKey="cur" label="Current Password" placeholder="Enter current password" />
        <Input field="new_password"     showKey="new" label="New Password"     placeholder="Enter new password" />

        {/* Password strength */}
        {form.new_password && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '0.25rem' }}>
            <div style={{ display:'flex', gap:'4px', marginBottom:'4px' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height:'4px', flex:1, borderRadius:'4px', background: i <= s ? strengthColor[s] : '#e2e8f0', transition:'background 0.3s' }} />
              ))}
            </div>
            <span style={{ fontSize:'0.7rem', color: strengthColor[s], fontWeight:700 }}>{strengthLabel[s]}</span>
          </div>
        )}

        <Input field="confirm_password" showKey="con" label="Confirm New Password" placeholder="Repeat new password" />
        {pwError && <div className="pset-inline-error"><AlertTriangle size={13}/>{pwError}</div>}
      </div>

      <div className="pset-info-chip">
        <Shield size={13} />
        For security, you'll remain logged in after changing your password.
      </div>

      {/* 2FA stub */}
      <div className="pset-toggle-row" style={{marginTop:'1.25rem', opacity:0.5, cursor:'not-allowed'}}>
        <div>
          <div className="pset-toggle-label">Two-Factor Authentication (2FA)</div>
          <div className="pset-toggle-hint">Currently unavailable — coming soon</div>
        </div>
        <div className="pset-toggle pset-toggle-off" />
      </div>

      <button className="pset-save-btn" disabled={saving || !form.current_password || !form.new_password} onClick={handleSubmit}>
        {saving ? 'Updating…' : 'Change Password'}
      </button>
    </div>
  );
}
