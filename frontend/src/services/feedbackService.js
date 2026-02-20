import axios from 'axios';

const API_URL = 'http://localhost:5000/api/feedback';

export const feedbackService = {
  getReviews: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_URL}/list?${params}`);
    return response.data;
  },

  getReviewStats: async () => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  },

  moderateReview: async (reviewId, data) => {
    // data: { action: 'hide'|'approve'|'flag'|'escalate', note: string, tags: string[], admin_id: number }
    const response = await axios.post(`${API_URL}/${reviewId}/moderate`, data);
    return response.data;
  },

  submitReview: async (reviewData) => {
    const response = await axios.post(`${API_URL}/submit`, reviewData);
    return response.data;
  }
};
