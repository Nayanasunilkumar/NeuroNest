import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';

const SecurityInput = ({ field, value, onChange, show, onToggleShow, label, placeholder }) => (
  <div className="pset-field">
    <label>{label}</label>
    <div className="pset-icon-input" style={{ position: 'relative' }}>
      <Lock size={14} />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingRight: '2.5rem' }}
      />
      <button type="button" onClick={onToggleShow}
        style={{ position:'absolute', right:'0.6rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
        {show ? <EyeOff size={15}/> : <Eye size={15}/>}
      </button>
    </div>
  </div>
);

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
        <SecurityInput 
          field="current_password" 
          value={form.current_password} 
          show={show.cur} 
          onToggleShow={() => setShow(p => ({ ...p, cur: !p.cur }))} 
          onChange={v => setForm(p => ({ ...p, current_password: v }))} 
          label="Current Password" 
          placeholder="Enter current password" 
        />
        <SecurityInput 
          field="new_password" 
          value={form.new_password} 
          show={show.new} 
          onToggleShow={() => setShow(p => ({ ...p, new: !p.new }))} 
          onChange={v => setForm(p => ({ ...p, new_password: v }))} 
          label="New Password" 
          placeholder="Enter new password" 
        />

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

        <SecurityInput 
          field="confirm_password" 
          value={form.confirm_password} 
          show={show.con} 
          onToggleShow={() => setShow(p => ({ ...p, con: !p.con }))} 
          onChange={v => setForm(p => ({ ...p, confirm_password: v }))} 
          label="Confirm New Password" 
          placeholder="Repeat new password" 
        />
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
