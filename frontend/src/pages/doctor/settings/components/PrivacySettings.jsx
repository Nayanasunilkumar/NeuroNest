import React, { useState } from 'react';
import { Shield, Eye, Lock, Globe, Save, MessageSquare, Star } from 'lucide-react';
import { updateDoctorPrivacySettings } from '../../../../api/doctor';

const PrivacySettings = ({ data, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        show_profile_publicly: data?.show_profile_publicly ?? true,
        show_consultation_fee: data?.show_consultation_fee ?? true,
        allow_chat_before_booking: data?.allow_chat_before_booking ?? true,
        allow_reviews_publicly: data?.allow_reviews_publicly ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
        if (saveStatus) setSaveStatus(null);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaveStatus(null);
            const res = await updateDoctorPrivacySettings(formData);
            setSaveStatus('success');
            if (onSaveSuccess) onSaveSuccess(res.settings);
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error("Failed to update privacy settings", error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const renderToggle = (id, 
        label, description, Icon, checked) => (
        <div className="privacy-toggle-row">
            <div className="privacy-toggle-info">
                <div className="icon-wrap">
                    <Icon size={18} />
                </div>
                <div>
                    <h4>{label}</h4>
                    <p>{description}</p>
                </div>
            </div>
            <label className="premium-toggle">
                <input 
                    type="checkbox" 
                    name={id}
                    checked={checked}
                    onChange={handleChange}
                />
                <span className="toggle-slider"></span>
            </label>
        </div>
    );

    return (
        <div className="settings-pane-container">
            <div className="pane-header">
                <h2>Privacy & Visibility</h2>
                <p>Control what patients see on your public portal and limit communication access.</p>
            </div>

            <div className="pane-form-grid">
                <div className="form-group-box">
                    <div className="form-group-header">
                        <Globe size={16} className="text-teal-500" />
                        <h3>Public Listings</h3>
                    </div>
                    
                    <div className="privacy-toggle-group">
                        {renderToggle(
                            'show_profile_publicly',
                            'Profile Visibility',
                            'Allow your practice to be listed in patient searches globally.',
                            Eye,
                            formData.show_profile_publicly
                        )}
                        {renderToggle(
                            'show_consultation_fee',
                            'Transparent Pricing',
                            'Display your consultation fees openly on your public profile.',
                            Lock,
                            formData.show_consultation_fee
                        )}
                    </div>
                </div>

                <div className="form-group-box">
                    <div className="form-group-header">
                        <Shield size={16} className="text-indigo-500" />
                        <h3>Patient Interactions</h3>
                    </div>
                    
                    <div className="privacy-toggle-group">
                        {renderToggle(
                            'allow_chat_before_booking',
                            'Pre-Booking Chat',
                            'Allow patients to message you a query before committing to an appointment.',
                            MessageSquare,
                            formData.allow_chat_before_booking
                        )}
                        {renderToggle(
                            'allow_reviews_publicly',
                            'Public Reviews',
                            'Allow patients to leave clinical feedback and ratings on your page.',
                            Star,
                            formData.allow_reviews_publicly
                        )}
                    </div>
                </div>
            </div>

            <div className="pane-footer fixed-pane-footer">
                {saveStatus === 'success' && <span className="success-text">Visibility updated</span>}
                {saveStatus === 'error' && <span className="error-text">Update failed.</span>}
                <button onClick={handleSave} disabled={saving} className="btn-save-premium">
                    <Save size={16} />
                    {saving ? 'Processing...' : 'Save Privacy Setup'}
                </button>
            </div>
        </div>
    );
};

export default PrivacySettings;
