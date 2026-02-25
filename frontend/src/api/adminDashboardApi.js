import axios from 'axios';
import { API_BASE_URL } from '../config/env';

export const adminDashboardApi = {
    getDashboardSummary: async () => {
        const token = localStorage.getItem('neuronest_token');
        const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
