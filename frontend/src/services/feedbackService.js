import api from '../api/axios';
import { API_BASE_URL } from '../config/env';

const API_PATH = '/api/feedback';
let markerCache = null;

export const feedbackService = {
  getMarker: async (force = false) => {
    if (!force && markerCache) return markerCache;
    const response = await api.get(`${API_PATH}/marker`);
    markerCache = response.data;
    return markerCache;
  },

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
    try {
      const response = await api.post(`${API_PATH}/${reviewId}/moderate`, data);
      return response.data;
    } catch (err) {
      const status = err?.response?.status;
      const backendError =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Unknown moderation failure';

      let markerText = 'marker_unavailable';
      try {
        const marker = await feedbackService.getMarker(true);
        markerText = `${marker.marker || 'n/a'}@${marker.request_host || 'n/a'}#${marker.commit || 'unknown'}`;
      } catch {
        // best effort only
      }

      throw new Error(
        `status=${status || 'n/a'} | api=${API_BASE_URL} | backend=${markerText} | detail=${backendError}`
      );
    }
  },

  restoreReview: async (reviewId, note = "") => {
    const response = await api.post(`${API_PATH}/${reviewId}/restore`, { note });
    return response.data;
  },

  getReviewTimeline: async (reviewId) => {
    const response = await api.get(`${API_PATH}/${reviewId}/timeline`);
    return response.data;
  },

  submitReview: async (reviewData) => {
    const response = await api.post(`${API_PATH}/submit`, reviewData);
    return response.data;
  }
};
