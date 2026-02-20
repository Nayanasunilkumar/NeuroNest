import React, { useState } from 'react';
import { Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function DangerZoneSection({ onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1=warning, 2=confirm
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!password) { setError('Password is required'); return; }
    setDeleting(true); setError('');
    try {
      await onDelete({ password });
      // Log out after deletion
      localStorage.clear();
      window.location.href = '/login';
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="pset-section pset-danger-section">
      <div className="pset-section-header">
        <Trash2 size={18} style={{ color:'#ef4444' }}/>
        <div>
          <h3 style={{ color:'#ef4444' }}>Danger Zone</h3>
          <p>Irreversible actions — proceed with caution</p>
        </div>
      </div>

      <div className="pset-danger-card">
        <div>
          <div className="pset-danger-title">Delete My Account</div>
          <div className="pset-danger-desc">
            Permanently removes your access. Your medical records are anonymised and retained for legal compliance.
          </div>
        </div>
        <button className="pset-danger-btn" onClick={() => { setShowModal(true); setStep(1); }}>
          Delete Account
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="pset-modal-backdrop" onClick={() => !deleting && setShowModal(false)}>
          <div className="pset-modal" onClick={e => e.stopPropagation()}>
            {step === 1 ? (
              <>
                <div className="pset-modal-icon"><AlertTriangle size={28} color="#ef4444"/></div>
                <h3 className="pset-modal-title">Are you absolutely sure?</h3>
                <div className="pset-modal-body">
                  <p>This action cannot be undone. Deleting your account will:</p>
                  <ul>
                    <li>Remove your login access immediately</li>
                    <li>Anonymise your personal data</li>
                    <li>Cancel any upcoming appointments</li>
                    <li>Retain anonymised medical records for 7 years (regulatory requirement)</li>
                  </ul>
                </div>
                <div className="pset-modal-actions">
                  <button className="pset-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="pset-modal-danger" onClick={() => setStep(2)}>Yes, continue</button>
                </div>
              </>
            ) : (
              <>
                <div className="pset-modal-icon"><Trash2 size={28} color="#ef4444"/></div>
                <h3 className="pset-modal-title">Confirm with your password</h3>
                <div className="pset-modal-body">
                  <p>Enter your current password to confirm account deletion.</p>
                  <div className="pset-field" style={{ marginTop:'1rem' }}>
                    <div className="pset-icon-input" style={{ position:'relative' }}>
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Your current password"
                        style={{ paddingRight:'2.5rem' }}
                      />
                      <button type="button" onClick={() => setShowPw(p => !p)}
                        style={{ position:'absolute', right:'0.6rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
                        {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                  </div>
                  {error && <div className="pset-inline-error" style={{marginTop:'0.5rem'}}><AlertTriangle size={13}/>{error}</div>}
                </div>
                <div className="pset-modal-actions">
                  <button className="pset-modal-cancel" onClick={() => setShowModal(false)} disabled={deleting}>Cancel</button>
                  <button className="pset-modal-danger" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting…' : '⚠️ Delete my account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
