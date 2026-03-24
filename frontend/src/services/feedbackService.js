import api from '../api/axios';

const API_PATH = '/api/feedback';

export const feedbackService = {
  getReviews: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`${API_PATH}/list?${params}`);
    return response.data;
  },

  getReviewStats: async () => {
    const response = await api.get(`${API_PATH}/stats`);
    return response.data;
  },

  moderateReview: async (reviewId, data) => {
    // data: { action: 'hide'|'approve'|'flag'|'escalate', note: string, tags: string[], admin_id: number }
    const response = await api.post(`${API_PATH}/${reviewId}/moderate`, data);
    return response.data;
  },

  submitReview: async (reviewData) => {
    const response = await api.post(`${API_PATH}/submit`, reviewData);
    return response.data;
  }
};
