import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const adminAnnouncementApi = {
    getAll: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/admin/announcements/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('neuronest_token')}` }
        });
        return response.data;
    },
    create: async (data) => {
        const response = await axios.post(`${API_BASE_URL}/api/admin/announcements/`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('neuronest_token')}` }
        });
        return response.data;
    },
    update: async (id, data) => {
        const response = await axios.put(`${API_BASE_URL}/api/admin/announcements/${id}`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('neuronest_token')}` }
        });
        return response.data;
    },
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/api/admin/announcements/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('neuronest_token')}` }
        });
        return response.data;
    },
    updateStatus: async (id, status) => {
        const response = await axios.patch(`${API_BASE_URL}/api/admin/announcements/${id}/status`, { status }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('neuronest_token')}` }
        });
        return response.data;
    }
};

const userAnnouncementApi = {
    getMine: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/announcements/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('neuronest_token')}` }
        });
        return response.data;
    },
    markRead: async (id) => {
        const response = await axios.post(`${API_BASE_URL}/api/announcements/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('neuronest_token')}` }
        });
        return response.data;
    },
    acknowledge: async (id) => {
        const response = await axios.post(`${API_BASE_URL}/api/announcements/${id}/acknowledge`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('neuronest_token')}` }
        });
        return response.data;
    }
};

export { adminAnnouncementApi, userAnnouncementApi };
