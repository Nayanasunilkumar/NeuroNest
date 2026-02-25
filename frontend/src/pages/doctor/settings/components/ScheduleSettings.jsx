import React, { useState } from 'react';
import { Clock, ShieldCheck, Timer, Globe2, Save, AlertCircle } from 'lucide-react';
import { updateDoctorScheduleConfig } from '../../../../api/doctor';

const ScheduleSettings = ({ data, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        slot_duration_minutes: data?.slot_duration_minutes || 30,
        buffer_minutes: data?.buffer_minutes || 10,
        approval_mode: data?.approval_mode || 'doctor_approval',
        timezone: data?.timezone || 'Asia/Kolkata',
    });
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (saveStatus) setSaveStatus(null);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaveStatus(null);
            const res = await updateDoctorScheduleConfig(formData);
            setSaveStatus('success');
            if (onSaveSuccess) onSaveSuccess(res.settings);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error("Failed to update schedule settings", error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="settings-pane-container">
            <div className="pane-header">
                <h2>Schedule Configuration</h2>
                <p>Define your clinical consultation rhythm and capacity margins.</p>
            </div>

            <div className="pane-form-grid">
                {/* Duration & Buffer Group */}
                <div className="form-group-box">
                    <div className="form-group-header">
                        <Clock size={16} className="text-blue-500" />
                        <h3>Consultation Slots</h3>
                    </div>
                    
                    <div className="form-field-row">
                        <div className="form-field w-half">
                            <label>Base Appointment Duration</label>
                            <select 
                                name="slot_duration_minutes" 
                                value={formData.slot_duration_minutes} 
                                onChange={handleChange}
                                className="premium-select"
                            >
                                <option value="15">15 Minutes (Review/Brief)</option>
                                <option value="30">30 Minutes (Standard)</option>
                                <option value="45">45 Minutes (Extended)</option>
                                <option value="60">60 Minutes (Comprehensive)</option>
                            </select>
                        </div>
                        
                        <div className="form-field w-half">
                            <label>Buffer Time Between Slots</label>
                            <select 
                                name="buffer_minutes" 
                                value={formData.buffer_minutes} 
                                onChange={handleChange}
                                className="premium-select"
                            >
                                <option value="0">No Buffer (Contiguous)</option>
                                <option value="5">5 Minutes (Micro rest)</option>
                                <option value="10">10 Minutes (Standard)</option>
                                <option value="15">15 Minutes (Extended break)</option>
                            </select>
                        </div>
                    </div>
                    <div className="helper-text-block">
                        <Timer size={14} />
                        <span>Example: A 30 min duration with 10 min buffer will consume 40 minutes per patient on your roster.</span>
                    </div>
                </div>

                {/* Automation Group */}
                <div className="form-group-box">
                    <div className="form-group-header">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <h3>Booking Automation</h3>
                    </div>
                    
                    <div className="form-field">
                        <label>Appointment Approval Workflow</label>
                        <div className="radio-cards-grid">
                            <label className={`radio-card ${formData.approval_mode === 'doctor_approval' ? 'active' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="approval_mode" 
                                    value="doctor_approval"
                                    checked={formData.approval_mode === 'doctor_approval'}
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                />
                                <div className="card-content">
                                    <h4>Manual Triage</h4>
                                    <p>I must review and approve every incoming request.</p>
                                </div>
                                <div className="card-indicator"></div>
                            </label>
                            
                            <label className={`radio-card ${formData.approval_mode === 'auto_confirm' ? 'active' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="approval_mode" 
                                    value="auto_confirm"
                                    checked={formData.approval_mode === 'auto_confirm'}
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                />
                                <div className="card-content">
                                    <h4>Instant Confirmation</h4>
                                    <p>Automatically accept bookings if the slot is open.</p>
                                </div>
                                <div className="card-indicator"></div>
                            </label>
                        </div>
                    </div>

                    {formData.approval_mode === 'auto_confirm' && (
                        <div className="alert-box warning">
                            <AlertCircle size={16} />
                            <span><strong>Warning:</strong> Instant confirmation bypasses your manual verification. Not recommended if your schedule is unpredictable.</span>
                        </div>
                    )}
                </div>

                {/* Geography Group */}
                <div className="form-group-box">
                    <div className="form-group-header">
                        <Globe2 size={16} className="text-purple-500" />
                        <h3>Regional Settings</h3>
                    </div>
                    
                    <div className="form-field">
                        <label>Your Operational Timezone</label>
                        <select 
                            name="timezone" 
                            value={formData.timezone} 
                            onChange={handleChange}
                            className="premium-select"
                        >
                            <option value="Asia/Kolkata">India Standard Time (IST) - Asia/Kolkata</option>
                            <option value="UTC">Universal Time Coordinated (UTC)</option>
                            <option value="America/New_York">Eastern Time (ET) - America/New_York</option>
                            <option value="Europe/London">Greenwich Mean Time (GMT) - Europe/London</option>
                            {/* Expand as necessary */}
                        </select>
                        <p className="field-hint">All your slots will be computed based on this fundamental timezone.</p>
                    </div>
                </div>
            </div>

            <div className="pane-footer fixed-pane-footer">
                {saveStatus === 'success' && (
                    <span className="success-text">Settings updated successfully</span>
                )}
                {saveStatus === 'error' && (
                    <span className="error-text">Update failed. Try again.</span>
                )}
                <button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="btn-save-premium"
                >
                    <Save size={16} />
                    {saving ? 'Saving Config...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
};

export default ScheduleSettings;
