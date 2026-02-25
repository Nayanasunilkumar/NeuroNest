import api from '../../../../api/axios';

const BASE = '/api/patient/settings';

export const patientSettingsService = {
  getSettings:         ()       => api.get(`${BASE}/`).then(r => r.data),
  updateNotifications: (data)   => api.put(`${BASE}/notifications`, data).then(r => r.data),
  changePassword:      (data)   => api.post(`${BASE}/change-password`, data).then(r => r.data),
  getSecurityActivity: ()       => api.get(`${BASE}/security-activity`).then(r => r.data),
  exportData:          ()       => api.post(`${BASE}/export-data`).then(r => r.data),
  exportReport:        ()       => api.post(`${BASE}/export-report`, {}, { responseType: 'blob' }),
  exportAppointments:  ()       => api.post(`${BASE}/export-appointments`, {}, { responseType: 'blob' }),
  exportPrescriptions: ()       => api.post(`${BASE}/export-prescriptions`, {}, { responseType: 'blob' }),
  deleteAccount:       (data)   => api.post(`${BASE}/delete-account`, data).then(r => r.data),
};
