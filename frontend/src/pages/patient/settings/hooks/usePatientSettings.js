import { useState, useEffect, useCallback } from 'react';
import { patientSettingsService } from '../services/patientSettingsService';

export const usePatientSettings = () => {
  const [settings, setSettings]   = useState(null);
  const [securityActivity, setSecurityActivity] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving,  setSaving]      = useState(false);
  const [error,   setError]       = useState(null);
  const [success, setSuccess]     = useState('');

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsData, activityData] = await Promise.all([
        patientSettingsService.getSettings(),
        patientSettingsService.getSecurityActivity()
      ]);
      setSettings(settingsData);
      setSecurityActivity(activityData);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (fn, successMsg) => {
    setSaving(true);
    setError(null);
    try {
      const result = await fn();
      await load();
      flash(successMsg || 'Saved successfully');
      return result;
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to save');
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const updateNotifications= (data) => save(() => patientSettingsService.updateNotifications(data), 'Notification preferences saved!');
  const changePassword     = (data) => save(() => patientSettingsService.changePassword(data), 'Password changed!');
  const exportData         = ()     => save(() => patientSettingsService.exportData(), 'Data export ready!');
  const exportReport       = ()     => save(() => patientSettingsService.exportReport(), 'Medical report ready!');
  const exportAppts        = ()     => save(() => patientSettingsService.exportAppointments(), 'Appointment list ready!');
  const exportPresc        = ()     => save(() => patientSettingsService.exportPrescriptions(), 'Prescription list ready!');
  const deleteAccount      = (data) => patientSettingsService.deleteAccount(data);

  return { settings, securityActivity, loading, saving, error, success, updateNotifications, changePassword, exportData, exportReport, exportAppts, exportPresc, deleteAccount, reload: load };
};
