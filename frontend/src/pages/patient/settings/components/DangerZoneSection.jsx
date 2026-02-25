import React, { useState } from 'react';
import { Trash2, AlertTriangle, Eye, EyeOff, ShieldAlert, X } from 'lucide-react';

export default function DangerZoneSection({ onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!password) { setError('Confirm your password to continue'); return; }
    setDeleting(true); setError('');
    try {
      await onDelete({ password });
      localStorage.clear();
      window.location.href = '/login';
    } catch (e) {
      setError(e?.response?.data?.error || 'Authorization failed. Please check your password.');
      setDeleting(false);
    }
  };

  return (
    <div className="pset-section" style={{ background: '#fffafa' }}>
      <div className="pset-section-header" style={{ borderColor: '#fee2e2' }}>
        <ShieldAlert size={18} style={{ color: '#ef4444' }} />
        <div>
          <h3 style={{ color: '#991b1b' }}>Danger Zone</h3>
          <p>Actions here are irreversible and will affect your access to medical records</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2rem', background: '#fff', border: '1px solid #fee2e2', borderRadius: '24px', boxShadow: '0 4px 12px rgba(153, 27, 27, 0.03)' }}>
        <div style={{ maxWidth: '60%' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>Deactivate & Delete Account</div>
          <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
            Request the permanent deletion of your profile and data. Some records are kept in an anonymized state for 7 years as required by clinical governance.
          </div>
        </div>
        <button 
          onClick={() => { setShowModal(true); setStep(1); }}
          style={{ 
            background: '#ef4444', color: '#fff', border: 'none', borderRadius: '14px', 
            padding: '0.875rem 1.5rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
          onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
        >
          Delete Account
        </button>
      </div>

      {showModal && (
        <div className="pset-modal-backdrop" onClick={() => !deleting && setShowModal(false)}>
          <div className="pset-modal" style={{ maxWidth: '540px', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {step === 1 ? <AlertTriangle size={24} /> : <Trash2 size={24} />}
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
              </div>

              {step === 1 ? (
                <>
                  <h3 className="pset-modal-title" style={{ textAlign: 'left', fontSize: '1.75rem' }}>Terminate Account?</h3>
                  <div style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    This will permanently disconnect your profile. Please be aware of the following:
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <li><strong>Instant Access Loss:</strong> You will be logged out immediately.</li>
                      <li><strong>Health Continuity:</strong> Ongoing treatment logs will be archived.</li>
                      <li><strong>Data Privacy:</strong> Identity details will be purged from our active caches.</li>
                    </ul>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="pset-modal-cancel" onClick={() => setShowModal(false)}>Keep Account</button>
                    <button className="pset-modal-danger" onClick={() => setStep(2)}>I Understand, Continue</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="pset-modal-title" style={{ textAlign: 'left', fontSize: '1.75rem' }}>Security Verification</h3>
                  <div style={{ color: '#475569', fontSize: '1rem', marginBottom: '2rem' }}>
                    To confirm this irreversible action, please enter your account password.
                  </div>
                  
                  <div className="pset-field" style={{ marginBottom: '2rem' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Current password"
                        style={{ height: '56px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '0 1.25rem', width: '100%', fontSize: '1.1rem', outline: 'none' }}
                        autoFocus
                      />
                      <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                    {error && <div className="pset-inline-error" style={{ marginTop: '0.75rem' }}><AlertTriangle size={14}/> {error}</div>}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="pset-modal-cancel" onClick={() => setShowModal(false)} disabled={deleting}>Go Back</button>
                    <button 
                      className="pset-modal-danger" 
                      onClick={handleDelete} 
                      disabled={deleting || !password}
                      style={{ background: '#ef4444' }}
                    >
                      {deleting ? 'Terminating...' : 'Permanently Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
            <div style={{ padding: '1.25rem 2.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
              🔒 This session is securely encrypted for your protection.
            </div>
          </div>
        </div>
      )}

      <div className="pset-data-notice" style={{ marginTop: '2.5rem', background: '#fef2f2', borderColor: '#fee2e2', color: '#991b1b', borderLeftColor: '#f87171' }}>
        <strong>Warning:</strong> Deleting your account will not delete medical history required by law. 
        Records are kept for clinical safety and audit purposes but will be disassociated from your identity.
      </div>
    </div>
  );
}
