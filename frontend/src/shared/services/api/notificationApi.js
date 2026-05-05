import axios from 'axios';
import { API_BASE_URL } from '../../../config/env';

export const notificationApi = {
    getNotifications: async (unreadOnly = false) => {
        const token = localStorage.getItem('neuronest_token');
        const response = await axios.get(`${API_BASE_URL}/api/profile/notifications?unread_only=${unreadOnly}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    markAsRead: async (id) => {
        const token = localStorage.getItem('neuronest_token');
        const response = await axios.patch(`${API_BASE_URL}/api/profile/notifications/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    markAsResolved: async (id) => {
        const token = localStorage.getItem('neuronest_token');
        const response = await axios.patch(`${API_BASE_URL}/api/profile/notifications/${id}/resolve`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    markAllAsRead: async () => {
        const token = localStorage.getItem('neuronest_token');
        const response = await axios.patch(`${API_BASE_URL}/api/profile/notifications/read-all`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    deleteNotification: async (id) => {
        const token = localStorage.getItem('neuronest_token');
        const response = await axios.delete(`${API_BASE_URL}/api/profile/notifications/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
