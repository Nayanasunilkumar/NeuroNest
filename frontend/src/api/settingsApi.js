import axios from 'axios';
import { API_BASE_URL } from '../config/env';

export const adminSettingsApi = {
    getAllSettings: async (group = '') => {
        const token = localStorage.getItem('neuronest_token');
        const url = group ? `${API_BASE_URL}/api/admin/settings?group=${group}` : `${API_BASE_URL}/api/admin/settings`;
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateSettings: async (settingsData) => {
        const token = localStorage.getItem('neuronest_token');
        const response = await axios.put(`${API_BASE_URL}/api/admin/settings/batch`, settingsData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
