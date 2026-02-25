import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertTriangle, Monitor, MapPin, Clock, LogOut, CheckCircle2, Circle, KeyRound, Activity } from 'lucide-react';

const PasswordRequirement = ({ met, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: met ? '#059669' : '#64748b', transition: 'all 0.2s', fontWeight: met ? '700' : '500' }}>
    <div style={{ 
      width: '16px', height: '16px', borderRadius: '50%', background: met ? '#ecfdf5' : '#f8fafc', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${met ? '#10b98130' : '#e2e8f0'}`
    }}>
      {met ? <CheckCircle2 size={10} /> : <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }} />}
    </div>
    <span>{text}</span>
  </div>
);

const SecurityInput = ({ label, value, onChange, show, onToggleShow, placeholder, error }) => (
  <div className="pset-field" style={{ width: '100%', marginBottom: '0.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 850, color: '#334155', letterSpacing: '-0.01em' }}>{label}</label>
      {error && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>{error}</span>}
    </div>
    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
      <div style={{ 
        position: 'absolute', left: '1rem', width: '30px', height: '30px', borderRadius: '8px', 
        background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' 
      }}>
        <Lock size={14} />
      </div>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ 
          width: '100%',
          height: '56px',
          paddingLeft: '3.5rem',
          paddingRight: '3.75rem',
          fontSize: '1rem',
          fontWeight: '500',
          borderRadius: '16px',
          border: `2px solid ${error ? '#f87171' : '#e2e8f0'}`,
          background: '#f8fafc',
          color: '#0f172a',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
          boxSizing: 'border-box'
        }}
        onFocus={e => {
          e.target.style.borderColor = '#4f46e5';
          e.target.style.background = '#ffffff';
          e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.08)';
        }}
        onBlur={e => {
          if (!error) {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.background = '#f8fafc';
          }
          e.target.style.boxShadow = 'none';
        }}
      />
      <button 
        type="button" 
        onClick={onToggleShow}
        style={{ 
          position:'absolute', right:'0.5rem', top:'50%', transform:'translateY(-50%)', 
          background: 'transparent', border: 'none', borderRadius: '12px', width: '42px', height: '42px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
          color: '#64748b', transition: 'all 0.2s', zIndex: 11
        }}
        onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#4f46e5'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
      >
        {show ? <EyeOff size={20}/> : <Eye size={20}/>}
      </button>
    </div>
  </div>
);

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000));
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
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
    onChangePassword({ current_password: form.current_password, new_password: form.new_password });
    setForm({ current_password: '', new_password: '', confirm_password: '' });
  };

  return (
    <div className="pset-section">
      <div className="pset-section-header">
        <Shield size={18} />
        <div>
          <h3>Security Settings</h3>
          <p>Protect your account with advanced credentials and activity monitoring</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
        
        {/* LEFT: FORM */}
        <div>
          <div className="pset-subsection-title" style={{ marginTop: 0 }}>
            <KeyRound size={16} /> Update Password
          </div>
          
          <form onSubmit={handleSubmit} className="pset-grid1">
            <SecurityInput label="Current Password" placeholder="••••••••" value={form.current_password} show={show.cur} onToggleShow={() => setShow(p=>({...p, cur:!p.cur}))} onChange={v=>setForm(p=>({...p, current_password:v}))} />
            
            <SecurityInput label="New Password" placeholder="••••••••" value={form.new_password} show={show.new} onToggleShow={() => setShow(p=>({...p, new:!p.new}))} onChange={v=>setForm(p=>({...p, new_password:v}))} error={pwError && form.new_password !== form.confirm_password ? 'Mismatch' : ''} />
            
            {form.new_password && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display:'flex', gap:'4px', marginBottom:'8px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ height:'6px', flex:1, borderRadius:'3px', background: i <= strength ? strengthColor[strength] : '#f1f5f9', transition:'background 0.3s' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize:'0.75rem', color: strengthColor[strength], fontWeight:800 }}>{strengthLabel[strength]} Security</span>
                  <p style={{ fontSize:'0.7rem', color: '#94a3b8', margin: 0 }}>NeuroNest Strength Index</p>
                </div>
              </div>
            )}

            <SecurityInput label="Confirm New Password" placeholder="••••••••" value={form.confirm_password} show={show.con} onToggleShow={() => setShow(p=>({...p, con:!p.con}))} onChange={v=>setForm(p=>({...p, confirm_password:v}))} />

            <button className="pset-save-btn" style={{ width: '100%' }} disabled={saving || !form.current_password || strength < 4}>
              {saving ? 'Processing...' : 'Secure & Update Password'}
            </button>
          </form>
        </div>

        {/* RIGHT: REQUIREMENTS & ACTIVITY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* PASSWORD TIPS */}
          <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.25rem', marginTop: 0 }}>Requirement Checklist</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requirements.map((req, idx) => <PasswordRequirement key={idx} {...req} />)}
            </div>
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#eff6ff', borderRadius: '14px', fontSize: '0.75rem', color: '#1e40af', fontWeight: '500', lineHeight: '1.4' }}>
              💡 Pro Tip: Use a phrase with mixed characters like "Brain-Scan-2026!"
            </div>
          </div>

          {/* ACTIVITY COMPACT */}
          <div>
            <div className="pset-subsection-title" style={{ marginBottom: '1rem' }}>
              <Activity size={16} /> Device Activity
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activity.slice(0, 3).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', transition: 'all 0.2s' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: item.event_type?.includes('failed') ? '#fef2f2' : '#f0fdf4', color: item.event_type?.includes('failed') ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.event_type?.includes('failed') ? <AlertTriangle size={14}/> : <Monitor size={14}/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 750, color: '#1e293b' }}>{item.description}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatRelativeTime(item.created_at)} • India</div>
                  </div>
                </div>
              ))}
              {activity.length === 0 && <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>No recent activity to show.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
