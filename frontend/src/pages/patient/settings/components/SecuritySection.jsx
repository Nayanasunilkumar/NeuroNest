import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertTriangle, Monitor, MapPin, Clock, LogOut, CheckCircle2, Circle } from 'lucide-react';

const PasswordRequirement = ({ met, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: met ? '#10b981' : '#64748b', transition: 'all 0.2s' }}>
    {met ? <CheckCircle2 size={12} /> : <Circle size={12} />}
    <span>{text}</span>
  </div>
);

const SecurityInput = ({ field, value, onChange, show, onToggleShow, label, placeholder, error }) => (
  <div className="pset-field" style={{ width: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <label>{label}</label>
      {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>{error}</span>}
    </div>
    <div className="pset-icon-input" style={{ position: 'relative', display: 'block', width: '100%' }}>
      <Lock size={14} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 10 }} />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ 
          paddingRight: '3.5rem', 
          paddingLeft: '3rem',
          width: '100%',
          boxSizing: 'border-box',
          borderColor: error ? '#ef4444' : '' 
        }}
        className={error ? 'pset-error-border' : ''}
      />
      <button 
        type="button" 
        onClick={onToggleShow}
        aria-label={show ? "Hide password" : "Show password"}
        style={{ 
          position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', 
          background:'rgba(241, 245, 249, 0.8)', border:'none', borderRadius: '10px',
          padding: '8px', cursor:'pointer', color:'#64748b', display: 'flex', transition: 'all 0.2s',
          zIndex: 10
        }}
        onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)'}
      >
        {show ? <EyeOff size={16}/> : <Eye size={16}/>}
      </button>
    </div>
  </div>
);

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

export default function SecuritySection({ data, activity = [], saving, onChangePassword }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [show, setShow] = useState({ cur: false, new: false, con: false });
  const [pwError, setPwError] = useState('');

  const requirements = [
    { met: form.new_password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(form.new_password), text: "One uppercase letter" },
    { met: /[0-9]/.test(form.new_password), text: "One number" },
    { met: /[^A-Za-z0-9]/.test(form.new_password), text: "One special character" },
  ];

  const strength = requirements.filter(r => r.met).length;
  const strengthLabel = ['', 'Very Weak', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) { setPwError('Passwords do not match'); return; }
    if (strength < 4) { setPwError('Password does not meet requirements'); return; }
    setPwError('');
    onChangePassword({ 
      current_password: form.current_password, 
      new_password: form.new_password
    });
    setForm({ current_password: '', new_password: '', confirm_password: '' });
  };

  return (
    <div className="pset-security-layout" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* 🟢 PASSWORD SECTION */}
      <section className="pset-security-group">
        <div className="pset-subsection-title">
          <Lock size={16} />
          Password Management
        </div>
        
        <form onSubmit={handleSubmit} className="pset-grid1">
          <SecurityInput 
            label="Current Password" 
            placeholder="Confirm current password"
            value={form.current_password}
            show={show.cur}
            onToggleShow={() => setShow(p => ({ ...p, cur: !p.cur }))}
            onChange={v => setForm(p => ({ ...p, current_password: v }))}
          />

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SecurityInput 
                label="New Password" 
                placeholder="Minimum 8 characters"
                value={form.new_password}
                show={show.new}
                onToggleShow={() => setShow(p => ({ ...p, new: !p.new }))}
                onChange={v => setForm(p => ({ ...p, new_password: v }))}
                error={pwError && form.new_password !== form.confirm_password ? 'Mismatch' : ''}
              />
              {form.new_password && (
                <div>
                  <div style={{ display:'flex', gap:'4px', marginBottom:'6px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ height:'6px', flex:1, borderRadius:'3px', background: i <= strength ? strengthColor[strength] : '#f1f5f9', transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize:'0.75rem', color: strengthColor[strength], fontWeight:800 }}>{strengthLabel[strength]}</span>
                    <span style={{ fontSize:'0.7rem', color: '#94a3b8' }}>Security Level</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ width: '280px', background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 950, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>Security Checklist</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {requirements.map((req, idx) => <PasswordRequirement key={idx} {...req} />)}
              </div>
            </div>
          </div>

          <SecurityInput 
            label="Confirm New Password" 
            placeholder="Re-enter new password"
            value={form.confirm_password}
            show={show.con}
            onToggleShow={() => setShow(p => ({ ...p, con: !p.con }))}
            onChange={v => setForm(p => ({ ...p, confirm_password: v }))}
          />



          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="pset-save-btn" style={{ marginTop: 0 }} disabled={saving || !form.current_password || strength < 4}>
              {saving ? 'Verifying...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>

      <div style={{ height: '1px', background: '#f1f5f9' }} />

      {/* 🟠 ACTIVE SESSIONS */}
      <section className="pset-security-group">
        <div className="pset-subsection-title">
          <Monitor size={16} />
          Active Sessions
        </div>
        
        <div className="pset-notif-table">
          <div className="pset-notif-row" style={{ background: '#fff' }}>
            <div style={{ flex: 1, display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#059669' }}>
                <Monitor size={20} style={{ margin: 'auto' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Chrome on MacOS <span style={{ padding: '2px 6px', background: '#dcfce7', color: '#166534', fontSize: '0.6rem', borderRadius: '4px', marginLeft: '6px' }}>Current</span></div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '0.75rem', marginTop: '2px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10}/> Bangalore, India</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10}/> Active now</span>
                </div>
              </div>
            </div>
            <button style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', cursor: 'not-allowed' }} disabled>
              Revoke
            </button>
          </div>
        </div>
        
      </section>

      {/* ⚪️ LOGIN HISTORY */}
      <section className="pset-security-group" style={{ marginTop: '1rem' }}>
        <div className="pset-subsection-title">
          <Clock size={16} />
          Recent Security Activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activity.length > 0 ? (
            activity.map((item, i) => (
              <div key={item.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: 8, height: 8, borderRadius: '50%', 
                    background: item.event_type.includes('failed') ? '#ef4444' : '#10b981' 
                  }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    {item.description}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {formatRelativeTime(item.created_at)}
                </span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              No recent security activity found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
