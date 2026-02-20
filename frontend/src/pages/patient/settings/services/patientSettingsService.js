import api from '../../../../api/axios';

const BASE = '/api/patient/settings';

export const patientSettingsService = {
  getSettings:         ()       => api.get(`${BASE}/`).then(r => r.data),
  updateNotifications: (data)   => api.put(`${BASE}/notifications`, data).then(r => r.data),
  updatePrivacy:       (data)   => api.put(`${BASE}/privacy`, data).then(r => r.data),
  changePassword:      (data)   => api.post(`${BASE}/change-password`, data).then(r => r.data),
  getSecurityActivity: ()       => api.get(`${BASE}/security-activity`).then(r => r.data),
  exportData:          ()       => api.post(`${BASE}/export-data`).then(r => r.data),
  deleteAccount:       (data)   => api.post(`${BASE}/delete-account`, data).then(r => r.data),
};
