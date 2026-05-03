import api from '../api/axios';

const BASE = '/api/feedback/doctor';

export const doctorFeedbackService = {
  getSummary:      (doctorId) => api.get(`${BASE}/summary`,      { params: { doctor_id: doctorId } }).then(r => r.data),
  getDistribution: (doctorId) => api.get(`${BASE}/distribution`, { params: { doctor_id: doctorId } }).then(r => r.data),
  getTrend:        (doctorId) => api.get(`${BASE}/trend`,        { params: { doctor_id: doctorId } }).then(r => r.data),
  getTags:         (doctorId) => api.get(`${BASE}/tags`,         { params: { doctor_id: doctorId } }).then(r => r.data),
  getReviews:      (doctorId) => api.get(`${BASE}/list`,         { params: { doctor_id: doctorId } }).then(r => r.data),
};
