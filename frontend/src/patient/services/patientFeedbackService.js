import api from '../api/axios';

const BASE = '/api/feedback';

export const patientFeedbackService = {
  getMyReviews: async (patientId) => {
    const res = await api.get(`${BASE}/patient/reviews`, { params: { patient_id: patientId } });
    return res.data;
  },

  getMyComplaints: async (patientId) => {
    const res = await api.get(`${BASE}/patient/complaints`, { params: { patient_id: patientId } });
    return res.data;
  },

  getEligibleAppointments: async () => {
    const res = await api.get('/appointments/');
    const all = Array.isArray(res.data) ? res.data : (res.data?.appointments || []);
    return all.filter(a => String(a.status).toLowerCase() === 'completed' && !a.feedback_given);
  },

  submitReview: async (payload) => {
    const res = await api.post(`${BASE}/submit`, payload);
    return res.data;
  },

  editReview: async (reviewId, payload) => {
    const res = await api.put(`${BASE}/patient/review/${reviewId}`, payload);
    return res.data;
  },
};
