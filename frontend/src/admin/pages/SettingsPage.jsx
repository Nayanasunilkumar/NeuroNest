import React, { useState, useEffect } from 'react';
import { 
    Bell, Save, Globe, AlertCircle
} from 'lucide-react';
import { adminSettingsApi } from '../../shared/services/api/settingsApi';
import '../../admin/styles/admin-settings.css';

const TABS = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
];

const INDIA_DEFAULT_OVERRIDES = {
    contact_number: '+91-44-4000-0000',
    default_timezone: 'Asia/Kolkata',
    default_language: 'en-IN',
};

const INDIA_LEGACY_VALUES = {
    contact_number: ['+1-800-neuro-01', '', 'null', 'none'],
    default_timezone: ['utc', 'gmt', '', 'null', 'none'],
    default_language: ['en-us', 'en', '', 'null', 'none'],
};

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
    const [error, setError] = useState(null);
    const [originalSettings, setOriginalSettings] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminSettingsApi.getAllSettings(activeTab);
            
            if (!data) {
                setError("No data returned from the server.");
                return;
            }
            if (data.error) {
                setError(data.error);
                return;
            }
            
            // Transform object to simpler key-value pair for state management
            const formatted = Object.keys(data).reduce((acc, key) => {
                let value = data[key].value;
                const normalized = (value ?? '').toString().trim().toLowerCase();
                const indiaFallback = INDIA_DEFAULT_OVERRIDES[key];
                if (indiaFallback && INDIA_LEGACY_VALUES[key]?.includes(normalized)) {
                    value = indiaFallback;
                }
                if (data[key].type === 'boolean') {
                    value = value === 'true';
                }
                acc[key] = { value, type: data[key].type };
                return acc;
            }, {});
            setSettings(formatted);
            setOriginalSettings(formatted);
            setHasUnsavedChanges(false);
        } catch (err) {
            console.error("Error fetching settings:", err);
            // Check for CORS or Network error
            if (err.message.includes('Network Error')) {
                setError("Network error: Could not reach the server. Please check your connection.");
            } else if (err.response && err.response.status === 403) {
                setError("Access Denied: You don't have permission to view settings. Super Admin access is required.");
            } else if (err.response && err.response.data && err.response.data.error) {
                setError(`Server Error: ${err.response.data.error}`);
            } else if (err.response && err.response.data && err.response.data.msg) {
                setError(`Auth Error: ${err.response.data.msg}`);
            } else {
                setError("An unexpected error occurred while loading settings.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => {
            const next = {
                ...prev,
                [key]: { ...prev[key], value }
            };
            
            // Check for changes relative to original
            const changed = Object.keys(next).some(k => next[k].value !== originalSettings[k]?.value);
            setHasUnsavedChanges(changed);
            return next;
        });
        setSaveStatus(null);
    };

    const handleReset = () => {
        setSettings(originalSettings);
        setHasUnsavedChanges(false);
        setSaveStatus(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus(null);
        try {
            const payload = Object.keys(settings).reduce((acc, key) => {
                acc[key] = settings[key].value;
                return acc;
            }, {});
            
            await adminSettingsApi.updateSettings(payload);
            try {
                await adminSettingsApi.updateSystemConfig(payload);
            } catch {}
            
            window.dispatchEvent(new CustomEvent("system-config-updated-payload", { detail: payload }));
            window.dispatchEvent(new Event("system-config-updated"));
            
            setOriginalSettings(settings);
            setHasUnsavedChanges(false);
            setSaveStatus('success');
            
            // Auto-clear success message after 3s
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const renderInput = (key, config) => {
        if (config.type === 'boolean') {
            return (
                <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        checked={config.value} 
                        onChange={(e) => handleChange(key, e.target.checked)} 
                    />
                    <span className="slider round"></span>
                </label>
            );
        }

        if (config.type === 'integer') {
            return (
                <input 
                    type="number" 
                    className="settings-input" 
                    value={config.value} 
                    onChange={(e) => handleChange(key, e.target.value)} 
                />
            );
        }

        return (
            <input 
                type="text" 
                className="settings-input" 
                value={config.value} 
                onChange={(e) => handleChange(key, e.target.value)} 
            />
        );
    };

    const formatLabel = (key) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="admin-settings-root">
            <div className="settings-header">
                <div>
                    <h1>Platform Settings</h1>
                    <p>Manage entire system governance and features.</p>
                </div>
                <div className="header-actions-group">
                    {hasUnsavedChanges && (
                        <button className="btn-secondary-ghost" onClick={handleReset} disabled={saving}>
                            Discard Changes
                        </button>
                    )}
                    <button 
                        className={`btn-save-premium ${saveStatus === 'success' ? 'saved' : ''}`} 
                        onClick={handleSave}
                        disabled={saving || loading || !!error || !hasUnsavedChanges}
                    >
                        {saving ? (
                            <span className="flex items-center gap-2"><RefreshCcw size={16} className="spin" /> Syncing...</span>
                        ) : saveStatus === 'success' ? (
                            <span className="flex items-center gap-2"><CheckCircle size={16} /> Saved</span>
                        ) : (
                            <span className="flex items-center gap-2"><Save size={18} /> Save Changes</span>
                        )}
                    </button>
                    {saveStatus === 'error' && (
                        <div className="save-error-hint">Save failed. Retry?</div>
                    )}
                </div>
            </div>

            {/* Top Bar Navigation instead of Sidebar */}
            <div className="settings-tabs-topbar">
                {TABS.map(tab => (
                    <button 
                        key={tab.id}
                        className={`tab-button-top ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <main className="settings-content">
                {loading ? (
                    <div className="loading-state text-slate-500 font-bold p-12 text-center animate-pulse">
                        Loading Configuration...
                    </div>
                ) : error ? (
                    <div className="error-state p-12 text-center text-red-600 flex flex-col items-center justify-center gap-4">
                        <AlertCircle size={48} className="text-red-500 mb-2" />
                        <h3 className="text-xl font-bold">Failed to load settings</h3>
                        <p className="text-sm max-w-md bg-red-50 p-4 rounded text-red-700">{error}</p>
                        <button onClick={fetchSettings} className="btn-primary mt-4 bg-red-600 hover:bg-red-700">Retry</button>
                    </div>
                ) : (
                    <div className="settings-form">
                        <h2 className="section-title">
                            {TABS.find(t => t.id === activeTab)?.label} Configuration
                        </h2>
                        <div className="settings-grid">
                            {Object.keys(settings).length === 0 ? (
                                <p className="text-slate-500 p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                                    No settings available in this category.
                                </p>
                            ) : (
                                Object.keys(settings).map(key => (
                                    <div className="settings-field" key={key}>
                                        <div className="field-info">
                                            <label>{formatLabel(key)}</label>
                                            <span className="field-key-helper">{key}</span>
                                        </div>
                                        <div className="field-input">
                                            {renderInput(key, settings[key])}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SettingsPage;
