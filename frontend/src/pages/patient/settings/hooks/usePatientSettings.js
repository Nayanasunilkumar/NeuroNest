import { useState, useEffect, useCallback } from 'react';
import { patientSettingsService } from '../services/patientSettingsService';

export const usePatientSettings = () => {
  const [settings, setSettings]   = useState(null);
  const [securityActivity, setSecurityActivity] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving,  setSaving]      = useState(false);
  const [error,   setError]       = useState(null);
  const [success, setSuccess]     = useState('');
  const [exporting, setExporting] = useState(false);

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
      console.error('Failed to load settings:', e);
      const msg = e?.response?.data?.error || e?.response?.data?.message || 'Could not connect to settings server';
      setError(msg);
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
      const msg = e?.response?.data?.error || e?.response?.data?.message || 'Failed to save preference';
      setError(msg);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (fn, successMsg) => {
    setExporting(true);
    setError(null);
    try {
      const result = await fn();
      flash(successMsg || 'Export ready');
      return result;
    } catch (e) {
      setError('Export failed. Please try again.');
      throw e;
    } finally {
      setExporting(false);
    }
  };

  const updateNotifications= (data) => save(() => patientSettingsService.updateNotifications(data), 'Notification preferences saved!');
  const updateEmail        = (data) => save(() => patientSettingsService.updateEmail(data), 'Email address updated!');
  const changePassword     = (data) => save(() => patientSettingsService.changePassword(data), 'Password changed!');
  const exportData         = ()     => handleExport(() => patientSettingsService.exportData(), 'Data export ready!');
  const exportReport       = ()     => handleExport(() => patientSettingsService.exportReport(), 'Medical report ready!');
  const exportAppts        = ()     => handleExport(() => patientSettingsService.exportAppointments(), 'Appointment list ready!');
  const exportPresc        = ()     => handleExport(() => patientSettingsService.exportPrescriptions(), 'Prescription list ready!');
  const deleteAccount      = (data) => patientSettingsService.deleteAccount(data);

  return { settings, securityActivity, loading, saving, exporting, error, success, updateNotifications, updateEmail, changePassword, exportData, exportReport, exportAppts, exportPresc, deleteAccount, reload: load };
};
