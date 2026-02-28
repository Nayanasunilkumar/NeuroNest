import React, { useState } from 'react';
import { User, Mail, Lock, KeyRound, Eye, EyeOff, Save, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { updateDoctorAccount, changeDoctorPassword } from '../../../../api/doctor';

const AccountSettings = ({ data, onSaveSuccess }) => {
    const [profileForm, setProfileForm] = useState({
        full_name: data?.full_name || '',
    });
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [profileStatus, setProfileStatus] = useState(null); // 'success' | 'error'
    const [pwStatus, setPwStatus] = useState(null);
    const [pwError, setPwError] = useState('');

    const handleProfileChange = (e) => {
        setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (profileStatus) setProfileStatus(null);
    };

    const handlePwChange = (e) => {
        setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (pwStatus) setPwStatus(null);
        if (pwError) setPwError('');
    };

    const handleSaveProfile = async () => {
        if (!profileForm.full_name.trim()) return;
        try {
            setProfileSaving(true);
            const res = await updateDoctorAccount(profileForm);
            setProfileStatus('success');
            if (onSaveSuccess) onSaveSuccess(res);
            setTimeout(() => setProfileStatus(null), 3000);
        } catch (err) {
            console.error("Failed to update account", err);
            setProfileStatus('error');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
            setPwError('All password fields are required.');
            return;
        }
        if (passwordForm.new_password.length < 8) {
            setPwError('New password must be at least 8 characters.');
            return;
        }
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setPwError('New password and confirmation do not match.');
            return;
        }
        try {
            setPwSaving(true);
            await changeDoctorPassword({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
            });
            setPwStatus('success');
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => setPwStatus(null), 4000);
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to change password. Try again.';
            setPwError(msg);
            setPwStatus('error');
        } finally {
            setPwSaving(false);
        }
    };

    const getPasswordStrength = (pw) => {
        if (!pw) return null;
        if (pw.length < 8) return { label: 'Too Short', color: '#ef4444', width: '25%' };
        if (pw.length < 10) return { label: 'Weak', color: '#f97316', width: '40%' };
        const hasSymbol = /[!@#$%^&*]/.test(pw);
        const hasNum = /\d/.test(pw);
        const hasUpper = /[A-Z]/.test(pw);
        if (hasSymbol && hasNum && hasUpper) return { label: 'Strong', color: '#22c55e', width: '100%' };
        if (hasNum && hasUpper) return { label: 'Good', color: '#3b82f6', width: '75%' };
        return { label: 'Fair', color: '#eab308', width: '55%' };
    };

    const strength = getPasswordStrength(passwordForm.new_password);

    return (
        <div className="settings-pane-container">
            <div className="pane-header">
                <h2>Account Settings</h2>
                <p>Manage your professional identity and account security credentials.</p>
            </div>

            <div className="pane-form-grid">
                {/* Profile Section */}
                <div className="form-group-box">
                    <div className="form-group-header">
                        <User size={16} className="text-blue-500" />
                        <h3>Identity</h3>
                    </div>

                    <div className="form-field-row">
                        <div className="form-field" style={{ flex: 1 }}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={profileForm.full_name}
                                onChange={handleProfileChange}
                                placeholder="Dr. Full Name"
                                className="premium-input"
                                style={{
                                    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
                                    borderRadius: '10px', fontSize: '0.95rem', outline: 'none',
                                    transition: 'border 0.2s', background: '#fff', boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>
                    </div>

                    <div className="form-field" style={{ marginTop: '16px' }}>
                        <label>Email Address</label>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px', border: '1.5px solid #e2e8f0',
                            borderRadius: '10px', background: '#f8fafc', color: '#64748b', fontSize: '0.95rem'
                        }}>
                            <Mail size={16} color="#94a3b8" />
                            <span>{data?.email || 'doctor@neuronest.com'}</span>
                            <span style={{
                                marginLeft: 'auto', fontSize: '0.75rem', padding: '3px 10px',
                                background: '#dcfce7', color: '#16a34a', borderRadius: '20px', fontWeight: '600'
                            }}>Verified</span>
                        </div>
                        <p className="field-hint">Email changes require verification and are handled by support.</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '12px', alignItems: 'center' }}>
                        {profileStatus === 'success' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '0.875rem', fontWeight: '500' }}>
                                <CheckCircle size={16} /> Profile updated!
                            </span>
                        )}
                        {profileStatus === 'error' && (
                            <span style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: '500' }}>Update failed. Try again.</span>
                        )}
                        <button
                            onClick={handleSaveProfile}
                            disabled={profileSaving}
                            className="btn-save-premium"
                        >
                            <Save size={16} />
                            {profileSaving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>

                {/* Password Section */}
                <div className="form-group-box">
                    <div className="form-group-header">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <h3>Change Password</h3>
                    </div>

                    {/* Current Password */}
                    <div className="form-field" style={{ marginBottom: '16px' }}>
                        <label>Current Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showCurrentPw ? 'text' : 'password'}
                                name="current_password"
                                value={passwordForm.current_password}
                                onChange={handlePwChange}
                                placeholder="Enter your current password"
                                style={{
                                    width: '100%', padding: '10px 40px 10px 14px', border: '1.5px solid #e2e8f0',
                                    borderRadius: '10px', fontSize: '0.95rem', outline: 'none',
                                    transition: 'border 0.2s', background: '#fff', boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} style={{
                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0
                            }}>
                                {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="form-field" style={{ marginBottom: '16px' }}>
                        <label>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showNewPw ? 'text' : 'password'}
                                name="new_password"
                                value={passwordForm.new_password}
                                onChange={handlePwChange}
                                placeholder="Minimum 8 characters"
                                style={{
                                    width: '100%', padding: '10px 40px 10px 14px', border: '1.5px solid #e2e8f0',
                                    borderRadius: '10px', fontSize: '0.95rem', outline: 'none',
                                    transition: 'border 0.2s', background: '#fff', boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{
                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0
                            }}>
                                {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {strength && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Strength</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: strength.color }}>{strength.label}</span>
                                </div>
                                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '99px', transition: 'all 0.3s' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-field" style={{ marginBottom: '20px' }}>
                        <label>Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPw ? 'text' : 'password'}
                                name="confirm_password"
                                value={passwordForm.confirm_password}
                                onChange={handlePwChange}
                                placeholder="Re-enter new password"
                                style={{
                                    width: '100%', padding: '10px 40px 10px 14px',
                                    border: `1.5px solid ${passwordForm.confirm_password && passwordForm.confirm_password !== passwordForm.new_password ? '#ef4444' : '#e2e8f0'}`,
                                    borderRadius: '10px', fontSize: '0.95rem', outline: 'none',
                                    transition: 'border 0.2s', background: '#fff', boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = (passwordForm.confirm_password && passwordForm.confirm_password !== passwordForm.new_password) ? '#ef4444' : '#e2e8f0'}
                            />
                            <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} style={{
                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0
                            }}>
                                {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordForm.confirm_password && passwordForm.confirm_password !== passwordForm.new_password && (
                            <p style={{ marginTop: '6px', fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={14} /> Passwords do not match
                            </p>
                        )}
                    </div>

                    {pwError && (
                        <div className="alert-box warning" style={{ marginBottom: '16px' }}>
                            <AlertCircle size={16} />
                            <span>{pwError}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                        {pwStatus === 'success' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '0.875rem', fontWeight: '500' }}>
                                <CheckCircle size={16} /> Password changed!
                            </span>
                        )}
                        <button
                            onClick={handleChangePassword}
                            disabled={pwSaving}
                            className="btn-save-premium"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                        >
                            <KeyRound size={16} />
                            {pwSaving ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
