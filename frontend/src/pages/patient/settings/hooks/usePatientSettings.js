import { useState, useEffect, useCallback } from 'react';
import { patientSettingsService } from '../services/patientSettingsService';

export const usePatientSettings = () => {
  const [settings, setSettings]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving,  setSaving]      = useState(false);
  const [error,   setError]       = useState(null);
  const [success, setSuccess]     = useState('');

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientSettingsService.getSettings();
      setSettings(data);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (fn, successMsg) => {
    setSaving(true);
    setError(null);
    try {
      await fn();
      await load();
      flash(successMsg || 'Saved successfully');
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateNotifications= (data) => save(() => patientSettingsService.updateNotifications(data), 'Notification preferences saved!');
  const updatePrivacy      = (data) => save(() => patientSettingsService.updatePrivacy(data), 'Privacy settings saved!');
  const changePassword     = (data) => save(() => patientSettingsService.changePassword(data), 'Password changed!');
  const exportData         = ()     => save(() => patientSettingsService.exportData(), 'Data export ready!');
  const deleteAccount      = (data) => patientSettingsService.deleteAccount(data);

  return { settings, loading, saving, error, success, updateNotifications, updatePrivacy, changePassword, exportData, deleteAccount, reload: load };
};
