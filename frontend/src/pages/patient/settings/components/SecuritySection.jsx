import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertTriangle, Monitor, MapPin, Clock, LogOut, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

const PasswordRequirement = ({ met, text, started }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem', 
    fontSize: '0.8rem', 
    color: started ? (met ? '#10b981' : '#ef4444') : '#64748b', 
    fontWeight: started && met ? 700 : 500,
    transition: 'all 0.2s' 
  }}>
    {started ? (
      met ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />
    ) : (
      <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #cbd5e1' }} />
    )}
    <span>{text}</span>
  </div>
);

const SecurityInput = ({ field, value, onChange, show, onToggleShow, label, placeholder, error, success }) => (
  <div className="pset-field" style={{ width: '100%', marginBottom: '0.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</label>
      {error && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12}/> {error}</span>}
      {success && !error && <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12}/> Match</span>}
    </div>
    <div className="pset-icon-input" style={{ position: 'relative', width: '100%' }}>
      <Lock size={16} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', zIndex: 10 }} />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ 
          height: '56px',
          paddingRight: '3.5rem', 
          paddingLeft: '3rem',
          width: '100%',
          borderColor: error ? '#ef4444' : (success ? '#10b981' : '#e2e8f0'),
          background: error ? '#fef2f2' : (success ? '#f0fdf4' : '#f8fafc'),
          color: '#0f172a',
          fontSize: '1rem',
          fontWeight: 500
        }}
        className={error ? 'pset-error-border' : ''}
      />
      <button 
        type="button" 
        onClick={onToggleShow}
        aria-label={show ? "Hide password" : "Show password"}
        style={{ 
          position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', 
          background: 'transparent', border:'none', borderRadius: '10px',
          padding: '8px', cursor:'pointer', color:'#475569', display: 'flex', transition: 'all 0.2s',
          zIndex: 10
        }}
        onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
      >
        {show ? <EyeOff size={20}/> : <Eye size={20}/>}
      </button>
    </div>
  </div>
);

export default function SecuritySection({ data, saving, onChangePassword }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '', logout_others: true });
  const [show, setShow] = useState({ cur: false, new: false, con: false });
  const [pwError, setPwError] = useState('');
  
  const requirements = [
    { met: form.new_password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(form.new_password), text: "One uppercase letter" },
    { met: /[0-9]/.test(form.new_password), text: "One number" },
    { met: /[^A-Za-z0-9]/.test(form.new_password), text: "One special character" },
  ];

  const strength = requirements.filter(r => r.met).length;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  const passwordsMatch = form.new_password && form.confirm_password && form.new_password === form.confirm_password;
  const matchError = form.confirm_password && form.new_password !== form.confirm_password ? 'Passwords do not match' : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) { setPwError('Passwords do not match'); return; }
    if (strength < 4) { setPwError('Security requirements not met'); return; }
    setPwError('');
    onChangePassword({ 
      current_password: form.current_password, 
      new_password: form.new_password,
      logout_others: form.logout_others
    });
    setForm({ current_password: '', new_password: '', confirm_password: '', logout_others: true });
  };

  return (
    <div className="pset-security-layout" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 🟢 PASSWORD SECTION */}
      <section className="pset-security-group">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: '#3b82f6' }}>
              <Lock size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>Update Password</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Ensure your account uses a long, random password to stay secure.</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <SecurityInput 
            label="Current Password" 
            placeholder="Enter your current password"
            value={form.current_password}
            show={show.cur}
            onToggleShow={() => setShow(p => ({ ...p, cur: !p.cur }))}
            onChange={v => setForm(p => ({ ...p, current_password: v }))}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <SecurityInput 
              label="New Password" 
              placeholder="Enter new secure password"
              value={form.new_password}
              show={show.new}
              onToggleShow={() => setShow(p => ({ ...p, new: !p.new }))}
              onChange={v => setForm(p => ({ ...p, new_password: v }))}
              error={pwError && strength < 4 ? pwError : ''}
            />
            
            {/* Real-time Validation UI */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Security Standards</span>
                {form.new_password && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
                    <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                       <div style={{ width: `${(strength/4)*100}%`, height: '100%', background: strengthColor[strength], transition: 'all 0.3s' }} />
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {requirements.map((req, idx) => (
                  <PasswordRequirement key={idx} met={req.met} text={req.text} started={form.new_password.length > 0} />
                ))}
              </div>
            </div>
          </div>

          <SecurityInput 
            label="Confirm New Password" 
            placeholder="Repeat new password"
            value={form.confirm_password}
            show={show.con}
            onToggleShow={() => setShow(p => ({ ...p, con: !p.con }))}
            onChange={v => setForm(p => ({ ...p, confirm_password: v }))}
            error={matchError}
            success={passwordsMatch}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#f0f9ff', borderRadius: '16px', border: '1px solid #bae6fd', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Shield size={20} color="#0284c7" />
              <div>
                <div style={{ fontSize: '0.9rem', color: '#0369a1', fontWeight: 800 }}>Security Protocol</div>
                <div style={{ fontSize: '0.8rem', color: '#0c4a6e' }}>Sign out from all other active session after update</div>
              </div>
            </div>
            <div 
              className={`pset-toggle ${form.logout_others ? 'pset-toggle-on' : 'pset-toggle-off'}`} 
              onClick={() => setForm(p => ({...p, logout_others: !p.logout_others}))}
              style={{ cursor: 'pointer' }}
            >
              <div className="pset-toggle-knob" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button 
              className="pset-save-btn" 
              style={{ marginTop: 0, width: '100%', padding: '1.25rem' }} 
              disabled={saving || !form.current_password || strength < 4 || !passwordsMatch}
            >
              {saving ? 'Processing Security Update...' : 'Confirm & Update Password'}
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
          {data?.security?.sessions && data.security.sessions.length > 0 ? (
            data.security.sessions.map((session, i) => (
              <div key={i} className="pset-notif-row" style={{ background: '#fff' }}>
                <div style={{ flex: 1, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: session.current ? '#ecfdf5' : '#f8fafc', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: session.current ? '#10b981' : '#64748b', border: '1.5px solid #f1f5f9' }}>
                    <Monitor size={22} style={{ margin: 'auto' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                      {session.device} 
                      {session.current && <span style={{ padding: '3px 8px', background: '#dcfce7', color: '#166534', fontSize: '0.65rem', fontWeight: 900, borderRadius: '6px', marginLeft: '8px', textTransform: 'uppercase' }}>Current Session</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '1rem', marginTop: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12}/> {session.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> {session.last_active}</span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <button style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
                    Terminate
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="pset-notif-row" style={{ background: '#fff' }}>
              <div style={{ flex: 1, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#10b981', border: '1.5px solid #d1fae5' }}>
                  <Monitor size={22} style={{ margin: 'auto' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>Active Session <span style={{ padding: '3px 8px', background: '#dcfce7', color: '#166534', fontSize: '0.65rem', fontWeight: 900, borderRadius: '6px', marginLeft: '8px', textTransform: 'uppercase' }}>Current</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '1rem', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12}/> Secure Connection</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Active now</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
      </section>

      {/* ⚪️ LOGIN HISTORY */}
      <section className="pset-security-group">
        <div className="pset-subsection-title">
          <Shield size={16} />
          Recent Security Activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data?.security?.activity && data.security.activity.length > 0 ? (
            data.security.activity.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.status === 'success' ? '#10b981' : item.status === 'warning' ? '#f59e0b' : '#ef4444', boxShadow: `0 0 0 4px ${item.status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'}` }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>{item.action}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                   {item.time}
                   <ChevronRight size={14} />
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0', color: '#64748b' }}>
              <Shield size={32} style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>No recent security audits</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Your security events will appear here.</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
